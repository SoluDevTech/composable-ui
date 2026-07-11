import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ChatPage from "@/application/pages/ChatPage";

// Lazy-load secondary routes for code-splitting / smaller initial bundle.
const AgentsPage = lazy(() => import("@/application/pages/AgentsPage"));
const RagPage = lazy(() => import("@/application/pages/RagPage"));

function PageFallback() {
  return (
    <div
      className="flex-1 flex items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <p className="text-on-surface-variant text-sm">Loading…</p>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/agents" element={<AgentsPage />} />
      <Route path="/chat/:threadId?" element={<ChatPage />} />
      <Route path="/rag" element={<RagPage />} />
    </Routes>
  );
}

export default function AppRoot() {
  return (
    <Suspense fallback={<PageFallback />}>
      <App />
    </Suspense>
  );
}