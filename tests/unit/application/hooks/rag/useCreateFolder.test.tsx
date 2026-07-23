import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useCreateFolder } from "@/application/hooks/rag/useCreateFolder";
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

describe("useCreateFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls ragApi.createFolder with prefix and transitions to success", async () => {
    vi.mocked(ragApi.createFolder).mockResolvedValue({ message: "Folder created" });

    const { result } = renderHook(() => useCreateFolder(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ prefix: "docs" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(ragApi.createFolder).toHaveBeenCalledWith("docs");
    expect(result.current.data).toEqual({ message: "Folder created" });
  });

  it("transitions to error when API rejects", async () => {
    vi.mocked(ragApi.createFolder).mockRejectedValue(new Error("Folder exists"));

    const { result } = renderHook(() => useCreateFolder(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ prefix: "docs" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Folder exists");
  });
});