import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  // Without a timeout, a sleeping or slow backend leaves the UI stuck on
  // "loading" indefinitely.
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem("adyoolau_user");
    const token = stored ? JSON.parse(stored)?.token : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // Corrupted storage: send the request without a token instead of
    // throwing and failing every call.
  }
  return config;
});

export default api;