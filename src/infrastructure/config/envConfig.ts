export const envConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8010",
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8010",
};
