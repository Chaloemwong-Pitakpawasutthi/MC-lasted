// src/api.js
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default {
  BASE: API_BASE,
  withCreds: {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  },
};
