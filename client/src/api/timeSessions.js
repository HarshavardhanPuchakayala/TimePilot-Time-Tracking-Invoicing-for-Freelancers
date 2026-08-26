import api from "./axios";

export const getTimeSessions = () =>
  api.get("/time-sessions");

export const createTimeSession = (data) =>
  api.post("/time-sessions", data);

export const updateTimeSession = (id, data) =>
  api.patch(`/time-sessions/${id}`, data);

export const deleteTimeSession = (id) =>
  api.delete(`/time-sessions/${id}`);