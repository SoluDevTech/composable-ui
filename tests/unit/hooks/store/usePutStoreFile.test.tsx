import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { usePutStoreFile } from "@/application/hooks/store/usePutStoreFile";
import { storeApi } from "@/infrastructure/api/store/storeApi";
import type { ReactNode } from "react";

vi.mock("@/infrastructure/api/store/storeApi", () => ({
  storeApi: {
    listFiles: vi.fn(),
    getFile: vi.fn(),
    putFile: vi.fn(),
    deleteFile: vi.fn(),
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

describe("usePutStoreFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls storeApi.putFile with path and content", async () => {
    // Arrange
    vi.mocked(storeApi.putFile).mockResolvedValue(undefined);
    const { wrapper } = createWrapper();

    // Act
    const { result } = renderHook(() => usePutStoreFile(), { wrapper });

    act(() => {
      result.current.mutate({ path: "skills/rag/SKILL.md", content: "# RAG" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(storeApi.putFile).toHaveBeenCalledWith("skills/rag/SKILL.md", "# RAG");
  });

  it("invalidates ['store-files'] on success", async () => {
    // Arrange
    vi.mocked(storeApi.putFile).mockResolvedValue(undefined);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    // Act
    const { result } = renderHook(() => usePutStoreFile(), { wrapper });

    act(() => {
      result.current.mutate({ path: "skills/rag/SKILL.md", content: "# RAG" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert — any query whose key starts with "store-files" must be invalidated
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["store-files"] });
  });
});