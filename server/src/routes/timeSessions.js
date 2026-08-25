import express from "express";
import protect from "../middleware/auth.js";

import {
  createTimeSession,
  getTimeSessions,
  getTimeSession,
  updateTimeSession,
  deleteTimeSession,
} from "../controllers/timeSessionController.js";

const router = express.Router();

router.post("/", protect, createTimeSession);
router.get("/", protect, getTimeSessions);
router.get("/:id", protect, getTimeSession);
router.patch("/:id", protect, updateTimeSession);
router.delete("/:id", protect, deleteTimeSession);

export default router;