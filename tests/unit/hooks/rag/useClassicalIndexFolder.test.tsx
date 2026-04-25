import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useClassicalIndexFolder } from "@/application/hooks/rag/useClassicalIndexFolder";
import { ragIndexApi } from "@/infrastructure/api/rag/ragIndexApi";
import type { ReactNode } from "react";

vi.mock("@/infrastructure/api/rag/ragIndexApi", () => ({
  ragIndexApi: {
    indexFile: vi.fn(),
    indexFolder: vi.fn(),
    indexFileClassical: vi.fn(),
    indexFolderClassical: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
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

describe("useClassicalIndexFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls ragIndexApi.indexFolderClassical with mapped snake_case fields", async () => {
    vi.mocked(ragIndexApi.indexFolderClassical).mockResolvedValue({ message: "Indexed" });
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useClassicalIndexFolder(), { wrapper });

    act(() => {
      result.current.mutate({ workingDir: "/data/docs", recursive: true, chunkSize: 1000, chunkOverlap: 200 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ragIndexApi.indexFolderClassical).toHaveBeenCalledWith({
      working_dir: "/data/docs",
      recursive: true,
      file_extensions: undefined,
      chunk_size: 1000,
      chunk_overlap: 200,
    });
  });

  it("shows success toast on success", async () => {
    const { toast } = await import("sonner");
    vi.mocked(ragIndexApi.indexFolderClassical).mockResolvedValue({ message: "Indexed" });
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useClassicalIndexFolder(), { wrapper });

    act(() => {
      result.current.mutate({ workingDir: "/data/docs", recursive: true, chunkSize: 1000, chunkOverlap: 200 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalled();
  });

  it("shows error toast on failure", async () => {
    const { toast } = await import("sonner");
    vi.mocked(ragIndexApi.indexFolderClassical).mockRejectedValue(new Error("Indexing failed"));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useClassicalIndexFolder(), { wrapper });

    act(() => {
      result.current.mutate({ workingDir: "/data/docs", recursive: true, chunkSize: 1000, chunkOverlap: 200 });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });

  it("returns loading state during mutation", async () => {
    let resolveMutation!: (value: unknown) => void;
    vi.mocked(ragIndexApi.indexFolderClassical).mockImplementation(
      () => new Promise((resolve) => (resolveMutation = resolve)),
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useClassicalIndexFolder(), { wrapper });

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.mutate({ workingDir: "/data/docs", recursive: true, chunkSize: 1000, chunkOverlap: 200 });
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));

    act(() => {
      resolveMutation({ message: "Indexed" });
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.isSuccess).toBe(true);
  });
});