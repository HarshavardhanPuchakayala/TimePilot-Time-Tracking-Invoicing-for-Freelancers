import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getInvoices,
  markInvoicePaid,
  downloadInvoicePdf,
} from "../api/invoices";

const Invoices = () => {
  const location = useLocation();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState(null);

  const message = location.state?.message;

  // Fetch invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await getInvoices();

        setInvoices(response.data.invoices);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load invoices"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Mark invoice as paid
  const handleMarkAsPaid = async (invoiceId) => {
    setPayingId(invoiceId);
    setError("");

    try {
      await markInvoicePaid(invoiceId);

      // Update only the invoice that was paid
      setInvoices((prevInvoices) =>
        prevInvoices.map((invoice) =>
          invoice._id === invoiceId
            ? { ...invoice, status: "paid" }
            : invoice
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to mark invoice as paid"
      );
    } finally {
      setPayingId(null);
    }
  };

  // Download invoice PDF
  const handleDownloadPdf = async (invoiceId) => {
    try {
      const response = await downloadInvoicePdf(invoiceId);

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to download invoice PDF"
      );
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Invoices</h1>

      {/* Success message from InvoiceBuilder */}
      {message && (
        <div className="rounded border border-green-300 bg-green-50 p-3 text-green-600">
          {message}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-red-600">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && <div>Loading invoices...</div>}

      {/* Empty state */}
      {!loading && !error && invoices.length === 0 && (
        <div className="rounded-lg border p-6 text-gray-500">
          No invoices yet.
        </div>
      )}

      {/* Invoice list */}
      {!loading && invoices.length > 0 && (
        <div className="space-y-4">
          {invoices.map((invoice) => {
            const isPaid = invoice.status === "paid";

            return (
              <div
                key={invoice._id}
                className="rounded-lg border p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* Invoice information */}
                  <div className="space-y-1">
                    <h2 className="font-semibold">
                      Invoice #
                      {invoice._id.slice(-8)}
                    </h2>

                    <p className="text-gray-600">
                      Client:{" "}
                      {invoice.client?.name ||
                        "Unknown client"}
                    </p>

                    <p>
                      Total:{" "}
                      <span className="font-semibold">
                        $
                        {Number(
                          invoice.totalAmount || 0
                        ).toFixed(2)}
                      </span>
                    </p>

                    <p className="text-sm text-gray-500">
                      Due:{" "}
                      {invoice.dueDate
                        ? new Date(
                            invoice.dueDate
                          ).toLocaleDateString()
                        : "No due date"}
                    </p>
                  </div>

                  {/* Status + buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        isPaid
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {invoice.status?.toUpperCase()}
                    </span>

                    {!isPaid && (
                      <button
                        type="button"
                        onClick={() =>
                          handleMarkAsPaid(invoice._id)
                        }
                        disabled={
                          payingId === invoice._id
                        }
                        className="rounded bg-green-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                      >
                        {payingId === invoice._id
                          ? "Updating..."
                          : "Mark as Paid"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadPdf(invoice._id)
                      }
                      className="rounded bg-blue-600 px-4 py-2 text-sm text-white"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Invoices;