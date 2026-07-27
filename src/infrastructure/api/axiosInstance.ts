import axios from "axios";
import { configRepository } from "@/infrastructure/config/configRepositoryInstance";
import { redirectToSignIn } from "@/infrastructure/auth/oauth2Redirect";

let cachedBaseURL: string | null = null;

export const apiClient = axios.create({
  timeout: 30000,
  withCredentials: true,
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
