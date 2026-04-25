import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useReadFile } from "@/application/hooks/rag/useReadFile";
import { ragFileContentApi } from "@/infrastructure/api/rag/ragFileContentApi";
import type { ReactNode } from "react";

vi.mock("@/infrastructure/api/rag/ragFileContentApi", () => ({
  ragFileContentApi: {
    readFile: vi.fn(),
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

describe("useReadFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls ragFileContentApi.readFile with filePath", async () => {
    const mockContent = { content: "file contents here", metadata: { format_type: "markdown", mime_type: "text/markdown" }, tables: [] };
    vi.mocked(ragFileContentApi.readFile).mockResolvedValue(mockContent);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useReadFile(), { wrapper });

    act(() => {
      result.current.mutate("/data/docs/readme.md");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ragFileContentApi.readFile).toHaveBeenCalledWith("/data/docs/readme.md");
  });

  it("shows error toast on failure", async () => {
    const { toast } = await import("sonner");
    vi.mocked(ragFileContentApi.readFile).mockRejectedValue(new Error("File not found"));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useReadFile(), { wrapper });

    act(() => {
      result.current.mutate("/data/docs/missing.md");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });

  it("returns loading state during mutation", async () => {
    let resolveMutation!: (value: unknown) => void;
    vi.mocked(ragFileContentApi.readFile).mockImplementation(
      () => new Promise((resolve) => (resolveMutation = resolve)),
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useReadFile(), { wrapper });

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.mutate("/data/docs/readme.md");
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));

    act(() => {
      resolveMutation({ content: "done", metadata: { format_type: "text", mime_type: "text/plain" }, tables: [] });
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.isSuccess).toBe(true);
  });

  it("sets error state on failure", async () => {
    vi.mocked(ragFileContentApi.readFile).mockRejectedValue(
      new Error("File not found"),
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useReadFile(), { wrapper });

    act(() => {
      result.current.mutate("/data/docs/missing.md");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("File not found");
  });
});