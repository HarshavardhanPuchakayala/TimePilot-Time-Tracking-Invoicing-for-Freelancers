import { useEffect, useState } from "react";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../api/projects";
import { getClients } from "../api/clients";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  // Create form
  const [name, setName] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [clientId, setClientId] = useState("");

  // Edit form
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editHourlyRate, setEditHourlyRate] = useState("");
  const [editClientId, setEditClientId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch projects and clients
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResponse, clientsResponse] =
          await Promise.all([
            getProjects(),
            getClients(),
          ]);

        setProjects(projectsResponse.data.projects);
        setClients(clientsResponse.data.clients);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load projects"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create project
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    if (!clientId) {
      setError("Please select a client");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const response = await createProject({
        name,
        hourlyRate: Number(hourlyRate),
        clientId,
      });

      setProjects((prev) => [
        response.data.project,
        ...prev,
      ]);

      setName("");
      setHourlyRate("");
      setClientId("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create project"
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Start editing
  const handleEditStart = (project) => {
    setEditingId(project._id);
    setEditName(project.name || "");
    setEditHourlyRate(project.hourlyRate ?? "");
    setEditClientId(
      project.client?._id || project.client || ""
    );
    setError("");
  };

  // Cancel editing
  const handleEditCancel = () => {
    setEditingId(null);
    setEditName("");
    setEditHourlyRate("");
    setEditClientId("");
  };

  // Save project
  const handleEditSave = async (id) => {
    if (!editName.trim()) {
      setError("Project name is required");
      return;
    }

    if (!editClientId) {
      setError("Please select a client");
      return;
    }

    setIsEditing(true);
    setError("");

    try {
      const response = await updateProject(id, {
        name: editName,
        hourlyRate: Number(editHourlyRate),
        clientId: editClientId,
      });

      setProjects((prev) =>
        prev.map((project) =>
          project._id === id
            ? response.data.project
            : project
        )
      );

      handleEditCancel();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update project"
      );
    } finally {
      setIsEditing(false);
    }
  };

  // Delete project
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    try {
      await deleteProject(id);

      setProjects((prev) =>
        prev.filter((project) => project._id !== id)
      );

      if (editingId === id) {
        handleEditCancel();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete project"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Find client name
  const getClientName = (project) => {
    if (project.client?.name) {
      return project.client.name;
    }

    const client = clients.find(
      (client) =>
        client._id === project.client
    );

    return client?.name || "Unknown client";
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Projects</h1>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-red-600">
          {error}
        </div>
      )}

      {/* Create */}
      <form
        onSubmit={handleCreate}
        className="space-y-3 rounded-lg border p-4"
      >
        <h2 className="text-lg font-semibold">
          Add Project
        </h2>

        <input
          type="text"
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border p-2"
          required
        />

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Hourly rate"
          value={hourlyRate}
          onChange={(e) =>
            setHourlyRate(e.target.value)
          }
          className="w-full rounded border p-2"
        />

        <select
          value={clientId}
          onChange={(e) =>
            setClientId(e.target.value)
          }
          className="w-full rounded border p-2"
          required
        >
          <option value="">Select client</option>

          {clients.map((client) => (
            <option
              key={client._id}
              value={client._id}
            >
              {client.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={isCreating}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {isCreating ? "Creating..." : "Add Project"}
        </button>
      </form>

      {loading && <div>Loading projects...</div>}

      {!loading && projects.length === 0 && (
        <div>No projects yet</div>
      )}

      {!loading && projects.length > 0 && (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project._id}
              className="rounded-lg border p-4 shadow-sm"
            >
              {editingId === project._id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) =>
                      setEditName(e.target.value)
                    }
                    className="w-full rounded border p-2"
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editHourlyRate}
                    onChange={(e) =>
                      setEditHourlyRate(e.target.value)
                    }
                    className="w-full rounded border p-2"
                  />

                  <select
                    value={editClientId}
                    onChange={(e) =>
                      setEditClientId(e.target.value)
                    }
                    className="w-full rounded border p-2"
                  >
                    <option value="">
                      Select client
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

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleEditSave(project._id)
                      }
                      disabled={isEditing}
                      className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
                    >
                      {isEditing
                        ? "Saving..."
                        : "Save"}
                    </button>

                    <button
                      type="button"
                      onClick={handleEditCancel}
                      disabled={isEditing}
                      className="rounded border px-4 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="font-semibold">
                    {project.name}
                  </h2>

                  <p className="text-gray-600">
                    Client: {getClientName(project)}
                  </p>

                  <p className="text-gray-600">
                    Hourly rate: $
                    {Number(
                      project.hourlyRate || 0
                    ).toFixed(2)}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleEditStart(project)
                      }
                      className="rounded bg-gray-700 px-4 py-2 text-sm text-white"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(project._id)
                      }
                      disabled={
                        deletingId === project._id
                      }
                      className="rounded bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                      {deletingId === project._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;