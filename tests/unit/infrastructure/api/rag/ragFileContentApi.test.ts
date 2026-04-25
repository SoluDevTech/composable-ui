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
          content: "# Heading\n\nSome paragraph text.",
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
        content: "# Heading\n\nSome paragraph text.",
        metadata: {
          format_type: "markdown",
          mime_type: "text/markdown",
        },
        tables: [],
      });
    });

    it("preserves snake_case metadata fields", async () => {
      const mockResponse = {
        data: {
          content: "plain text content",
          metadata: {
            format_type: "text",
            mime_type: "text/plain",
          },
          tables: [
            {
              headers: ["Name", "Value"],
              rows: [["key1", "val1"]],
            },
          ],
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const result = await ragFileContentApi.readFile("notes.txt");

      expect(result.content).toBe("plain text content");
      expect(result.metadata.format_type).toBe("text");
      expect(result.metadata.mime_type).toBe("text/plain");
    });

    it("handles tables array with multiple entries", async () => {
      const mockResponse = {
        data: {
          content: "Report with tables",
          metadata: {
            format_type: "html",
            mime_type: "text/html",
          },
          tables: [
            {
              headers: ["Metric", "Q1", "Q2"],
              rows: [
                ["Revenue", "100", "200"],
                ["Cost", "50", "75"],
              ],
            },
            {
              headers: ["Item", "Count"],
              rows: [["Widget", "42"]],
            },
          ],
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const result = await ragFileContentApi.readFile("report.html");

      expect(result.tables).toHaveLength(2);
      expect(result.tables[0].headers).toEqual(["Metric", "Q1", "Q2"]);
      expect(result.tables[0].rows).toEqual([
        ["Revenue", "100", "200"],
        ["Cost", "50", "75"],
      ]);
      expect(result.tables[1].headers).toEqual(["Item", "Count"]);
      expect(result.tables[1].rows).toEqual([["Widget", "42"]]);
    });

    it("handles empty tables array", async () => {
      const mockResponse = {
        data: {
          content: "No tables here",
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
      vi.mocked(ragApiClient.post).mockRejectedValue(
        new Error("File not found"),
      );

      await expect(
        ragFileContentApi.readFile("nonexistent/file.md"),
      ).rejects.toThrow("File not found");
    });

    it("propagates generic axios rejection", async () => {
      vi.mocked(ragApiClient.post).mockRejectedValue(
        new Error("Network error"),
      );

      await expect(
        ragFileContentApi.readFile("any/file.txt"),
      ).rejects.toThrow("Network error");
    });
  });
});