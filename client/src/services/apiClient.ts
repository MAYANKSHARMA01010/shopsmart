import axios from "axios";

const isProd = process.env.NODE_ENV === "production";

const baseURL = isProd
  ? process.env.NEXT_PUBLIC_SERVER_BACKEND_URL || "/api" // In prod, it might be proxied or a full URL
  : process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL || "http://localhost:5001/api";

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
