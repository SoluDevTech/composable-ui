import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useDeleteFolder } from "@/application/hooks/rag/useDeleteFolder";
import { ragApi } from "@/infrastructure/api/rag/ragApi";
import type { ReactNode } from "react";

vi.mock("@/infrastructure/api/rag/ragApi", () => ({
  ragApi: {
    listFolders: vi.fn(),
    listFiles: vi.fn(),
    uploadFile: vi.fn(),
    createFolder: vi.fn(),
    deleteFile: vi.fn(),
    deleteFolder: vi.fn(),
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

describe("useDeleteFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls ragApi.deleteFolder with prefix and transitions to success", async () => {
    vi.mocked(ragApi.deleteFolder).mockResolvedValue({ message: "Folder deleted" });

    const { result } = renderHook(() => useDeleteFolder(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ prefix: "docs" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(ragApi.deleteFolder).toHaveBeenCalledWith("docs");
    expect(result.current.data).toEqual({ message: "Folder deleted" });
  });

  it("transitions to error when API rejects", async () => {
    vi.mocked(ragApi.deleteFolder).mockRejectedValue(new Error("Not empty"));

    const { result } = renderHook(() => useDeleteFolder(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ prefix: "docs" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Not empty");
  });
});