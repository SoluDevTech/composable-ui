import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useClassicalQuery } from "@/application/hooks/rag/useClassicalQuery";
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

describe("useClassicalQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls ragQueryApi.queryClassical with mapped snake_case params", async () => {
    const mockResponse = { answer: "Classical answer", sources: [] };
    vi.mocked(ragQueryApi.queryClassical).mockResolvedValue(mockResponse);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useClassicalQuery(), { wrapper });

    act(() => {
      result.current.mutate({
        workingDir: "/data/project",
        query: "What is RAG?",
        topK: 5,
        numVariations: 3,
        relevanceThreshold: 0.7,
        enableLlmJudge: true,
        mode: "vector",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ragQueryApi.queryClassical).toHaveBeenCalledWith({
      working_dir: "/data/project",
      query: "What is RAG?",
      top_k: 5,
      num_variations: 3,
      relevance_threshold: 0.7,
      vector_distance_threshold: undefined,
      enable_llm_judge: true,
      mode: "vector",
    });
  });

  it("returns loading state during mutation", async () => {
    let resolveMutation!: (value: unknown) => void;
    vi.mocked(ragQueryApi.queryClassical).mockImplementation(
      () => new Promise((resolve) => (resolveMutation = resolve)),
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useClassicalQuery(), { wrapper });

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.mutate({
        workingDir: "/data/project",
        query: "What is RAG?",
        topK: 5,
        numVariations: 3,
        relevanceThreshold: 0.7,
        enableLlmJudge: true,
        mode: "vector",
      });
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));

    act(() => {
      resolveMutation({ answer: "done", sources: [] });
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.isSuccess).toBe(true);
  });

  it("sets error state on failure", async () => {
    vi.mocked(ragQueryApi.queryClassical).mockRejectedValue(
      new Error("Query failed"),
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useClassicalQuery(), { wrapper });

    act(() => {
      result.current.mutate({
        workingDir: "/data/project",
        query: "What is RAG?",
        topK: 5,
        numVariations: 3,
        relevanceThreshold: 0.7,
        enableLlmJudge: true,
        mode: "vector",
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Query failed");
  });
});