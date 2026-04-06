import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useCreateThread } from "@/application/hooks/chat/useCreateThread";
import { chatApi } from "@/infrastructure/api/chat/chatApi";
import { createThread } from "../../../fixtures/external";
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

describe("useCreateThread", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls chatApi.createThread on mutate", async () => {
    const mockThread = createThread({ id: "new-thread", agent_name: "my-agent" });
    vi.mocked(chatApi.createThread).mockResolvedValue(mockThread);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCreateThread(), { wrapper });

    act(() => {
      result.current.mutate("my-agent");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(chatApi.createThread).toHaveBeenCalledWith("my-agent");
    expect(result.current.data).toEqual(mockThread);
  });

  it("invalidates threads query on success", async () => {
    const mockThread = createThread({ id: "new-thread", agent_name: "my-agent" });
    vi.mocked(chatApi.createThread).mockResolvedValue(mockThread);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateThread(), { wrapper });

    act(() => {
      result.current.mutate("my-agent");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["threads"] });
  });

  it("returns error state when creation fails", async () => {
    vi.mocked(chatApi.createThread).mockRejectedValue(
      new Error("Agent not found"),
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCreateThread(), { wrapper });

    act(() => {
      result.current.mutate("nonexistent-agent");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Agent not found");
  });
});
