import Client from "../models/Client.js";

const createClient = async (req, res) => {
  try {
    const { name, email, phone, company, address } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Client name is required",
      });
    }

    const client = await Client.create({
      name,
      email,
      phone,
      company,
      address,
      owner: req.userId,
    });

    res.status(201).json({ client });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getClients = async (req, res) => {
  try {
    const clients = await Client.find({
      owner: req.userId,
    });

    res.status(200).json({ clients });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    res.status(200).json({ client });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
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

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    res.status(200).json({ client });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    res.status(200).json({
      message: "Client deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
};