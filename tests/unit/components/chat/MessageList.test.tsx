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
import { MessageRole, MessageStatus } from "@/domain/entities/chat/message";
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

  // ─── HITL refactor: isLast gating (no stale panel on older messages) ──────
  // Contract: MessageList passes `isLast={idx === entries.length - 1}` to each
  // ChatMessage rendered from `entries` (NOT for the pending user message or
  // the streaming message). Combined with ChatMessage's `isLast` gate, an
  // older awaiting_hitl message must NOT render a HITL panel once the
  // conversation has continued. We assert via `data-od-id="hitl-panel"`.
  function hitlPanelCount(container: HTMLElement): number {
    return container.querySelectorAll('[data-od-id="hitl-panel"]').length;
  }

  it("renders the HITL panel on the last message when it is awaiting_hitl", () => {
    mockHistory = createThreadHistory({
      turns: [
        createTurn({
          human_message: createMessage({ role: MessageRole.HUMAN, content: "first" }),
          ai_message: createMessage({
            role: MessageRole.AI,
            content: "needs review",
            status: MessageStatus.AWAITING_HITL,
            tool_calls: [{ id: "tc-1", name: "x", args: {} }],
          }),
          events: [],
        }),
      ],
    });

    const { container } = renderWithProviders(
      <MessageList threadId="thread-1" agentName="test-agent" />,
    );

    expect(hitlPanelCount(container)).toBe(1);
  });

  it("does NOT render a HITL panel on an earlier awaiting_hitl message when the last is completed", () => {
    mockHistory = createThreadHistory({
      turns: [
        createTurn({
          human_message: createMessage({ role: MessageRole.HUMAN, content: "first" }),
          ai_message: createMessage({
            role: MessageRole.AI,
            content: "older awaiting",
            status: MessageStatus.AWAITING_HITL,
            tool_calls: [{ id: "tc-old", name: "x", args: {} }],
          }),
          events: [],
        }),
        createTurn({
          human_message: createMessage({ role: MessageRole.HUMAN, content: "second" }),
          ai_message: createMessage({
            role: MessageRole.AI,
            content: "done",
            status: MessageStatus.COMPLETED,
          }),
          events: [],
        }),
      ],
    });

    const { container } = renderWithProviders(
      <MessageList threadId="thread-1" agentName="test-agent" />,
    );

    // The older awaiting_hitl message is NOT the last entry, so its panel must
    // be suppressed by the isLast gate.
    expect(hitlPanelCount(container)).toBe(0);
  });
});
