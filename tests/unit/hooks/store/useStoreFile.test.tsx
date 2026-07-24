import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useStoreFile } from "@/application/hooks/store/useStoreFile";
import { storeApi } from "@/infrastructure/api/store/storeApi";
import type { StoreFile } from "@/domain/entities/store/storeFile";
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
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useStoreFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns StoreFile when data loads", async () => {
    // Arrange
    const file: StoreFile = {
      path: "skills/rag/SKILL.md",
      content: "---\nname: rag\n---\n# RAG",
    };
    vi.mocked(storeApi.getFile).mockResolvedValue(file);

    // Act
    const { result } = renderHook(
      () => useStoreFile("skills/rag/SKILL.md"),
      { wrapper: createWrapper() },
    );

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(file);
    expect(storeApi.getFile).toHaveBeenCalledWith("skills/rag/SKILL.md");
  });

  it("returns null when file not found", async () => {
    // Arrange — API resolves null for a missing file
    vi.mocked(storeApi.getFile).mockResolvedValue(null);

    // Act
    const { result } = renderHook(
      () => useStoreFile("skills/missing/SKILL.md"),
      { wrapper: createWrapper() },
    );

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it("uses query key ['store-file', path]", async () => {
    // Arrange
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const file: StoreFile = {
      path: "skills/rag/SKILL.md",
      content: "# RAG",
    };
    vi.mocked(storeApi.getFile).mockResolvedValue(file);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Act
    const { result } = renderHook(
      () => useStoreFile("skills/rag/SKILL.md"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert — the cached data must be retrievable under the exact query key
    const cached = queryClient.getQueryData<StoreFile>([
      "store-file",
      "skills/rag/SKILL.md",
    ]);
    expect(cached).toEqual(file);
  });
});