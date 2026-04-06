import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import HITLReviewPanel from "@/application/components/chat/HITLReviewPanel";
import type { ToolCall } from "@/domain/entities/chat/message";

const { mockSendMessageMutate } = vi.hoisted(() => {
  return {
    mockSendMessageMutate: vi.fn(),
  };
});

vi.mock("@/application/hooks/chat/useSendMessage", () => ({
  useSendMessage: () => ({
    mutate: mockSendMessageMutate,
    isPending: false,
  }),
}));

const toolCalls: ToolCall[] = [
  {
    id: "tc-1",
    name: "create_file",
    args: { path: "/tmp/test.txt", content: "hello" },
  },
];

describe("HITLReviewPanel", () => {
  beforeEach(() => {
    mockSendMessageMutate.mockClear();
  });

  it("renders tool name in idle state", () => {
    renderWithProviders(
      <HITLReviewPanel toolCalls={toolCalls} threadId="thread-123" />,
    );

    expect(screen.getByText("create_file")).toBeInTheDocument();
  });

  it("shows 'Review Data' button in idle state", () => {
    renderWithProviders(
      <HITLReviewPanel toolCalls={toolCalls} threadId="thread-123" />,
    );

    expect(
      screen.getByRole("button", { name: /review data/i }),
    ).toBeInTheDocument();
  });

  it("shows validation required text", () => {
    renderWithProviders(
      <HITLReviewPanel toolCalls={toolCalls} threadId="thread-123" />,
    );

    expect(screen.getByText(/validation required/i)).toBeInTheDocument();
  });

  it("transitions to reviewing state when Review Data is clicked", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <HITLReviewPanel toolCalls={toolCalls} threadId="thread-123" />,
    );

    await user.click(screen.getByRole("button", { name: /review data/i }));

    // In reviewing state, Approve and Reject buttons should appear
    expect(screen.getByRole("button", { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reject/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("shows tool args in reviewing state", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <HITLReviewPanel toolCalls={toolCalls} threadId="thread-123" />,
    );

    await user.click(screen.getByRole("button", { name: /review data/i }));

    expect(screen.getByText(/\/tmp\/test\.txt/)).toBeInTheDocument();
  });

  it("calls sendMessage with approve action when Approve is clicked", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <HITLReviewPanel toolCalls={toolCalls} threadId="thread-123" />,
    );

    await user.click(screen.getByRole("button", { name: /review data/i }));
    await user.click(screen.getByRole("button", { name: /approve/i }));

    expect(mockSendMessageMutate).toHaveBeenCalledWith({
      tool_call_id: "tc-1",
      action: "approve",
    });
  });

  it("transitions to rejecting state on first Reject click", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <HITLReviewPanel toolCalls={toolCalls} threadId="thread-123" />,
    );

    await user.click(screen.getByRole("button", { name: /review data/i }));
    await user.click(screen.getByRole("button", { name: /^reject$/i }));

    // Should now show "Confirm Reject" and a reason input
    expect(
      screen.getByRole("button", { name: /confirm reject/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/reason for rejection/i),
    ).toBeInTheDocument();
  });

  it("returns to idle state when Cancel is clicked", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <HITLReviewPanel toolCalls={toolCalls} threadId="thread-123" />,
    );

    await user.click(screen.getByRole("button", { name: /review data/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    // Should be back to idle with "Review Data" button
    expect(
      screen.getByRole("button", { name: /review data/i }),
    ).toBeInTheDocument();
  });

  it("handles empty tool calls gracefully", () => {
    renderWithProviders(
      <HITLReviewPanel toolCalls={[]} threadId="thread-123" />,
    );

    expect(screen.getByText("Unknown tool")).toBeInTheDocument();
  });
});
