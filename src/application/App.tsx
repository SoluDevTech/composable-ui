import { Routes, Route, Navigate } from "react-router-dom";
import AgentsPage from "@/application/pages/AgentsPage";
import ChatPage from "@/application/pages/ChatPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/agents" element={<AgentsPage />} />
      <Route path="/chat/:threadId?" element={<ChatPage />} />
    </Routes>
  );
}

export default App;
