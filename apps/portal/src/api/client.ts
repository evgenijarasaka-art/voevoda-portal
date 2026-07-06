import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    //const originalRequest = error.config;

    // if (error.response?.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true;
    //   try {
    //     const refreshToken = useAuthStore.getState().token;
    //     const response = await axios.post(`${API_URL}/auth/refresh/`, {
    //       refresh: refreshToken
    //     });
    //     const { access } = response.data;
    //     useAuthStore.getState().setAuth(useAuthStore.getState().user!, access);
    //     originalRequest.headers.Authorization = `Bearer ${access}`;
    //     return apiClient(originalRequest);
    //   } catch (refreshError) {
    //     useAuthStore.getState().logout();
    //     window.location.href = '/login';
    //     return Promise.reject(refreshError);
    //   }
    // }

    return Promise.reject(error);
  },
);

export default apiClient;
