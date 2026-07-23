import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useThreadHistory } from "@/application/hooks/chat/useThreadHistory";
import { chatApi } from "@/infrastructure/api/chat/chatApi";
import { createThreadHistory } from "../../../../fixtures/external";
import type { ReactNode } from "react";

vi.mock("@/infrastructure/api/chat/chatApi", () => ({
  chatApi: {
    getThreadHistory: vi.fn(),
    streamMessage: vi.fn(),
    sendMessage: vi.fn(),
    createThread: vi.fn(),
    listThreads: vi.fn(),
    getThread: vi.fn(),
    deleteThread: vi.fn(),
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

describe("useThreadHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches thread history when threadId is provided", async () => {
    const history = createThreadHistory();
    vi.mocked(chatApi.getThreadHistory).mockResolvedValue(history);

    const { result } = renderHook(() => useThreadHistory("thread-123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(history);
    expect(chatApi.getThreadHistory).toHaveBeenCalledWith("thread-123");
  });

  it("does not fetch when threadId is null", async () => {
    const { result } = renderHook(() => useThreadHistory(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(chatApi.getThreadHistory).not.toHaveBeenCalled();
  });

  it("uses history query key with threadId", async () => {
    const history = createThreadHistory();
    vi.mocked(chatApi.getThreadHistory).mockResolvedValue(history);

    const { result } = renderHook(() => useThreadHistory("thread-xyz"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(chatApi.getThreadHistory).toHaveBeenCalledWith("thread-xyz");
  });

  it("returns error state when API call fails", async () => {
    vi.mocked(chatApi.getThreadHistory).mockRejectedValue(new Error("Thread not found"));

    const { result } = renderHook(() => useThreadHistory("bad-thread"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Thread not found");
  });
});
