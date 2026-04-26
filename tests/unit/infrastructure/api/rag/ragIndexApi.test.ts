import { vi, describe, it, expect, beforeEach } from "vitest";
import { ragIndexApi } from "@/infrastructure/api/rag/ragIndexApi";
import { ragApiClient } from "@/infrastructure/api/ragAxiosInstance";

vi.mock("@/infrastructure/api/ragAxiosInstance", () => ({
  ragApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("ragIndexApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("indexFile", () => {
    it("sends correct POST to /api/v1/file/index with body", async () => {
      const mockResponse = {
        data: {
          status: "success",
          message: "File indexed successfully",
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        file_name: "report.pdf",
        working_dir: "/data/my-project",
      };

      const result = await ragIndexApi.indexFile(request);

      expect(ragApiClient.post).toHaveBeenCalledWith("/api/v1/file/index", {
        file_name: "report.pdf",
        working_dir: "/data/my-project",
      });
      expect(result).toEqual({
        status: "success",
        message: "File indexed successfully",
      });
    });

    it("maps snake_case response to camelCase", async () => {
      const mockResponse = {
        data: {
          status: "success",
          message: "Indexed",
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        file_name: "notes.md",
        working_dir: "/data/project",
      };

      const result = await ragIndexApi.indexFile(request);

      expect(result.status).toBe("success");
      expect(result.message).toBe("Indexed");
    });

    it("propagates error when axios rejects", async () => {
      vi.mocked(ragApiClient.post).mockRejectedValue(
        new Error("File not found on storage"),
      );

      const request = {
        file_name: "missing.txt",
        working_dir: "/data/project",
      };

      await expect(ragIndexApi.indexFile(request)).rejects.toThrow(
        "File not found on storage",
      );
    });
  });

  describe("indexFolder", () => {
    it("sends correct POST to /api/v1/folder/index with body", async () => {
      const mockResponse = {
        data: {
          status: "success",
          message: "Folder indexed successfully",
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        working_dir: "/data/my-project",
        recursive: true,
        file_extensions: [".md", ".pdf"],
      };

      const result = await ragIndexApi.indexFolder(request);

      expect(ragApiClient.post).toHaveBeenCalledWith("/api/v1/folder/index", {
        working_dir: "/data/my-project",
        recursive: true,
        file_extensions: [".md", ".pdf"],
      });
      expect(result).toEqual({
        status: "success",
        message: "Folder indexed successfully",
      });
    });

    it("omits optional file_extensions when not provided", async () => {
      const mockResponse = {
        data: {
          status: "success",
          message: "Folder indexed",
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        working_dir: "/data/project",
        recursive: false,
      };

      await ragIndexApi.indexFolder(request);

      const calledBody = vi.mocked(ragApiClient.post).mock.calls[0][1] as Record<
        string,
        unknown
      >;
      expect(calledBody).not.toHaveProperty("file_extensions");
    });

    it("includes file_extensions when provided", async () => {
      const mockResponse = {
        data: {
          status: "success",
          message: "Indexed",
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        working_dir: "/data/project",
        recursive: true,
        file_extensions: [".txt"],
      };

      await ragIndexApi.indexFolder(request);

      expect(vi.mocked(ragApiClient.post)).toHaveBeenCalledWith(
        "/api/v1/folder/index",
        expect.objectContaining({
          file_extensions: [".txt"],
        }),
      );
    });

    it("propagates error when axios rejects", async () => {
      vi.mocked(ragApiClient.post).mockRejectedValue(
        new Error("Folder not accessible"),
      );

      const request = {
        working_dir: "/data/missing",
        recursive: true,
      };

      await expect(ragIndexApi.indexFolder(request)).rejects.toThrow(
        "Folder not accessible",
      );
    });
  });

  describe("indexFileClassical", () => {
    it("sends correct POST to /api/v1/classical/file/index with body", async () => {
      const mockResponse = {
        data: {
          status: "success",
          message: "File indexed with classical method",
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        file_name: "guide.md",
        working_dir: "/data/my-project",
        chunk_size: 512,
        chunk_overlap: 50,
      };

      const result = await ragIndexApi.indexFileClassical(request);

      expect(ragApiClient.post).toHaveBeenCalledWith(
        "/api/v1/classical/file/index",
        {
          file_name: "guide.md",
          working_dir: "/data/my-project",
          chunk_size: 512,
          chunk_overlap: 50,
        },
      );
      expect(result).toEqual({
        status: "success",
        message: "File indexed with classical method",
      });
    });

    it("maps snake_case response to camelCase", async () => {
      const mockResponse = {
        data: {
          status: "success",
          message: "Done",
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        file_name: "doc.txt",
        working_dir: "/data/project",
        chunk_size: 256,
        chunk_overlap: 25,
      };

      const result = await ragIndexApi.indexFileClassical(request);

      expect(result.status).toBe("success");
      expect(result.message).toBe("Done");
    });

    it("propagates error when axios rejects", async () => {
      vi.mocked(ragApiClient.post).mockRejectedValue(
        new Error("Chunking failed"),
      );

      const request = {
        file_name: "bad.txt",
        working_dir: "/data/project",
        chunk_size: 512,
        chunk_overlap: 50,
      };

      await expect(ragIndexApi.indexFileClassical(request)).rejects.toThrow(
        "Chunking failed",
      );
    });
  });

  describe("indexFolderClassical", () => {
    it("sends correct POST to /api/v1/classical/folder/index with body including file_extensions", async () => {
      const mockResponse = {
        data: {
          status: "success",
          message: "Folder indexed with classical method",
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        working_dir: "/data/my-project",
        recursive: true,
        file_extensions: [".md", ".txt"],
        chunk_size: 1024,
        chunk_overlap: 100,
      };

      const result = await ragIndexApi.indexFolderClassical(request);

      expect(ragApiClient.post).toHaveBeenCalledWith(
        "/api/v1/classical/folder/index",
        {
          working_dir: "/data/my-project",
          recursive: true,
          file_extensions: [".md", ".txt"],
          chunk_size: 1024,
          chunk_overlap: 100,
        },
      );
      expect(result).toEqual({
        status: "success",
        message: "Folder indexed with classical method",
      });
    });

    it("omits optional file_extensions when not provided", async () => {
      const mockResponse = {
        data: {
          status: "success",
          message: "Indexed",
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        working_dir: "/data/project",
        recursive: false,
        chunk_size: 512,
        chunk_overlap: 50,
      };

      await ragIndexApi.indexFolderClassical(request);

      const calledBody = vi.mocked(ragApiClient.post).mock.calls[0][1] as Record<
        string,
        unknown
      >;
      expect(calledBody).not.toHaveProperty("file_extensions");
    });

    it("includes file_extensions when provided", async () => {
      const mockResponse = {
        data: {
          status: "success",
          message: "Done",
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        working_dir: "/data/project",
        recursive: true,
        file_extensions: [".pdf"],
        chunk_size: 256,
        chunk_overlap: 20,
      };

      await ragIndexApi.indexFolderClassical(request);

      expect(vi.mocked(ragApiClient.post)).toHaveBeenCalledWith(
        "/api/v1/classical/folder/index",
        expect.objectContaining({
          file_extensions: [".pdf"],
        }),
      );
    });

    it("maps snake_case response to camelCase", async () => {
      const mockResponse = {
        data: {
          status: "success",
          message: "Classical folder indexed",
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        working_dir: "/data/project",
        recursive: true,
        chunk_size: 512,
        chunk_overlap: 50,
      };

      const result = await ragIndexApi.indexFolderClassical(request);

      expect(result.status).toBe("success");
      expect(result.message).toBe("Classical folder indexed");
    });

    it("propagates error when axios rejects", async () => {
      vi.mocked(ragApiClient.post).mockRejectedValue(
        new Error("Folder read error"),
      );

      const request = {
        working_dir: "/data/missing",
        recursive: true,
        chunk_size: 512,
        chunk_overlap: 50,
      };

      await expect(ragIndexApi.indexFolderClassical(request)).rejects.toThrow(
        "Folder read error",
      );
    });
  });
});