import { useEffect, useState } from "react";
import {
  getTimeSessions,
  createTimeSession,
  updateTimeSession,
  deleteTimeSession,
} from "../api/timeSessions";
import { getProjects } from "../api/projects";

const TimeSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [projects, setProjects] = useState([]);

  // Create form
  const [projectId, setProjectId] = useState("");
  const [hours, setHours] = useState("");

  // Edit form
  const [editingId, setEditingId] = useState(null);
  const [editProjectId, setEditProjectId] = useState("");
  const [editHours, setEditHours] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editEntryType, setEditEntryType] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch sessions and projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsResponse, projectsResponse] =
          await Promise.all([
            getTimeSessions(),
            getProjects(),
          ]);

        setSessions(sessionsResponse.data.timeSessions);
        setProjects(projectsResponse.data.projects);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load time sessions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create manual session
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!projectId) {
      setError("Please select a project");
      return;
    }

    if (!hours || Number(hours) <= 0) {
      setError("Hours must be greater than zero");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const response = await createTimeSession({
        projectId,
        hours: Number(hours),
        entryType: "manual",
      });

      setSessions((prev) => [
        response.data.timeSession,
        ...prev,
      ]);

      setProjectId("");
      setHours("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create time session"
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Start editing
  const handleEditStart = (session) => {
    if (session.billed) return;

    setEditingId(session._id);
    setEditProjectId(
      session.project?._id ||
        session.project ||
        ""
    );
    setEditEntryType(session.entryType);

    if (session.entryType === "manual") {
      setEditHours(session.hours ?? "");
    } else {
      setEditStart(
        session.start
          ? formatDateTimeLocal(session.start)
          : ""
      );

      setEditEnd(
        session.end
          ? formatDateTimeLocal(session.end)
          : ""
      );
    }

    setError("");
  };

  // Convert ISO date to datetime-local value
  const formatDateTimeLocal = (date) => {
    const d = new Date(date);

    const offset =
      d.getTimezoneOffset() * 60000;

    return new Date(d.getTime() - offset)
      .toISOString()
      .slice(0, 16);
  };

  // Cancel editing
  const handleEditCancel = () => {
    setEditingId(null);
    setEditProjectId("");
    setEditHours("");
    setEditStart("");
    setEditEnd("");
    setEditEntryType("");
  };

  // Save edit
  const handleEditSave = async (id) => {
    setIsEditing(true);
    setError("");

    try {
      let data = {
        projectId: editProjectId,
      };

      if (editEntryType === "manual") {
        if (!editHours || Number(editHours) <= 0) {
          setError(
            "Hours must be greater than zero"
          );
          setIsEditing(false);
          return;
        }

        data.hours = Number(editHours);
      } else {
        if (!editStart || !editEnd) {
          setError(
            "Start and end times are required"
          );
          setIsEditing(false);
          return;
        }

        data.start = new Date(editStart).toISOString();
        data.end = new Date(editEnd).toISOString();
      }

      const response = await updateTimeSession(
        id,
        data
      );

      setSessions((prev) =>
        prev.map((session) =>
          session._id === id
            ? response.data.timeSession
            : session
        )
      );

      handleEditCancel();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update time session"
      );
    } finally {
      setIsEditing(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    const session = sessions.find(
      (item) => item._id === id
    );

    if (session?.billed) {
      setError(
        "Billed time sessions cannot be deleted"
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this time session?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    try {
      await deleteTimeSession(id);

      setSessions((prev) =>
        prev.filter(
          (session) => session._id !== id
        )
      );

      if (editingId === id) {
        handleEditCancel();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete time session"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Project name lookup
  const getProjectName = (session) => {
    if (session.project?.name) {
      return session.project.name;
    }

    const project = projects.find(
      (project) =>
        project._id === session.project
    );

    return project?.name || "Unknown project";
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">
        Time Sessions
      </h1>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-red-600">
          {error}
        </div>
      )}

      {/* Create manual entry */}
      <form
        onSubmit={handleCreate}
        className="space-y-3 rounded-lg border p-4"
      >
        <h2 className="text-lg font-semibold">
          Add Manual Time
        </h2>

        <select
          value={projectId}
          onChange={(e) =>
            setProjectId(e.target.value)
          }
          className="w-full rounded border p-2"
          required
        >
          <option value="">
            Select project
          </option>

          {projects.map((project) => (
            <option
              key={project._id}
              value={project._id}
            >
              {project.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Hours"
          value={hours}
          onChange={(e) =>
            setHours(e.target.value)
          }
          className="w-full rounded border p-2"
          required
        />

        <button
          type="submit"
          disabled={isCreating}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {isCreating
            ? "Adding..."
            : "Add Time"}
        </button>
      </form>

      {loading && (
        <div>Loading time sessions...</div>
      )}

      {!loading && sessions.length === 0 && (
        <div>No time sessions yet</div>
      )}

      {!loading && sessions.length > 0 && (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="rounded-lg border p-4 shadow-sm"
            >
              {editingId === session._id ? (
                <div className="space-y-3">
                  {/* Project */}
                  <select
                    value={editProjectId}
                    onChange={(e) =>
                      setEditProjectId(
                        e.target.value
                      )
                    }
                    className="w-full rounded border p-2"
                  >
                    <option value="">
                      Select project
                    </option>

                    {projects.map((project) => (
                      <option
                        key={project._id}
                        value={project._id}
                      >
                        {project.name}
                      </option>
                    ))}
                  </select>

                  {/* Manual fields */}
                  {editEntryType === "manual" && (
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={editHours}
                      onChange={(e) =>
                        setEditHours(e.target.value)
                      }
                      className="w-full rounded border p-2"
                      placeholder="Hours"
                    />
                  )}

                  {/* Timer fields */}
                  {editEntryType === "timer" && (
                    <>
                      <div>
                        <label className="mb-1 block text-sm">
                          Start
                        </label>

                        <input
                          type="datetime-local"
                          value={editStart}
                          onChange={(e) =>
                            setEditStart(
                              e.target.value
                            )
                          }
                          className="w-full rounded border p-2"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm">
                          End
                        </label>

                        <input
                          type="datetime-local"
                          value={editEnd}
                          onChange={(e) =>
                            setEditEnd(
                              e.target.value
                            )
                          }
                          className="w-full rounded border p-2"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleEditSave(
                          session._id
                        )
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
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold">
                        {getProjectName(session)}
                      </h2>

                      <p className="text-gray-600">
                        Type:{" "}
                        {session.entryType}
                      </p>

                      <p className="text-gray-600">
                        Hours:{" "}
                        {Number(
                          session.hours || 0
                        ).toFixed(2)}
                      </p>

                      <p className="text-gray-500">
                        Billed:{" "}
                        {session.billed
                          ? "Yes"
                          : "No"}
                      </p>
                    </div>

                    {session.billed && (
                      <span className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-600">
                        Locked
                      </span>
                    )}
                  </div>

                  {/* Only show actions for unbilled sessions */}
                  {!session.billed && (
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleEditStart(
                            session
                          )
                        }
                        className="rounded bg-gray-700 px-4 py-2 text-sm text-white"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            session._id
                          )
                        }
                        disabled={
                          deletingId ===
                          session._id
                        }
                        className="rounded bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                      >
                        {deletingId ===
                        session._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeSessions;