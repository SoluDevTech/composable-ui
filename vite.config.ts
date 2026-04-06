import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(() => ({
  server: {
    host: "localhost",
    port: 8030,
    proxy: {
      "/api": {
        target: "http://localhost:8010",
        changeOrigin: true,
      },
      "/api/v1/ws": {
        target: "ws://localhost:8010",
        ws: true,
      },
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
