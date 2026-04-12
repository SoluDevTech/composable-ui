import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useFolders } from "@/application/hooks/rag/useFolders";
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

describe("useFolders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns folder list on success", async () => {
    const folders = [{ prefix: "docs/" }, { prefix: "images/" }];
    vi.mocked(ragApi.listFolders).mockResolvedValue(folders as any);

    const { result } = renderHook(() => useFolders(""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(folders);
    expect(ragApi.listFolders).toHaveBeenCalledWith("");
  });

  it("passes prefix to API call", async () => {
    vi.mocked(ragApi.listFolders).mockResolvedValue([]);

    const { result } = renderHook(() => useFolders("docs/reports/"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ragApi.listFolders).toHaveBeenCalledWith("docs/reports/");
  });

  it("handles API errors", async () => {
    vi.mocked(ragApi.listFolders).mockRejectedValue(
      new Error("Network error"),
    );

    const { result } = renderHook(() => useFolders(""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("does not fetch when prefix is undefined", () => {
    const { result } = renderHook(() => useFolders(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(ragApi.listFolders).not.toHaveBeenCalled();
  });
});
