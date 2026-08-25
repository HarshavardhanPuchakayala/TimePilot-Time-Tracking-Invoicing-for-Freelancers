import TimeSession from "../models/TimeSession.js";
import Project from "../models/project.js";

// Create TimeSession
const createTimeSession = async (req, res) => {
  try {
    const {
      projectId,
      entryType,
      start,
      end,
      hours,
      notes,
    } = req.body;

    if (!projectId || !entryType) {
      return res.status(400).json({
        message: "Project and entry type are required",
      });
    }

    // Verify project belongs to logged-in user
    const project = await Project.findOne({
      _id: projectId,
      owner: req.userId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const timeSession = await TimeSession.create({
      project: projectId,
      owner: req.userId,
      entryType,
      start,
      end,
      hours,
      notes,
    });

    res.status(201).json({
      message: "Time session created",
      timeSession,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all TimeSessions
const getTimeSessions = async (req, res) => {
  try {
    const filter = {
      owner: req.userId,
    };

    // Optional project filter:
    // GET /api/time-sessions?projectId=PROJECT_ID
    if (req.query.projectId) {
      filter.project = req.query.projectId;
    }

    const timeSessions = await TimeSession.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      timeSessions,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get one TimeSession
const getTimeSession = async (req, res) => {
  try {
    const timeSession = await TimeSession.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!timeSession) {
      return res.status(404).json({
        message: "Time session not found",
      });
    }

    res.status(200).json({
      timeSession,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update TimeSession
const updateTimeSession = async (req, res) => {
  try {
    const timeSession = await TimeSession.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!timeSession) {
      return res.status(404).json({
        message: "Time session not found",
      });
    }

    // Billed sessions cannot be changed
    if (timeSession.billed) {
      return res.status(400).json({
        message: "Billed time sessions cannot be modified",
      });
    }

    const {
      entryType,
      start,
      end,
      hours,
      notes,
      projectId,
    } = req.body;

    // If project is changed, verify ownership
    if (projectId) {
      const project = await Project.findOne({
        _id: projectId,
        owner: req.userId,
      });

      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      timeSession.project = projectId;
    }

    if (entryType !== undefined) {
      timeSession.entryType = entryType;
    }

    if (start !== undefined) {
      timeSession.start = start;
    }

    if (end !== undefined) {
      timeSession.end = end;
    }

    if (hours !== undefined) {
      timeSession.hours = hours;
    }

    if (notes !== undefined) {
      timeSession.notes = notes;
    }

    // .save() is important because it triggers the pre-save hook
    await timeSession.save();

    res.status(200).json({
      message: "Time session updated",
      timeSession,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete TimeSession
const deleteTimeSession = async (req, res) => {
  try {
    const timeSession = await TimeSession.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!timeSession) {
      return res.status(404).json({
        message: "Time session not found",
      });
    }

    // Billed sessions cannot be deleted
    if (timeSession.billed) {
      return res.status(400).json({
        message: "Billed time sessions cannot be deleted",
      });
    }

    await timeSession.deleteOne();

    res.status(200).json({
      message: "Time session deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  createTimeSession,
  getTimeSessions,
  getTimeSession,
  updateTimeSession,
  deleteTimeSession,
};