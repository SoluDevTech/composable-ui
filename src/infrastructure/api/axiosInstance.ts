import axios from "axios";
import { envConfig } from "@/infrastructure/config/envConfig";

export const apiClient = axios.create({
  baseURL: envConfig.apiBaseUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const detail = error.response.data?.detail || error.message;
      return Promise.reject(new Error(detail));
    }
    return Promise.reject(error);
  },
);
