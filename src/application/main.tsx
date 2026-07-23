import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App";
import "./index.css";
import { useSettingsStore } from "./stores/useSettingsStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppToaster() {
  const theme = useSettingsStore((s) => s.theme);
  return <Toaster position="bottom-right" theme={theme} duration={2500} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <AppToaster />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
