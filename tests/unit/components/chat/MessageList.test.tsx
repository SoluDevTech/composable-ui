import { screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import MessageList from "@/application/components/chat/MessageList";
import {
  createThreadHistory,
  createTurn,
  createTraceEvent,
  createMessage,
} from "../../../fixtures/external";
import { MessageRole } from "@/domain/entities/chat/message";
import { TraceEventType } from "@/domain/entities/chat/traceEvent";
import { useChatStore } from "@/application/stores/useChatStore";

vi.mock("@/application/hooks/chat/useThreadHistory", () => ({
  useThreadHistory: (threadId: string | null) => {
    if (!threadId) return { data: undefined, isLoading: false };
    return {
      data: mockHistory,
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

let mockHistory = createThreadHistory();

describe("MessageList", () => {
  beforeEach(() => {
    useChatStore.getState().clearStream();
    useChatStore.setState({
      activeThreadId: null,
      streamingTurn: null,
      isStreaming: false,
      pendingUserMessage: null,
      error: null,
    });
    mockHistory = createThreadHistory();
  });

  it("shows empty state when thread has no turns", () => {
    mockHistory = createThreadHistory({ turns: [] });
    renderWithProviders(<MessageList threadId="thread-1" agentName="test-agent" />);

    expect(screen.getByText(/Send a message to start/i)).toBeInTheDocument();
  });

  it("renders human and ai messages from turns", () => {
    mockHistory = createThreadHistory({
      turns: [
        createTurn({
          human_message: createMessage({ role: MessageRole.HUMAN, content: "Hello there" }),
          ai_message: createMessage({ role: MessageRole.AI, content: "Hi, how can I help?" }),
          events: [],
        }),
      ],
    });

    renderWithProviders(<MessageList threadId="thread-1" agentName="test-agent" />);

    expect(screen.getByText("Hello there")).toBeInTheDocument();
    expect(screen.getByText("Hi, how can I help?")).toBeInTheDocument();
  });

  it("renders subagent timeline events when turn has intermediate events", () => {
    const subagentThinking = createTraceEvent({
      type: TraceEventType.THINKING,
      source: "security-auditor",
      content: "Analyzing",
    });
    mockHistory = createThreadHistory({
      turns: [
        createTurn({
          human_message: createMessage({ role: MessageRole.HUMAN, content: "Audit this" }),
          ai_message: createMessage({ role: MessageRole.AI, content: "Done" }),
          events: [subagentThinking],
        }),
      ],
    });

    renderWithProviders(<MessageList threadId="thread-1" agentName="test-agent" />);

    expect(screen.getByText("security-auditor")).toBeInTheDocument();
  });

  it("renders streaming parent content as markdown when isStreaming", () => {
    useChatStore.setState({
      streamingTurn: {
        turnId: "turn-stream-1",
        events: [],
        parentContent: "**Bold streaming** content",
        parentThinking: "Reasoning here",
        subagents: {},
        currentSource: null,
      },
      isStreaming: true,
    });

    renderWithProviders(<MessageList threadId="thread-1" agentName="test-agent" />);

    expect(screen.getByText(/Bold streaming/i)).toBeInTheDocument();
  });
});
