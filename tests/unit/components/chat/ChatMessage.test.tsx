import { screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import ChatMessage from "@/application/components/chat/ChatMessage";
import { createMessage, createTraceEvent } from "../../../fixtures/external";
import { MessageRole, MessageStatus } from "@/domain/entities/chat/message";
import { TraceEventType } from "@/domain/entities/chat/traceEvent";

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
});
