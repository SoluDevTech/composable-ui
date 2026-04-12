import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useFiles } from "@/application/hooks/rag/useFiles";
import { ragApi } from "@/infrastructure/api/rag/ragApi";
import type { ReactNode } from "react";

vi.mock("@/infrastructure/api/rag/ragApi", () => ({
  ragApi: {
    listFolders: vi.fn(),
    listFiles: vi.fn(),
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

describe("useFiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns file list on success", async () => {
    const files = [
      {
        objectName: "readme.md",
        size: 500,
        lastModified: "2026-04-06T10:00:00Z",
      },
    ];
    vi.mocked(ragApi.listFiles).mockResolvedValue(files as any);

    const { result } = renderHook(() => useFiles("docs/"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(files);
    expect(ragApi.listFiles).toHaveBeenCalledWith("docs/", false);
  });

  it("passes recursive param correctly", async () => {
    vi.mocked(ragApi.listFiles).mockResolvedValue([]);

    const { result } = renderHook(() => useFiles("docs/", true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ragApi.listFiles).toHaveBeenCalledWith("docs/", true);
  });

  it("handles API errors", async () => {
    vi.mocked(ragApi.listFiles).mockRejectedValue(
      new Error("Server error"),
    );

    const { result } = renderHook(() => useFiles(""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("does not fetch when prefix is undefined", () => {
    const { result } = renderHook(() => useFiles(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(ragApi.listFiles).not.toHaveBeenCalled();
  });
});
