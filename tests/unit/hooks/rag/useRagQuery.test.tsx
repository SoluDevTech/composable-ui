import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useRagQuery } from "@/application/hooks/rag/useRagQuery";
import { ragQueryApi } from "@/infrastructure/api/rag/ragQueryApi";
import type { ReactNode } from "react";

vi.mock("@/infrastructure/api/rag/ragQueryApi", () => ({
  ragQueryApi: {
    queryLightRAG: vi.fn(),
    queryClassical: vi.fn(),
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

describe("useRagQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls ragQueryApi.queryLightRAG with mapped snake_case params", async () => {
    const mockResponse = { answer: "LightRAG answer", sources: [] };
    vi.mocked(ragQueryApi.queryLightRAG).mockResolvedValue(mockResponse);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useRagQuery(), { wrapper });

    act(() => {
      result.current.mutate({ workingDir: "/data/project", query: "What is RAG?", mode: "hybrid", topK: 5 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ragQueryApi.queryLightRAG).toHaveBeenCalledWith({
      working_dir: "/data/project",
      query: "What is RAG?",
      mode: "hybrid",
      top_k: 5,
    });
  });

  it("returns loading state during mutation", async () => {
    let resolveMutation!: (value: unknown) => void;
    vi.mocked(ragQueryApi.queryLightRAG).mockImplementation(
      () => new Promise((resolve) => (resolveMutation = resolve)),
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useRagQuery(), { wrapper });

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.mutate({ workingDir: "/data/project", query: "What is RAG?", mode: "hybrid", topK: 5 });
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));

    act(() => {
      resolveMutation({ answer: "done", sources: [] });
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.isSuccess).toBe(true);
  });

  it("sets error state on failure", async () => {
    vi.mocked(ragQueryApi.queryLightRAG).mockRejectedValue(
      new Error("Query failed"),
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useRagQuery(), { wrapper });

    act(() => {
      result.current.mutate({ workingDir: "/data/project", query: "What is RAG?", mode: "hybrid", topK: 5 });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Query failed");
  });
});