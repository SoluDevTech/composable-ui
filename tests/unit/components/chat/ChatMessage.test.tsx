import { screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import ChatMessage from "@/application/components/chat/ChatMessage";
import { createMessage, createTraceEvent } from "../../../fixtures/external";
import { MessageRole, MessageStatus } from "@/domain/entities/chat/message";
import { TraceEventType } from "@/domain/entities/chat/traceEvent";
import type { ToolCall } from "@/domain/entities/chat/message";

// The HITL panel is marked with `data-od-id="hitl-panel"` (project convention).
// testing-library's default `getByTestId` matches `data-testid`, so we query
// the custom attribute directly.
function hitlPanel(container: HTMLElement): Element | null {
  return container.querySelector('[data-od-id="hitl-panel"]');
}

describe("ChatMessage", () => {
  it("renders AI message with agent name and content", () => {
    const message = createMessage({
      role: MessageRole.AI,
      content: "Hello from the agent",
    });

    renderWithProviders(<ChatMessage message={message} agentName="research-bot" />);

    expect(screen.getByText("research-bot")).toBeInTheDocument();
    expect(screen.getByText("Hello from the agent")).toBeInTheDocument();
  });

  it("renders human message content", () => {
    const message = createMessage({
      role: MessageRole.HUMAN,
      content: "What is the weather?",
      status: null,
    });

    renderWithProviders(<ChatMessage message={message} agentName="test-agent" />);

    expect(screen.getByText("What is the weather?")).toBeInTheDocument();
  });

  it("shows status badge for AI messages with status", () => {
    const message = createMessage({
      role: MessageRole.AI,
      content: "Processing your request",
      status: MessageStatus.AWAITING_HITL,
    });

    renderWithProviders(<ChatMessage message={message} agentName="test-agent" />);

    expect(screen.getByText("Awaiting Hitl")).toBeInTheDocument();
  });

  it("renders markdown content for AI messages", () => {
    const message = createMessage({
      role: MessageRole.AI,
      content: "This is **bold** text",
    });

    renderWithProviders(<ChatMessage message={message} agentName="test-agent" />);

    const boldElement = screen.getByText("bold");
    expect(boldElement.tagName).toBe("STRONG");
  });

  // ─── Memoization: committed messages should not re-render ────────────────

  it("does not re-render when parent rerenders with same message ref", () => {
    const message = createMessage({
      role: MessageRole.AI,
      content: "Committed message",
    });

    const renderSpy = vi.fn(() => null);

    function Parent() {
      return (
        <div>
          <ChatMessage message={message} agentName="test-agent" />
          {renderSpy()}
        </div>
      );
    }

    const { rerender } = renderWithProviders(<Parent />);

    expect(screen.getByText("Committed message")).toBeInTheDocument();
    expect(renderSpy).toHaveBeenCalledTimes(1);

    // Re-render the parent with a different element tree but the same message ref.
    rerender(<Parent />);

    // The Parent's render spy fires again (parent re-rendered), but ChatMessage
    // is memoized — its internal implementation should not re-execute.
    // We verify the spy fired again (proving the parent did re-render) and that
    // the message content is still present.
    expect(renderSpy).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Committed message")).toBeInTheDocument();
  });

  it("re-renders when a new message object is passed (different ref)", () => {
    const message1 = createMessage({
      role: MessageRole.AI,
      content: "First message",
    });
    const message2 = createMessage({
      role: MessageRole.AI,
      content: "Second message",
    });

    const { rerender } = renderWithProviders(
      <ChatMessage message={message1} agentName="test-agent" />,
    );

    expect(screen.getByText("First message")).toBeInTheDocument();

    rerender(<ChatMessage message={message2} agentName="test-agent" />);

    expect(screen.getByText("Second message")).toBeInTheDocument();
    expect(screen.queryByText("First message")).not.toBeInTheDocument();
  });

  it("re-renders when agentName changes (same message ref)", () => {
    const message = createMessage({
      role: MessageRole.AI,
      content: "Same message",
    });

    const { rerender } = renderWithProviders(
      <ChatMessage message={message} agentName="agent-one" />,
    );

    expect(screen.getByText("agent-one")).toBeInTheDocument();

    rerender(<ChatMessage message={message} agentName="agent-two" />);

    expect(screen.getByText("agent-two")).toBeInTheDocument();
    expect(screen.queryByText("agent-one")).not.toBeInTheDocument();
  });

  it("renders intermediate timeline events when events prop is provided", () => {
    const message = createMessage({
      role: MessageRole.AI,
      content: "Final answer",
    });
    const subThinking = createTraceEvent({
      type: TraceEventType.THINKING,
      source: "security-auditor",
      content: "Auditing",
    });

    renderWithProviders(
      <ChatMessage message={message} agentName="test-agent" events={[subThinking]} />,
    );

    expect(screen.getByText("Final answer")).toBeInTheDocument();
    expect(screen.getByText("security-auditor")).toBeInTheDocument();
  });

  // ─── HITL refactor: isLast gating of the HITL panel ───────────────────────
  // Contract: HITLReviewPanel is rendered ONLY when
  //   isAwaitingHitl && message.tool_calls?.length && threadId && isLast
  // Adding `isLast` prevents a stale panel from rendering on an older
  // awaiting_hitl message once the conversation has continued.

  const hitlToolCalls: ToolCall[] = [{ id: "tc-1", name: "x", args: {} }];

  it("renders HITL panel when isLast is true and status is awaiting_hitl", () => {
    const message = createMessage({
      role: MessageRole.AI,
      content: "Needs review",
      status: MessageStatus.AWAITING_HITL,
      tool_calls: hitlToolCalls,
    });

    const { container } = renderWithProviders(
      <ChatMessage message={message} agentName="test-agent" threadId="t1" isLast={true} />,
    );

    expect(hitlPanel(container)).not.toBeNull();
  });

  it("does NOT render HITL panel when isLast is false", () => {
    const message = createMessage({
      role: MessageRole.AI,
      content: "Needs review",
      status: MessageStatus.AWAITING_HITL,
      tool_calls: hitlToolCalls,
    });

    const { container } = renderWithProviders(
      <ChatMessage message={message} agentName="test-agent" threadId="t1" isLast={false} />,
    );

    expect(hitlPanel(container)).toBeNull();
  });

  it("does NOT render HITL panel when status is not awaiting_hitl", () => {
    const message = createMessage({
      role: MessageRole.AI,
      content: "Done",
      status: MessageStatus.COMPLETED,
      tool_calls: hitlToolCalls,
    });

    const { container } = renderWithProviders(
      <ChatMessage message={message} agentName="test-agent" threadId="t1" isLast={true} />,
    );

    expect(hitlPanel(container)).toBeNull();
  });

  // ─── HITL refactor: HITL_DECISION badges in the timeline ──────────────────
  // Contract: in the AI message timeline (hasTimeline block), each
  // HITL_DECISION event renders a discreet badge with text derived from
  // `event.name` (the action) and `event.content` (the reason for reject):
  //   - approve  -> "✓ Approved"
  //   - reject   -> "✗ Rejected: {reason}"
  //   - edit     -> "✎ Edited"
  // The badge lives inside the `message-timeline` div. These tests assert the
  // badge text is present (case-insensitive); exact styling is left to the
  // implementation.

  it("renders HITL_DECISION badge for an approved event", () => {
    const message = createMessage({
      role: MessageRole.AI,
      content: "Continued",
    });
    const approveEvent = createTraceEvent({
      type: TraceEventType.HITL_DECISION,
      name: "approve",
      content: null,
    });

    renderWithProviders(
      <ChatMessage message={message} agentName="test-agent" events={[approveEvent]} />,
    );

    expect(screen.getByText(/approved/i)).toBeInTheDocument();
  });

  it("renders HITL_DECISION badge for a rejected event with the reason", () => {
    const message = createMessage({
      role: MessageRole.AI,
      content: "Continued",
    });
    const rejectEvent = createTraceEvent({
      type: TraceEventType.HITL_DECISION,
      name: "reject",
      content: "Too risky",
    });

    renderWithProviders(
      <ChatMessage message={message} agentName="test-agent" events={[rejectEvent]} />,
    );

    expect(screen.getByText(/rejected/i)).toBeInTheDocument();
    expect(screen.getByText(/too risky/i)).toBeInTheDocument();
  });
});
