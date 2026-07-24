import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useDeleteStoreFile } from "@/application/hooks/store/useDeleteStoreFile";
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

describe("useDeleteStoreFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls storeApi.deleteFile with path", async () => {
    // Arrange
    vi.mocked(storeApi.deleteFile).mockResolvedValue(undefined);
    const { wrapper } = createWrapper();

    // Act
    const { result } = renderHook(() => useDeleteStoreFile(), { wrapper });

    act(() => {
      result.current.mutate("skills/rag/SKILL.md");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(storeApi.deleteFile).toHaveBeenCalledWith("skills/rag/SKILL.md");
  });

  it("invalidates ['store-files'] on success", async () => {
    // Arrange
    vi.mocked(storeApi.deleteFile).mockResolvedValue(undefined);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    // Act
    const { result } = renderHook(() => useDeleteStoreFile(), { wrapper });

    act(() => {
      result.current.mutate("skills/rag/SKILL.md");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["store-files"] });
  });
});