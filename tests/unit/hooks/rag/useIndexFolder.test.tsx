import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useIndexFolder } from "@/application/hooks/rag/useIndexFolder";
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

describe("useIndexFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls ragIndexApi.indexFolder with mapped snake_case fields", async () => {
    vi.mocked(ragIndexApi.indexFolder).mockResolvedValue({ message: "Indexed" });
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useIndexFolder(), { wrapper });

    act(() => {
      result.current.mutate({ workingDir: "/data/docs", recursive: true });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ragIndexApi.indexFolder).toHaveBeenCalledWith({
      working_dir: "/data/docs",
      recursive: true,
      file_extensions: undefined,
    });
  });

  it("shows success toast on success", async () => {
    const { toast } = await import("sonner");
    vi.mocked(ragIndexApi.indexFolder).mockResolvedValue({ message: "Indexed" });
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useIndexFolder(), { wrapper });

    act(() => {
      result.current.mutate({ workingDir: "/data/docs", recursive: true });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalled();
  });

  it("shows error toast on failure", async () => {
    const { toast } = await import("sonner");
    vi.mocked(ragIndexApi.indexFolder).mockRejectedValue(new Error("Indexing failed"));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useIndexFolder(), { wrapper });

    act(() => {
      result.current.mutate({ workingDir: "/data/docs", recursive: true });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });

  it("returns loading state during mutation", async () => {
    let resolveMutation!: (value: unknown) => void;
    vi.mocked(ragIndexApi.indexFolder).mockImplementation(
      () => new Promise((resolve) => (resolveMutation = resolve)),
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useIndexFolder(), { wrapper });

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.mutate({ workingDir: "/data/docs", recursive: true });
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));

    act(() => {
      resolveMutation({ message: "Indexed" });
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.isSuccess).toBe(true);
  });
});