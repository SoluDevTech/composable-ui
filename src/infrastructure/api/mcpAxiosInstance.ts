import axios from "axios";
import { configRepository } from "@/infrastructure/config/configRepositoryInstance";

let cachedMcpBaseURL: string | null = null;

export const mcpApiClient = axios.create({
  timeout: 30000,
});

mcpApiClient.interceptors.request.use(async (config) => {
  if (!cachedMcpBaseURL) {
    const appConfig = await configRepository.getConfig();
    cachedMcpBaseURL = appConfig.mcpApiBaseUrl || appConfig.ragApiBaseUrl || appConfig.apiBaseUrl;
  }
  config.baseURL = cachedMcpBaseURL;
  return config;
});

mcpApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const detail = error.response.data?.detail || error.message;
      return Promise.reject(new Error(detail));
    }
    return Promise.reject(error);
  },
);
