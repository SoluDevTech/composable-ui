import { vi, describe, it, expect, beforeEach } from "vitest";
import { ragFileContentApi } from "@/infrastructure/api/rag/ragFileContentApi";
import { ragApiClient } from "@/infrastructure/api/ragAxiosInstance";

vi.mock("@/infrastructure/api/ragAxiosInstance", () => ({
  ragApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("ragFileContentApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("readFile", () => {
    it("sends correct POST to /api/v1/files/read with body", async () => {
      const mockResponse = {
        data: {
          content: [{ page: 1, content: "# Heading\n\nSome paragraph text." }],
          metadata: {
            format_type: "markdown",
            mime_type: "text/markdown",
          },
          tables: [],
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const result = await ragFileContentApi.readFile("docs/guide.md");

      expect(ragApiClient.post).toHaveBeenCalledWith("/api/v1/files/read", {
        file_path: "docs/guide.md",
      });
      expect(result).toEqual({
        content: [{ page: 1, content: "# Heading\n\nSome paragraph text." }],
        metadata: {
          format_type: "markdown",
          mime_type: "text/markdown",
        },
        tables: [],
      });
    });

    it("maps content into list of pages", async () => {
      const mockResponse = {
        data: {
          content: [
            { page: 1, content: "page one" },
            { page: 2, content: "page two" },
          ],
          metadata: {
            format_type: "pdf",
            mime_type: "application/pdf",
          },
          tables: null,
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const result = await ragFileContentApi.readFile("doc.pdf");

      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(2);
      expect(result.content[0]).toEqual({ page: 1, content: "page one" });
      expect(result.content[1]).toEqual({ page: 2, content: "page two" });
    });

    it("preserves snake_case metadata fields", async () => {
      const mockResponse = {
        data: {
          content: [{ page: 1, content: "plain text content" }],
          metadata: {
            format_type: "text",
            mime_type: "text/plain",
          },
          tables: [{ markdown: "| a | b |" }],
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const result = await ragFileContentApi.readFile("notes.txt");

      expect(result.content[0].content).toBe("plain text content");
      expect(result.metadata?.format_type).toBe("text");
      expect(result.metadata?.mime_type).toBe("text/plain");
    });

    it("maps tables to markdown strings", async () => {
      const mockResponse = {
        data: {
          content: [{ page: 1, content: "Report with tables" }],
          metadata: {
            format_type: "html",
            mime_type: "text/html",
          },
          tables: [{ markdown: "| Metric | Q1 |\n| --- | --- |\n| Rev | 100 |" }],
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const result = await ragFileContentApi.readFile("report.html");

      expect(result.tables).toHaveLength(1);
      expect(result.tables?.[0].markdown).toContain("| Metric | Q1 |");
    });

    it("handles null metadata without crashing", async () => {
      const mockResponse = {
        data: {
          content: [{ page: 1, content: "no metadata" }],
          metadata: null,
          tables: null,
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const result = await ragFileContentApi.readFile("unknown.bin");

      expect(result.metadata).toBeNull();
      expect(result.tables).toBeNull();
    });

    it("handles null tables without crashing", async () => {
      const mockResponse = {
        data: {
          content: [{ page: 1, content: "no tables" }],
          metadata: {
            format_type: "text",
            mime_type: "text/plain",
          },
          tables: null,
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const result = await ragFileContentApi.readFile("notes.txt");

      expect(result.tables).toBeNull();
    });

    it("handles empty tables array", async () => {
      const mockResponse = {
        data: {
          content: [{ page: 1, content: "No tables here" }],
          metadata: {
            format_type: "text",
            mime_type: "text/plain",
          },
          tables: [],
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const result = await ragFileContentApi.readFile("readme.txt");

      expect(result.tables).toEqual([]);
    });

    it("propagates 404 error when file is not found", async () => {
      vi.mocked(ragApiClient.post).mockRejectedValue(new Error("File not found"));

      await expect(ragFileContentApi.readFile("nonexistent/file.md")).rejects.toThrow(
        "File not found",
      );
    });

    it("propagates generic axios rejection", async () => {
      vi.mocked(ragApiClient.post).mockRejectedValue(new Error("Network error"));

      await expect(ragFileContentApi.readFile("any/file.txt")).rejects.toThrow("Network error");
    });
  });
});