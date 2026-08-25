import Project from "../models/project.js";
import Client from "../models/Client.js";

const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      hourlyRate,
      status,
      clientId,
    } = req.body;

    if (!name || hourlyRate === undefined || !clientId) {
      return res.status(400).json({
        message: "Name, hourlyRate and clientId are required",
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

    const project = await Project.create({
      name,
      description,
      hourlyRate,
      status,
      client: clientId,
      owner: req.userId,
    });

    res.status(201).json({ project });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      owner: req.userId,
    });

    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.userId,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};