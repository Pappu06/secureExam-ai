import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});


// ── Request Interceptor ──────────────────────────────────
// Automatically attach Authorization header if token exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// ── Response Interceptor ─────────────────────────────────
// On 401 responses, clear auth state and redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response && error.response.status === 401) {

      // Don't redirect if we're already on auth routes
      const isAuthRoute =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/register") ||
        error.config?.url?.includes("/auth/me") ||
        error.config?.url?.includes("/auth/send-otp") ||
        error.config?.url?.includes("/auth/verify-otp");

      if (!isAuthRoute) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to login — uses window.location to work
        // outside of React's router context
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);


export default API;