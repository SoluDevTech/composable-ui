import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useUploadFiles } from "@/application/hooks/rag/useUploadFiles";
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

function createMockFile(name: string, content: string, webkitRelativePath?: string): File {
  const file = new File([content], name, { type: "text/plain" });
  if (webkitRelativePath) {
    Object.defineProperty(file, "webkitRelativePath", {
      value: webkitRelativePath,
      writable: false,
    });
  }
  return file;
}

describe("useUploadFiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads multiple files with concurrency limit", async () => {
    vi.mocked(ragApi.uploadFile).mockImplementation(async () => ({
      message: "uploaded",
    }));

    const file1 = createMockFile("file1.txt", "content1");
    const file2 = createMockFile("file2.txt", "content2");
    const file3 = createMockFile("file3.txt", "content3");

    const { result } = renderHook(() => useUploadFiles(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ prefix: "docs/", files: [file1, file2, file3] });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(ragApi.uploadFile).toHaveBeenCalledTimes(3);
    expect(ragApi.uploadFile).toHaveBeenNthCalledWith(1, "docs/", file1);
    expect(ragApi.uploadFile).toHaveBeenNthCalledWith(2, "docs/", file2);
    expect(ragApi.uploadFile).toHaveBeenNthCalledWith(3, "docs/", file3);
  });

  it("preserves folder structure from webkitRelativePath", async () => {
    vi.mocked(ragApi.uploadFile).mockResolvedValue({ message: "uploaded" });

    const file = createMockFile("file.pdf", "content", "my-folder/sub/file.pdf");

    const { result } = renderHook(() => useUploadFiles(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ prefix: "docs/", files: [file] });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(ragApi.uploadFile).toHaveBeenCalledTimes(1);
    expect(ragApi.uploadFile).toHaveBeenCalledWith("docs/my-folder/sub/", file);
  });

  it("handles file without webkitRelativePath", async () => {
    vi.mocked(ragApi.uploadFile).mockResolvedValue({ message: "uploaded" });

    const file = createMockFile("plain.txt", "content");

    const { result } = renderHook(() => useUploadFiles(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ prefix: "docs/", files: [file] });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(ragApi.uploadFile).toHaveBeenCalledTimes(1);
    expect(ragApi.uploadFile).toHaveBeenCalledWith("docs/", file);
  });

  it("transitions to success when all uploads complete", async () => {
    vi.mocked(ragApi.uploadFile).mockResolvedValue({ message: "uploaded" });

    const files = [createMockFile("a.txt", "a"), createMockFile("b.txt", "b")];

    const { result } = renderHook(() => useUploadFiles(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ prefix: "docs/", files });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.kind).toBe("all-ok");
    expect(result.current.data?.items).toHaveLength(2);
  });

  it("transitions to error when all uploads fail", async () => {
    vi.mocked(ragApi.uploadFile).mockRejectedValue(new Error("Upload failed"));

    const files = [createMockFile("a.txt", "a"), createMockFile("b.txt", "b")];

    const { result } = renderHook(() => useUploadFiles(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ prefix: "docs/", files });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("handles partial failure — some succeed, some fail", async () => {
    vi.mocked(ragApi.uploadFile)
      .mockResolvedValueOnce({ message: "uploaded" })
      .mockResolvedValueOnce({ message: "uploaded" })
      .mockRejectedValueOnce(new Error("Upload failed"));

    const files = [
      createMockFile("a.txt", "a"),
      createMockFile("b.txt", "b"),
      createMockFile("c.txt", "c"),
    ];

    const { result } = renderHook(() => useUploadFiles(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ prefix: "docs/", files });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.kind).toBe("partial");
    expect(result.current.data?.succeeded).toBe(2);
    expect(result.current.data?.failed).toBe(1);
    expect(result.current.data?.errors).toHaveLength(1);
  });
});
