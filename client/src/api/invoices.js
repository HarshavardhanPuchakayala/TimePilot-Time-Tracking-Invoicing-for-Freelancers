import api from "./axios";

export const getUnbilledSummary = (clientId) =>
  api.get(`/invoices/unbilled-summary?clientId=${clientId}`);

export const createInvoice = (data) =>
  api.post("/invoices", data);

export const getInvoices = () =>
  api.get("/invoices");

export const markInvoicePaid = (id) =>
  api.patch(`/invoices/${id}/mark-paid`);

export const downloadInvoicePdf = (id) =>
  api.get(`/invoices/${id}/pdf`, { responseType: "blob" });