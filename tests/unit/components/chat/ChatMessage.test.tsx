import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import ChatMessage from "@/application/components/chat/ChatMessage";
import { createMessage } from "../../../fixtures/external";
import { MessageRole, MessageStatus } from "@/domain/entities/chat/message";

describe("ChatMessage", () => {
  it("renders AI message with agent name and content", () => {
    const message = createMessage({
      role: MessageRole.AI,
      content: "Hello from the agent",
    });

    renderWithProviders(
      <ChatMessage message={message} agentName="research-bot" />,
    );

    expect(screen.getByText("research-bot")).toBeInTheDocument();
    expect(screen.getByText("Hello from the agent")).toBeInTheDocument();
  });

  it("renders human message content", () => {
    const message = createMessage({
      role: MessageRole.HUMAN,
      content: "What is the weather?",
      status: null,
    });

    renderWithProviders(
      <ChatMessage message={message} agentName="test-agent" />,
    );

    expect(screen.getByText("What is the weather?")).toBeInTheDocument();
  });

  it("shows status badge for AI messages with status", () => {
    const message = createMessage({
      role: MessageRole.AI,
      content: "Processing your request",
      status: MessageStatus.AWAITING_HITL,
    });

    renderWithProviders(
      <ChatMessage message={message} agentName="test-agent" />,
    );

    expect(screen.getByText("awaiting_hitl")).toBeInTheDocument();
  });

  it("renders markdown content for AI messages", () => {
    const message = createMessage({
      role: MessageRole.AI,
      content: "This is **bold** text",
    });

    renderWithProviders(
      <ChatMessage message={message} agentName="test-agent" />,
    );

    const boldElement = screen.getByText("bold");
    expect(boldElement.tagName).toBe("STRONG");
  });
});
