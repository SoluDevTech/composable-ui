import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useSendMessage } from "@/application/hooks/chat/useSendMessage";
import { chatApi } from "@/infrastructure/api/chat/chatApi";
import { createMessage } from "../../../fixtures/external";
import { MessageRole } from "@/domain/entities/chat/message";
import type { ReactNode } from "react";

vi.mock("@/infrastructure/api/chat/chatApi", () => ({
  chatApi: {
    listThreads: vi.fn(),
    createThread: vi.fn(),
    getThread: vi.fn(),
    deleteThread: vi.fn(),
    getThreadHistory: vi.fn(),
    sendMessage: vi.fn(),
    streamMessage: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
    queryClient,
  };
}

describe("useSendMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls chatApi.sendMessage with threadId and request", async () => {
    const mockResponse = createMessage({
      role: MessageRole.AI,
      content: "Response",
    });
    vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useSendMessage("thread-123"), {
      wrapper,
    });

    act(() => {
      result.current.mutate({ message: "Hello" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(chatApi.sendMessage).toHaveBeenCalledWith("thread-123", {
      message: "Hello",
    });
  });

  it("throws error when threadId is null", async () => {
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useSendMessage(null), { wrapper });

    act(() => {
      result.current.mutate({ message: "Hello" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Cannot send message without an active thread");
  });

  // ─── HITL refactor: invalidation key fix ───────────────────────────────────
  // The message list is driven by `useThreadHistory` whose query key is
  // `["history", threadId]`. The hook MUST invalidate that key (not the legacy
  // `["messages", threadId]`) so the UI refreshes after an approve/reject.
  it("invalidates the ['history', threadId] query on success", async () => {
    const mockResponse = createMessage({
      role: MessageRole.AI,
      content: "Response",
    });
    vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useSendMessage("thread-123"), {
      wrapper,
    });

    act(() => {
      result.current.mutate({ message: "Hello" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["history", "thread-123"],
    });
  });

  it("does NOT invalidate the legacy ['messages', threadId] query", async () => {
    const mockResponse = createMessage({
      role: MessageRole.AI,
      content: "Response",
    });
    vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useSendMessage("thread-123"), {
      wrapper,
    });

    act(() => {
      result.current.mutate({ message: "Hello" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // The old (buggy) key must no longer be invalidated.
    expect(invalidateSpy).not.toHaveBeenCalledWith({
      queryKey: ["messages", "thread-123"],
    });
  });

  // ─── HITL refactor: multi-decision payload ─────────────────────────────────
  // Contract: when the caller passes a `decisions` array, the hook forwards it
  // verbatim to chatApi.sendMessage (preferred multi-decision payload).
  it("sends the decisions payload to chatApi.sendMessage", async () => {
    const mockResponse = createMessage({
      role: MessageRole.AI,
      content: "Done",
    });
    vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useSendMessage("thread-123"), {
      wrapper,
    });

    const decisions = [
      { tool_call_id: "tc-1", action: "approve" as const },
      { tool_call_id: "tc-2", action: "reject" as const, reason: "Too risky" },
    ];

    act(() => {
      result.current.mutate({ decisions });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(chatApi.sendMessage).toHaveBeenCalledWith("thread-123", {
      decisions: [
        { tool_call_id: "tc-1", action: "approve" },
        { tool_call_id: "tc-2", action: "reject", reason: "Too risky" },
      ],
    });
  });
});