import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useDeleteThread } from "@/application/hooks/chat/useDeleteThread";
import { chatApi } from "@/infrastructure/api/chat/chatApi";
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

describe("useDeleteThread", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls chatApi.deleteThread on mutate", async () => {
    vi.mocked(chatApi.deleteThread).mockResolvedValue(undefined);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteThread(), { wrapper });

    act(() => {
      result.current.mutate("thread-123");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(chatApi.deleteThread).toHaveBeenCalledWith("thread-123");
  });

  it("invalidates threads query on success", async () => {
    vi.mocked(chatApi.deleteThread).mockResolvedValue(undefined);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteThread(), { wrapper });

    act(() => {
      result.current.mutate("thread-123");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["threads"] });
  });

  it("returns error state when deletion fails", async () => {
    vi.mocked(chatApi.deleteThread).mockRejectedValue(
      new Error("Thread not found"),
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteThread(), { wrapper });

    act(() => {
      result.current.mutate("unknown-thread");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Thread not found");
  });
});
