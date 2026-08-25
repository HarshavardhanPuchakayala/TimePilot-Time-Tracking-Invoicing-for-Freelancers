import express from "express";
import protect from "../middleware/auths.js";

import {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
} from "../controllers/clientController.js";

const router = express.Router();

router.post("/", protect, createClient);
router.get("/", protect, getClients);
router.get("/:id", protect, getClient);
router.patch("/:id", protect, updateClient);
router.delete("/:id", protect, deleteClient);

export default router;