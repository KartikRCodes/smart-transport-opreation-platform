import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("transitops_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem("transitops_token");
      localStorage.removeItem("transitops_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    if (status === 403) {
      console.warn("Forbidden: Insufficient role permissions.");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;