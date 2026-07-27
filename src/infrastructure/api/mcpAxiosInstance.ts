import axios from "axios";
import { configRepository } from "@/infrastructure/config/configRepositoryInstance";
import { redirectToSignIn } from "@/infrastructure/auth/oauth2Redirect";

let cachedMcpBaseURL: string | null = null;

export const mcpApiClient = axios.create({
  timeout: 30000,
  withCredentials: true,
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
    if (error.response?.status === 401) {
      redirectToSignIn();
    }
    if (error.response) {
      const detail = error.response.data?.detail || error.message;
      const wrapped = new Error(detail) as Error & { status?: number };
      wrapped.status = error.response.status;
      return Promise.reject(wrapped);
    }
    return Promise.reject(error);
  },
);
