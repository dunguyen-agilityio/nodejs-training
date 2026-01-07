import axios from "axios";

// Create axios instance with configuration from environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add headers and handle request errors
api.interceptors.request.use(
  (config) => {
    // Log request for debugging
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle HTTP status codes
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error(`[API Error] ${status}:`, data);

      switch (status) {
        case 400:
          // Bad Request - validation errors
          console.error("Validation Error:", data);
          break;
        case 404:
          // Not Found
          console.error("Resource Not Found:", data);
          break;
        case 500:
          // Internal Server Error
          console.error("Server Error:", data);
          break;
        default:
          console.error("Unexpected Error:", status, data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("[API] No response from server - is the API running?");
    } else {
      // Error in request configuration
      console.error("[API] Request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
