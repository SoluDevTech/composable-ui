import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import SubagentPanel from "@/application/components/chat/SubagentPanel";
import { createTraceEvent } from "../../../fixtures/external";
import { TraceEventType } from "@/domain/entities/chat/traceEvent";

describe("SubagentPanel", () => {
  it("renders the subagent header with its name", () => {
    renderWithProviders(
      <SubagentPanel
        name="security-auditor"
        content="Done"
        thinking=""
        toolCalls={[]}
        toolResults={[]}
      />,
    );

    expect(screen.getByText("security-auditor")).toBeInTheDocument();
  });

  it("renders a ThinkingBlock when thinking is non-empty", () => {
    renderWithProviders(
      <SubagentPanel
        name="security-auditor"
        content="Done"
        thinking="Considering options"
        toolCalls={[]}
        toolResults={[]}
      />,
    );

    expect(screen.getByText(/Thinking — security-auditor/i)).toBeInTheDocument();
  });

  it("renders ToolCallBadge for each tool call", () => {
    const toolCall = createTraceEvent({
      type: TraceEventType.TOOL_CALL,
      name: "search",
      source: "security-auditor",
      content: '{"q":"x"}',
    });
    renderWithProviders(
      <SubagentPanel
        name="security-auditor"
        content="Done"
        thinking=""
        toolCalls={[toolCall]}
        toolResults={[]}
      />,
    );

    expect(screen.getByText(/Calling tool: search/i)).toBeInTheDocument();
  });

  it("renders ToolResultBlock for each tool result", () => {
    const toolResult = createTraceEvent({
      type: TraceEventType.TOOL_RESULT,
      name: "search",
      source: "security-auditor",
      content: "ok",
    });
    renderWithProviders(
      <SubagentPanel
        name="security-auditor"
        content="Done"
        thinking=""
        toolCalls={[]}
        toolResults={[toolResult]}
      />,
    );

    expect(screen.getByText(/Tool Result/i)).toBeInTheDocument();
  });
});
