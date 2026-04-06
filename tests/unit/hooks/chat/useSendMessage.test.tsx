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
    getMessages: vi.fn(),
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
    expect(result.current.error?.message).toBe(
      "Cannot send message without an active thread",
    );
  });

  it("invalidates messages query on success", async () => {
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
      queryKey: ["messages", "thread-123"],
    });
  });
});
