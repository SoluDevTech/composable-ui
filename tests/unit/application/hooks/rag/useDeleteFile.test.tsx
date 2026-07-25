import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useDeleteFile } from "@/application/hooks/rag/useDeleteFile";
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

describe("useDeleteFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls ragApi.deleteFile with objectName and workingDir and transitions to success", async () => {
    vi.mocked(ragApi.deleteFile).mockResolvedValue({ message: "File deleted" });

    const { result } = renderHook(() => useDeleteFile(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ objectName: "docs/report.pdf", workingDir: "docs/" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(ragApi.deleteFile).toHaveBeenCalledWith("docs/report.pdf", "docs/");
    expect(result.current.data).toEqual({ message: "File deleted" });
  });

  it("transitions to error when API rejects", async () => {
    vi.mocked(ragApi.deleteFile).mockRejectedValue(new Error("Not found"));

    const { result } = renderHook(() => useDeleteFile(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ objectName: "missing.txt", workingDir: "docs/" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Not found");
  });
});
