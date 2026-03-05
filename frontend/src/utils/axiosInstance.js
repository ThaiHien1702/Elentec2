import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  withCredentials: true, // Để gửi cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Thêm token vào mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Xử lý errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
