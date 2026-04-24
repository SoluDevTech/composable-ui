import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useDeleteAgent } from "@/application/hooks/agent/useDeleteAgent";
import { agentApi } from "@/infrastructure/api/agent/agentApi";
import type { ReactNode } from "react";

vi.mock("@/infrastructure/api/agent/agentApi", () => ({
  agentApi: {
    getAgent: vi.fn(),
    listAgents: vi.fn(),
    createAgent: vi.fn(),
    updateAgent: vi.fn(),
    deleteAgent: vi.fn(),
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

describe("useDeleteAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls agentApi.deleteAgent on mutate", async () => {
    vi.mocked(agentApi.deleteAgent).mockResolvedValue(undefined);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteAgent(), { wrapper });

    act(() => {
      result.current.mutate("my-agent");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(agentApi.deleteAgent).toHaveBeenCalledWith("my-agent");
  });

  it("invalidates agents query on success", async () => {
    vi.mocked(agentApi.deleteAgent).mockResolvedValue(undefined);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteAgent(), { wrapper });

    act(() => {
      result.current.mutate("my-agent");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["agents"] });
  });

  it("returns error state when deletion fails", async () => {
    vi.mocked(agentApi.deleteAgent).mockRejectedValue(new Error("Forbidden"));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteAgent(), { wrapper });

    act(() => {
      result.current.mutate("protected-agent");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Forbidden");
  });
});
