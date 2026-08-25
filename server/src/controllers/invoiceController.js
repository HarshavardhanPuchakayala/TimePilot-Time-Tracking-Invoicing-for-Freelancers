import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Client from "../models/Client.js";
import TimeSession from "../models/TimeSession.js";
import Project from "../models/project.js";

// CREATE INVOICE
const createInvoice = async (req, res) => {
  try {
    const { clientId, timeSessionIds, dueDate } = req.body;

    if (
      !clientId ||
      !Array.isArray(timeSessionIds) ||
      timeSessionIds.length === 0 ||
      !dueDate
    ) {
      return res.status(400).json({
        message:
          "clientId, timeSessionIds and dueDate are required",
      });
    }

    const uniqueIds = [...new Set(timeSessionIds)];

    if (uniqueIds.length !== timeSessionIds.length) {
      return res.status(400).json({
        message: "Duplicate time session IDs are not allowed",
      });
    }

    const client = await Client.findOne({
      _id: clientId,
      owner: req.userId,
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    const timeSessions = await TimeSession.find({
      _id: { $in: timeSessionIds },
      owner: req.userId,
      billed: false,
    }).populate("project");

    if (timeSessions.length !== timeSessionIds.length) {
      return res.status(400).json({
        message:
          "One or more time sessions are invalid, already billed, or not owned by you",
      });
    }

    for (const session of timeSessions) {
      if (
        !session.project ||
        session.project.client.toString() !== clientId.toString()
      ) {
        return res.status(400).json({
          message:
            "All time sessions must belong to the selected client",
        });
      }
    }

    let totalAmount = 0;

    for (const session of timeSessions) {
      totalAmount +=
        session.hours * session.project.hourlyRate;
    }

    const dbSession = await mongoose.startSession();

    try {
      dbSession.startTransaction();

      const [invoice] = await Invoice.create(
        [
          {
            client: clientId,
            owner: req.userId,
            timeSessions: timeSessionIds,
            totalAmount,
            status: "unpaid",
            dueDate,
          },
        ],
        { session: dbSession }
      );

      const result = await TimeSession.updateMany(
        {
          _id: { $in: timeSessionIds },
          owner: req.userId,
          billed: false,
        },
        {
          $set: {
            billed: true,
            invoice: invoice._id,
          },
        },
        { session: dbSession }
      );

      if (result.modifiedCount !== timeSessionIds.length) {
        throw new Error(
          "One or more sessions were billed by another request. Invoice creation aborted."
        );
      }

      await dbSession.commitTransaction();

      return res.status(201).json({
        message: "Invoice created successfully",
        invoice,
      });
    } catch (error) {
      await dbSession.abortTransaction();
      throw error;
    } finally {
      dbSession.endSession();
    }
  } catch (error) {
    console.error("Create invoice error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL INVOICES
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({
      owner: req.userId,
    })
      .populate("client", "name email company")
      .sort({ createdAt: -1 });

    res.status(200).json({
      invoices,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE INVOICE
const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      owner: req.userId,
    })
      .populate("client", "name email company")
      .populate("timeSessions");

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET UNBILLED SUMMARY
const getUnbilledSummary = async (req, res) => {
  try {
    const { clientId } = req.query;

    let projectFilter = {};

    if (clientId) {
      const client = await Client.findOne({
        _id: clientId,
        owner: req.userId,
      });

      if (!client) {
        return res.status(404).json({
          message: "Client not found",
        });
      }

      projectFilter.client = clientId;
    }

    const projects = await Project.find({
      owner: req.userId,
      ...projectFilter,
    }).select("_id name hourlyRate client");

    const projectIds = projects.map((project) => project._id);

    const sessions = await TimeSession.find({
      owner: req.userId,
      billed: false,
      project: { $in: projectIds },
    })
      .populate("project")
      .sort({ createdAt: -1 });

    const summary = sessions.map((session) => ({
      id: session._id,
      project: session.project,
      hours: session.hours,
      estimatedAmount:
        session.hours * session.project.hourlyRate,
      start: session.start,
      end: session.end,
      notes: session.notes,
    }));

    res.status(200).json({
      sessions: summary,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// MARK INVOICE AS PAID
const markInvoicePaid = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.userId,
      },
      {
        status: "paid",
      },
      {
        new: true,
      }
    );

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      message: "Invoice marked as paid",
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  createInvoice,
  getInvoices,
  getInvoice,
  getUnbilledSummary,
  markInvoicePaid,
};