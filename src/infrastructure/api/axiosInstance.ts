import axios from "axios";
import { configRepository } from "@/infrastructure/config/configRepositoryInstance";

let cachedBaseURL: string | null = null;

export const apiClient = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  if (!cachedBaseURL) {
    const appConfig = await configRepository.getConfig();
    cachedBaseURL = appConfig.apiBaseUrl;
  }
  config.baseURL = cachedBaseURL;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const detail = error.response.data?.detail || error.message;
      const wrapped = new Error(detail) as Error & { status?: number };
      wrapped.status = error.response.status;
      return Promise.reject(wrapped);
    }
    return Promise.reject(error);
  },
);
