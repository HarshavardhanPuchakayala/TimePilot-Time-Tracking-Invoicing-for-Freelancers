import express from "express";
import  protect  from "../middleware/auths.js";

import {
  createInvoice,
  getInvoices,
  getInvoice,
  getUnbilledSummary,
  markInvoicePaid,
} from "../controllers/invoiceController.js";

const router = express.Router();

router.post("/", protect, createInvoice);
router.get("/", protect, getInvoices);

// IMPORTANT: specific route before /:id
router.get("/unbilled-summary", protect, getUnbilledSummary);

router.get("/:id", protect, getInvoice);
router.patch("/:id/mark-paid", protect, markInvoicePaid);

export default router;