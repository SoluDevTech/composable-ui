import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useUploadFile } from "@/application/hooks/rag/useUploadFile";
import { ragApi } from "@/infrastructure/api/rag/ragApi";
import type { ReactNode } from "react";

vi.mock("@/infrastructure/api/rag/ragApi", () => ({
  ragApi: {
    listFiles: vi.fn(),
    listFolders: vi.fn(),
    uploadFile: vi.fn(),
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

describe("useUploadFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls ragApi.uploadFile with correct prefix and file", async () => {
    vi.mocked(ragApi.uploadFile).mockResolvedValue({ name: "report.pdf", prefix: "documents/" });
    const { wrapper } = createWrapper();
    const file = new File(["dummy content"], "report.pdf", {
      type: "application/pdf",
    });

    const { result } = renderHook(() => useUploadFile(), { wrapper });

    act(() => {
      result.current.mutate({ prefix: "documents/", file });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ragApi.uploadFile).toHaveBeenCalledWith("documents/", file);
  });

  it("invalidates rag files and folders queries on success", async () => {
    vi.mocked(ragApi.uploadFile).mockResolvedValue({ name: "report.pdf", prefix: "documents/" });
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const file = new File(["dummy content"], "report.pdf", {
      type: "application/pdf",
    });

    const { result } = renderHook(() => useUploadFile(), { wrapper });

    act(() => {
      result.current.mutate({ prefix: "documents/", file });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["rag", "files"] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["rag", "folders"],
    });
  });

  it("does not invalidate queries on failure", async () => {
    vi.mocked(ragApi.uploadFile).mockRejectedValue(new Error("Upload failed"));
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const file = new File(["dummy content"], "report.pdf", {
      type: "application/pdf",
    });

    const { result } = renderHook(() => useUploadFile(), { wrapper });

    act(() => {
      result.current.mutate({ prefix: "documents/", file });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it("returns correct loading state during upload", async () => {
    let resolveUpload!: (value: unknown) => void;
    vi.mocked(ragApi.uploadFile).mockImplementation(
      () => new Promise((resolve) => (resolveUpload = resolve)),
    );
    const { wrapper } = createWrapper();
    const file = new File(["dummy content"], "report.pdf", {
      type: "application/pdf",
    });

    const { result } = renderHook(() => useUploadFile(), { wrapper });

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.mutate({ prefix: "documents/", file });
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));

    act(() => {
      resolveUpload({ name: "report.pdf", prefix: "documents/" });
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.isSuccess).toBe(true);
  });
});
