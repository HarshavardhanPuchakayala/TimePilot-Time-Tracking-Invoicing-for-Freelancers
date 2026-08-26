import { useEffect, useState } from "react";
import { createTimeSession } from "../api/timeSessions";

const formatTimer = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

const TimerWidget = ({ projects = [], onSessionCreated }) => {
  const [projectId, setProjectId] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      setSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  const handleStart = () => {
    if (!projectId) return;

    setError("");
    setStartTime(new Date());
    setSeconds(0);
    setIsRunning(true);
  };

  const handleStop = async () => {
    if (!startTime || !projectId) return;

    const endTime = new Date();

    setIsSaving(true);
    setError("");

    try {
const response = await createTimeSession({
  projectId,
  entryType: "timer",
  start: startTime,
  end: endTime,
});

console.log(response.data);

      setIsRunning(false);
      setSeconds(0);
      setStartTime(null);

      if (onSessionCreated) {
        onSessionCreated(response.data.timeSession);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save time session. Your timer has not been reset."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-6">
      <h2 className="text-xl font-semibold">Timer</h2>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <select
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        disabled={isRunning || isSaving}
        className="w-full rounded border p-2"
      >
        <option value="">Select a project</option>

        {projects.map((project) => (
          <option key={project._id} value={project._id}>
            {project.name}
          </option>
        ))}
      </select>

      <div className="text-center font-mono text-4xl">
        {formatTimer(seconds)}
      </div>

      {!isRunning ? (
        <button
          type="button"
          onClick={handleStart}
          disabled={!projectId || isSaving}
          className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          Start
        </button>
      ) : (
        <button
          type="button"
          onClick={handleStop}
          disabled={isSaving}
          className="w-full rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Stop"}
        </button>
      )}
    </div>
  );
};

export default TimerWidget;