import axios from "axios";
import { configRepository } from "@/infrastructure/config/configRepositoryInstance";

let cachedRagBaseURL: string | null = null;

export const ragApiClient = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

ragApiClient.interceptors.request.use(async (config) => {
  if (!cachedRagBaseURL) {
    const appConfig = await configRepository.getConfig();
    cachedRagBaseURL = appConfig.ragApiBaseUrl || appConfig.apiBaseUrl;
  }
  config.baseURL = cachedRagBaseURL;
  return config;
});

ragApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const detail = error.response.data?.detail || error.message;
      return Promise.reject(new Error(detail));
    }
    return Promise.reject(error);
  },
);
