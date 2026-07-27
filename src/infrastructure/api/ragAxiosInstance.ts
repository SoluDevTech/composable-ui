import axios from "axios";
import { configRepository } from "@/infrastructure/config/configRepositoryInstance";
import { redirectToSignIn } from "@/infrastructure/auth/oauth2Redirect";

let cachedRagBaseURL: string | null = null;

export const ragApiClient = axios.create({
  timeout: 30000,
  withCredentials: true,
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
