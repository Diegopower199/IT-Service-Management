import axios from "axios";
import { API_URL_BACK_END } from "./env";

const api = axios.create({
  baseURL: API_URL_BACK_END,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    const isAuthEndpoint = config.url?.includes("/auth/login");

    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;
