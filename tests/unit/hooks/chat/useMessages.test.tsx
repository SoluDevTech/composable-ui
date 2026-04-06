import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useMessages } from "@/application/hooks/chat/useMessages";
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
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches messages when threadId is provided", async () => {
    const mockMessages = [
      createMessage({ role: MessageRole.HUMAN, content: "Hello" }),
      createMessage({ role: MessageRole.AI, content: "Hi there!" }),
    ];
    vi.mocked(chatApi.getMessages).mockResolvedValue(mockMessages);

    const { result } = renderHook(() => useMessages("thread-123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockMessages);
    expect(chatApi.getMessages).toHaveBeenCalledWith("thread-123");
  });

  it("does not fetch when threadId is null", async () => {
    const { result } = renderHook(() => useMessages(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(chatApi.getMessages).not.toHaveBeenCalled();
  });

  it("returns error state when API call fails", async () => {
    vi.mocked(chatApi.getMessages).mockRejectedValue(
      new Error("Thread not found"),
    );

    const { result } = renderHook(() => useMessages("bad-thread"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Thread not found");
  });
});
