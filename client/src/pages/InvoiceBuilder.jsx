import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getClients } from "../api/clients";
import {
  getUnbilledSummary,
  createInvoice,
} from "../api/invoices";

const InvoiceBuilder = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [dueDate, setDueDate] = useState("");

  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await getClients();
        setClients(response.data.clients);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load clients"
        );
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    if (!clientId) {
      setSessions([]);
      setSelectedIds([]);
      return;
    }

    const fetchUnbilledSessions = async () => {
      setLoadingSessions(true);
      setError("");
      setSelectedIds([]);

      try {
        const response = await getUnbilledSummary(clientId);
        setSessions(response.data.sessions);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load unbilled sessions"
        );
        setSessions([]);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchUnbilledSessions();
  }, [clientId]);

  const handleCheckboxChange = (sessionId) => {
    setSelectedIds((prevIds) => {
      if (prevIds.includes(sessionId)) {
        return prevIds.filter((id) => id !== sessionId);
      }

      return [...prevIds, sessionId];
    });
  };

  const selectedSessions = sessions.filter((session) =>
    selectedIds.includes(session.id)
  );

  const total = selectedSessions.reduce(
    (sum, session) =>
      sum + Number(session.estimatedAmount || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedIds.length === 0) {
      setError("Please select at least one session.");
      return;
    }

    if (!dueDate) {
      setError("Please select a due date.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await createInvoice({
        clientId,
        timeSessionIds: selectedIds,
        dueDate,
      });

      console.log("Created invoice:", response.data);

      // Navigate and pass the success message
      navigate("/invoices", {
        state: {
          message: "Invoice generated successfully!",
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to generate invoice"
      );

      // Keep selectedIds intact so the user can retry
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">
        Create Invoice
      </h1>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="font-medium">
          Client
        </label>

        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          disabled={loadingClients || isSubmitting}
          className="w-full rounded border p-2"
        >
          <option value="">
            {loadingClients
              ? "Loading clients..."
              : "Select a client"}
          </option>

          {clients.map((client) => (
            <option
              key={client._id}
              value={client._id}
            >
              {client.name}
            </option>
          ))}
        </select>
      </div>

      {loadingSessions && (
        <div className="text-gray-500">
          Loading unbilled sessions...
        </div>
      )}

      {!loadingSessions &&
        clientId &&
        sessions.length === 0 && (
          <div className="rounded border p-4 text-gray-500">
            No unbilled sessions for this client.
          </div>
        )}

      {!loadingSessions && sessions.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              Unbilled Sessions
            </h2>

            {sessions.map((session) => {
              const sessionId = session.id;
              const isSelected =
                selectedIds.includes(sessionId);

              return (
                <div
                  key={sessionId}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <input
                    id={`session-${sessionId}`}
                    type="checkbox"
                    checked={isSelected}
                    onChange={() =>
                      handleCheckboxChange(sessionId)
                    }
                    disabled={isSubmitting}
                  />

                  <label
                    htmlFor={`session-${sessionId}`}
                    className="flex flex-1 cursor-pointer items-center gap-4"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">
                        {session.project?.name ||
                          session.projectName ||
                          "Unknown project"}
                      </p>

                      <p className="text-sm text-gray-600">
                        Hours: {session.hours}
                      </p>
                    </div>

                    <div className="font-medium">
                      $
                      {Number(
                        session.estimatedAmount || 0
                      ).toFixed(2)}
                    </div>
                  </label>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <label className="font-medium">
              Due Date
            </label>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded border p-2"
            />
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {selectedIds.length} session
              {selectedIds.length !== 1 ? "s" : ""} selected
            </p>

            <button
              type="submit"
              disabled={
                selectedIds.length === 0 ||
                !dueDate ||
                isSubmitting
              }
              className="mt-4 w-full rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Generating Invoice..."
                : "Generate Invoice"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default InvoiceBuilder;