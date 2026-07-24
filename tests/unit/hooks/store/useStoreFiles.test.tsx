import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useStoreFiles } from "@/application/hooks/store/useStoreFiles";
import { storeApi } from "@/infrastructure/api/store/storeApi";
import type { StoreFileMetadata } from "@/domain/entities/store/storeFile";
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

describe("useStoreFiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns list of StoreFileMetadata when data loads", async () => {
    // Arrange
    const files: StoreFileMetadata[] = [
      { path: "skills/rag/SKILL.md" },
      { path: "skills/web-search/SKILL.md" },
    ];
    vi.mocked(storeApi.listFiles).mockResolvedValue(files);

    // Act
    const { result } = renderHook(() => useStoreFiles("skills/"), {
      wrapper: createWrapper(),
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(files);
    expect(storeApi.listFiles).toHaveBeenCalledWith("skills/");
  });

  it("returns empty array when no files", async () => {
    // Arrange
    vi.mocked(storeApi.listFiles).mockResolvedValue([]);

    // Act
    const { result } = renderHook(() => useStoreFiles("skills/"), {
      wrapper: createWrapper(),
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("uses query key ['store-files', prefix]", async () => {
    // Arrange — spy on the query client to observe the query key used
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const getQueryDataSpy = vi.spyOn(queryClient, "getQueryData");
    vi.mocked(storeApi.listFiles).mockResolvedValue([]);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Act
    const { result } = renderHook(() => useStoreFiles("memories/"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert — the query key registered for this prefix must include "store-files" and the prefix
    getQueryDataSpy.mockRestore();
    // The presence of data under the exact key is verified by fetching it back
    const cached = queryClient.getQueryData<StoreFileMetadata[]>([
      "store-files",
      "memories/",
    ]);
    expect(cached).toEqual([]);
  });
});