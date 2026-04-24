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
      return Promise.reject(new Error(detail));
    }
    return Promise.reject(error);
  },
);
