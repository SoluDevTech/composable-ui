import { screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../utils/render";
import { Route, Routes } from "react-router-dom";
import ChatPage from "@/application/pages/ChatPage";
import { createMessage } from "../../fixtures/external";
import { MessageRole } from "@/domain/entities/chat/message";

vi.mock("@/application/hooks/chat/useThreads", () => ({
  useThreads: () => ({
    data: [
      {
        id: "thread-abc",
        agent_name: "test-agent",
        messages: [],
        created_at: "2026-04-06T10:00:00Z",
        updated_at: "2026-04-06T10:00:00Z",
      },
    ],
    isLoading: false,
  }),
}));

vi.mock("@/application/hooks/chat/useMessages", () => ({
  useMessages: (threadId: string | null) => {
    if (!threadId) return { data: undefined, isLoading: false };
    return {
      data: [
        createMessage({
          role: MessageRole.HUMAN,
          content: "Hello there",
          status: null,
        }),
        createMessage({
          role: MessageRole.AI,
          content: "Hi, how can I help?",
        }),
      ],
      isLoading: false,
    };
  },
}));

vi.mock("@/application/hooks/chat/useStreamChat", () => ({
  useStreamChat: () => ({
    stream: vi.fn(),
    cancel: vi.fn(),
  }),
}));

describe("ChatPage", () => {
  it("shows welcome message when no threadId", () => {
    renderWithProviders(
      <Routes>
        <Route path="/chat" element={<ChatPage />} />
      </Routes>,
      { initialEntries: ["/chat"] },
    );

    expect(
      screen.getByRole("heading", { name: /orchestration console/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/select a thread from the sidebar/i),
    ).toBeInTheDocument();
  });

  it("shows message list when threadId is provided", () => {
    renderWithProviders(
      <Routes>
        <Route path="/chat/:threadId" element={<ChatPage />} />
      </Routes>,
      { initialEntries: ["/chat/thread-abc"] },
    );

    expect(screen.getByText("Hello there")).toBeInTheDocument();
    expect(screen.getByText("Hi, how can I help?")).toBeInTheDocument();
  });
});
