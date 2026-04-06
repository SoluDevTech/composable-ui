import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useThreads } from "@/application/hooks/chat/useThreads";
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
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useThreads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches threads from chatApi.listThreads", async () => {
    const mockThreads = [
      createThread({ id: "t-1", agent_name: "agent-a" }),
      createThread({ id: "t-2", agent_name: "agent-b" }),
    ];
    vi.mocked(chatApi.listThreads).mockResolvedValue(mockThreads);

    const { result } = renderHook(() => useThreads(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockThreads);
    expect(chatApi.listThreads).toHaveBeenCalledOnce();
  });

  it("returns error state when API call fails", async () => {
    vi.mocked(chatApi.listThreads).mockRejectedValue(
      new Error("Network error"),
    );

    const { result } = renderHook(() => useThreads(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Network error");
  });
});
