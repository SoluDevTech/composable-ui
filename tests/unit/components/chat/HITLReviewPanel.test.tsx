import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import HITLReviewPanel from "@/application/components/chat/HITLReviewPanel";
import type { ToolCall } from "@/domain/entities/chat/message";

// ─── Mocked useSendMessage (component-level interaction tests) ──────────────
// The component test mocks useSendMessage to control the mutate fn and to
// simulate the error state. The invalidate-key contract is validated separately
// in tests/unit/hooks/chat/useSendMessage.test.tsx against the real hook.
const { mockSendMessageMutate, mockSendMessageState } = vi.hoisted(() => {
  return {
    mockSendMessageMutate: vi.fn(),
    mockSendMessageState: {
      isPending: false,
      isError: false,
      error: null as Error | null,
    },
  };
});

vi.mock("@/application/hooks/chat/useSendMessage", () => ({
  useSendMessage: () => ({
    mutate: mockSendMessageMutate,
    isPending: mockSendMessageState.isPending,
    isError: mockSendMessageState.isError,
    error: mockSendMessageState.error,
  }),
}));

// ─── Assumed UI (for the implementer to align) ───────────────────────────────
// The new multi-tool-call HITLReviewPanel:
//   - Renders one decision row per tool call, each showing the tool name and
//     its args, plus per-call Approve / Reject choice controls and (for reject)
//     an optional reason input.
//   - Has a single "Submit" button that fires ONE mutation with
//     `{ decisions: [...] }` covering every tool call.
//   - For the single-tool-call case the same flow applies (a list of 1); the
//     Submit button is still used so the payload is always `{ decisions: [...] }`.
//   - Displays `sendMessage.error` (the error message text) when the mutation
//     fails, instead of silently swallowing it.
// The tests below assert the PAYLOAD contract (the `decisions` array shape)
// rather than precise DOM click sequences; if the implementer chooses slightly
// different controls (e.g. a per-call select instead of two buttons) the test
// selectors may need a minor tweak, but the payload assertions are the source
// of truth.

function resetMockState() {
  mockSendMessageState.isPending = false;
  mockSendMessageState.isError = false;
  mockSendMessageState.error = null;
}

const singleToolCall: ToolCall[] = [
  {
    id: "tc-1",
    name: "search",
    args: { query: "hello" },
  },
];

const twoToolCalls: ToolCall[] = [
  { id: "tc-a", name: "delete", args: { path: "/tmp/a.txt" } },
  { id: "tc-b", name: "write", args: { path: "/tmp/b.txt", content: "x" } },
];

describe("HITLReviewPanel", () => {
  beforeEach(() => {
    mockSendMessageMutate.mockClear();
    resetMockState();
  });

  // ─── Multi-tool-call rendering ─────────────────────────────────────────────
  it("renders a decision row for each tool call", () => {
    renderWithProviders(<HITLReviewPanel toolCalls={twoToolCalls} threadId="thread-123" />);

    expect(screen.getByText("delete")).toBeInTheDocument();
    expect(screen.getByText("write")).toBeInTheDocument();
  });

  it("shows validation required text", () => {
    renderWithProviders(<HITLReviewPanel toolCalls={singleToolCall} threadId="thread-123" />);

    expect(screen.getByText(/validation required/i)).toBeInTheDocument();
  });

  it("handles empty tool calls gracefully", () => {
    renderWithProviders(<HITLReviewPanel toolCalls={[]} threadId="thread-123" />);

    expect(screen.getByText("Unknown tool")).toBeInTheDocument();
  });

  // ─── Single tool call: approve ─────────────────────────────────────────────
  it("single tool call: approve sends a decisions list of 1", async () => {
    const user = userEvent.setup();

    renderWithProviders(<HITLReviewPanel toolCalls={singleToolCall} threadId="thread-123" />);

    // Open the review surface (existing "Review Data" entry point is kept).
    await user.click(screen.getByRole("button", { name: /review data/i }));

    // Choose approve for the single call and submit.
    await user.click(screen.getByRole("button", { name: /approve/i }));
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(mockSendMessageMutate).toHaveBeenCalledWith({
      decisions: [{ tool_call_id: "tc-1", action: "approve" }],
    });
  });

  // ─── Single tool call: reject with reason ──────────────────────────────────
  it("reject with reason sends decisions with the reason", async () => {
    const user = userEvent.setup();

    renderWithProviders(<HITLReviewPanel toolCalls={singleToolCall} threadId="thread-123" />);

    await user.click(screen.getByRole("button", { name: /review data/i }));
    await user.click(screen.getByRole("button", { name: /reject/i }));

    const reasonInput = screen.getByPlaceholderText(/reason for rejection/i);
    await user.type(reasonInput, "Too risky");

    await user.click(screen.getByRole("button", { name: /confirm reject/i }));

    expect(mockSendMessageMutate).toHaveBeenCalledWith({
      decisions: [{ tool_call_id: "tc-1", action: "reject", reason: "Too risky" }],
    });
  });

  // ─── Multi tool calls: submit sends all decisions ─────────────────────────
  it("multi tool calls: submit sends all decisions in one mutation", async () => {
    const user = userEvent.setup();

    renderWithProviders(<HITLReviewPanel toolCalls={twoToolCalls} threadId="thread-123" />);

    await user.click(screen.getByRole("button", { name: /review data/i }));

    // First call: approve.
    await user.click(screen.getByRole("button", { name: /approve.*delete/i }));

    // Second call: reject with a reason.
    await user.click(screen.getByRole("button", { name: /reject.*write/i }));
    const reasonInput = screen.getByPlaceholderText(/reason for rejection/i);
    await user.type(reasonInput, "Unsafe");

    // Single Submit sends both decisions in one payload.
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(mockSendMessageMutate).toHaveBeenCalledWith({
      decisions: [
        { tool_call_id: "tc-a", action: "approve" },
        { tool_call_id: "tc-b", action: "reject", reason: "Unsafe" },
      ],
    });
  });

  // ─── Error display (no longer silent) ─────────────────────────────────────
  it("displays the mutation error when send fails", () => {
    mockSendMessageState.isError = true;
    mockSendMessageState.error = new Error("boom");

    renderWithProviders(<HITLReviewPanel toolCalls={singleToolCall} threadId="thread-123" />);

    // The error message must be visible somewhere in the panel (not swallowed).
    expect(screen.getByText(/boom/i)).toBeInTheDocument();
  });
});