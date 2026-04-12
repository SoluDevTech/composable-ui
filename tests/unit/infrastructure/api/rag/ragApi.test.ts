import { vi, describe, it, expect, beforeEach } from "vitest";
import { ragApi } from "@/infrastructure/api/rag/ragApi";
import { ragApiClient } from "@/infrastructure/api/ragAxiosInstance";

vi.mock("@/infrastructure/api/ragAxiosInstance", () => ({
  ragApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("ragApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listFolders", () => {
    it("fetches folders from GET /api/v1/files/folders", async () => {
      vi.mocked(ragApiClient.get).mockResolvedValue({
        data: ["docs/", "images/"],
      });

      const result = await ragApi.listFolders();

      expect(ragApiClient.get).toHaveBeenCalledWith("/api/v1/files/folders");
      expect(result).toHaveLength(2);
      expect(result[0].prefix).toBe("docs/");
      expect(result[0].name).toBe("docs");
      expect(result[1].prefix).toBe("images/");
      expect(result[1].name).toBe("images");
    });

    it("fetches folders with prefix query param", async () => {
      vi.mocked(ragApiClient.get).mockResolvedValue({
        data: ["docs/reports/"],
      });

      const result = await ragApi.listFolders("docs/");

      expect(ragApiClient.get).toHaveBeenCalledWith(
        "/api/v1/files/folders?prefix=docs%2F",
      );
      expect(result).toHaveLength(1);
      expect(result[0].prefix).toBe("docs/reports/");
      expect(result[0].name).toBe("reports");
    });
  });

  describe("listFiles", () => {
    it("fetches files from GET /api/v1/files/list with root prefix", async () => {
      const rawFiles = [
        {
          object_name: "readme.md",
          size: 500,
          last_modified: "2026-04-06T10:00:00Z",
        },
      ];
      vi.mocked(ragApiClient.get).mockResolvedValue({ data: rawFiles });

      const result = await ragApi.listFiles("");

      expect(ragApiClient.get).toHaveBeenCalledWith(
        "/api/v1/files/list?prefix=&recursive=false",
      );
      expect(result).toEqual([
        {
          objectName: "readme.md",
          size: 500,
          lastModified: "2026-04-06T10:00:00Z",
        },
      ]);
    });

    it("fetches files with prefix and recursive=false by default", async () => {
      const rawFiles = [
        {
          object_name: "docs/guide.md",
          size: 2048,
          last_modified: "2026-04-06T10:00:00Z",
        },
      ];
      vi.mocked(ragApiClient.get).mockResolvedValue({ data: rawFiles });

      const result = await ragApi.listFiles("docs/");

      expect(ragApiClient.get).toHaveBeenCalledWith(
        "/api/v1/files/list?prefix=docs%2F&recursive=false",
      );
      expect(result).toEqual([
        {
          objectName: "docs/guide.md",
          size: 2048,
          lastModified: "2026-04-06T10:00:00Z",
        },
      ]);
    });

    it("fetches files with recursive=true", async () => {
      vi.mocked(ragApiClient.get).mockResolvedValue({ data: [] });

      await ragApi.listFiles("docs/", true);

      expect(ragApiClient.get).toHaveBeenCalledWith(
        "/api/v1/files/list?prefix=docs%2F&recursive=true",
      );
    });

    it("maps snake_case fields to camelCase", async () => {
      const rawFiles = [
        {
          object_name: "report.pdf",
          size: 1536000,
          last_modified: null,
        },
      ];
      vi.mocked(ragApiClient.get).mockResolvedValue({ data: rawFiles });

      const result = await ragApi.listFiles("");

      expect(result[0]).toEqual({
        objectName: "report.pdf",
        size: 1536000,
        lastModified: null,
      });
    });

    it("handles empty file list", async () => {
      vi.mocked(ragApiClient.get).mockResolvedValue({ data: [] });

      const result = await ragApi.listFiles("empty/");

      expect(result).toEqual([]);
    });
  });
});
