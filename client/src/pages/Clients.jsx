import { useEffect, useState } from "react";
import { getClients } from "../api/clients";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await getClients();
        setClients(response.data.clients);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load clients"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Clients</h1>

      {loading && <div>Loading...</div>}

      {error && (
        <div className="text-red-500">{error}</div>
      )}

      {!loading && !error && clients.length === 0 && (
        <div>No clients yet</div>
      )}

      {!loading && !error && clients.length > 0 && (
        <div className="space-y-3">
          {clients.map((client) => (
            <div
              key={client._id}
              className="rounded-lg border p-4 shadow-sm"
            >
              <h2 className="font-semibold">{client.name}</h2>
              <p className="text-gray-600">{client.email}</p>
              <p className="text-gray-500">{client.company}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Clients;