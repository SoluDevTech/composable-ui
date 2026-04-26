import { vi, describe, it, expect, beforeEach } from "vitest";
import { ragQueryApi } from "@/infrastructure/api/rag/ragQueryApi";
import { ragApiClient } from "@/infrastructure/api/ragAxiosInstance";

vi.mock("@/infrastructure/api/ragAxiosInstance", () => ({
  ragApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("ragQueryApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("queryLightRAG", () => {
    it("sends correct POST to /api/v1/query with body", async () => {
      const mockResponse = {
        data: [
          {
            reference_id: "ref-1",
            content: "This is a LightRAG chunk",
            file_path: "docs/rag.md",
            chunk_id: "chunk-1",
          },
        ],
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        working_dir: "/data/my-project",
        query: "What is RAG?",
        mode: "hybrid" as const,
        top_k: 5,
      };

      const result = await ragQueryApi.queryLightRAG(request);

      expect(ragApiClient.post).toHaveBeenCalledWith("/api/v1/query", {
        working_dir: "/data/my-project",
        query: "What is RAG?",
        mode: "hybrid",
        top_k: 5,
      });
      expect(result).toEqual([
        {
          reference_id: "ref-1",
          content: "This is a LightRAG chunk",
          file_path: "docs/rag.md",
          chunk_id: "chunk-1",
        },
      ]);
    });

    it("parses multiple chunks from backend", async () => {
      const mockResponse = {
        data: [
          {
            reference_id: "ref-1",
            content: "Chunk one",
            file_path: "doc1.md",
            chunk_id: "c1",
          },
          {
            reference_id: null,
            content: "Chunk two",
            file_path: "doc2.md",
            chunk_id: "c2",
          },
        ],
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        working_dir: "/data/project",
        query: "test",
        mode: "naive" as const,
        top_k: 5,
      };

      const result = await ragQueryApi.queryLightRAG(request);

      expect(result).toHaveLength(2);
      expect(result[0].content).toBe("Chunk one");
      expect(result[1].reference_id).toBeNull();
    });

    it("propagates error when axios rejects", async () => {
      vi.mocked(ragApiClient.post).mockRejectedValue(
        new Error("Internal server error"),
      );

      const request = {
        working_dir: "/data/project",
        query: "test",
        mode: "hybrid" as const,
        top_k: 5,
      };

      await expect(ragQueryApi.queryLightRAG(request)).rejects.toThrow(
        "Internal server error",
      );
    });

    it("throws ZodError when response does not match schema", async () => {
      const mockResponse = {
        data: { invalid: "response" },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        working_dir: "/data/project",
        query: "test",
        mode: "hybrid" as const,
        top_k: 5,
      };

      await expect(ragQueryApi.queryLightRAG(request)).rejects.toThrow();
    });
  });

  describe("queryClassical", () => {
    it("sends correct POST to /api/v1/classical/query with body", async () => {
      const mockResponse = {
        data: {
          status: "success",
          message: "Classical query completed",
          queries: ["Explain vector search", "vector search explanation"],
          chunks: [
            {
              chunk_id: "c1",
              content: "Classical chunk content",
              file_path: "docs/vector.md",
              relevance_score: 8.5,
              metadata: {},
              bm25_score: 0.85,
              vector_score: 0.92,
              combined_score: 0.88,
            },
          ],
          mode: "hybrid",
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        working_dir: "/data/my-project",
        query: "Explain vector search",
        top_k: 8,
        num_variations: 3,
        relevance_threshold: 0.7,
        enable_llm_judge: true,
        mode: "hybrid" as const,
      };

      const result = await ragQueryApi.queryClassical(request);

      expect(ragApiClient.post).toHaveBeenCalledWith(
        "/api/v1/classical/query",
        {
          working_dir: "/data/my-project",
          query: "Explain vector search",
          top_k: 8,
          num_variations: 3,
          relevance_threshold: 0.7,
          enable_llm_judge: true,
          mode: "hybrid",
        },
      );
      expect(result.status).toBe("success");
      expect(result.chunks).toHaveLength(1);
      expect(result.chunks[0].relevance_score).toBe(8.5);
      expect(result.queries).toEqual(["Explain vector search", "vector search explanation"]);
      expect(result.mode).toBe("hybrid");
    });

    it("sends optional vector_distance_threshold when provided", async () => {
      const mockResponse = {
        data: {
          status: "success",
          queries: [],
          chunks: [],
          mode: "vector",
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        working_dir: "/data/project",
        query: "test",
        top_k: 5,
        num_variations: 2,
        relevance_threshold: 0.5,
        vector_distance_threshold: 0.8,
        enable_llm_judge: false,
        mode: "hybrid" as const,
      };

      await ragQueryApi.queryClassical(request);

      expect(vi.mocked(ragApiClient.post)).toHaveBeenCalledWith(
        "/api/v1/classical/query",
        expect.objectContaining({
          vector_distance_threshold: 0.8,
        }),
      );
    });

    it("omits vector_distance_threshold when not provided", async () => {
      const mockResponse = {
        data: {
          status: "success",
          queries: [],
          chunks: [],
          mode: "vector",
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        working_dir: "/data/project",
        query: "test",
        top_k: 5,
        num_variations: 2,
        relevance_threshold: 0.5,
        enable_llm_judge: false,
        mode: "hybrid" as const,
      };

      await ragQueryApi.queryClassical(request);

      const calledBody = vi.mocked(ragApiClient.post).mock.calls[0][1] as Record<
        string,
        unknown
      >;
      expect(calledBody).not.toHaveProperty("vector_distance_threshold");
    });

    it("parses chunks with optional scores", async () => {
      const mockResponse = {
        data: {
          status: "success",
          queries: ["test query"],
          chunks: [
            {
              chunk_id: "c1",
              content: "content",
              file_path: "doc.md",
              relevance_score: 7.0,
              metadata: { key: "value" },
            },
          ],
          mode: "vector",
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        working_dir: "/data/project",
        query: "test",
        top_k: 5,
        num_variations: 2,
        relevance_threshold: 0.6,
        enable_llm_judge: true,
        mode: "vector" as const,
      };

      const result = await ragQueryApi.queryClassical(request);

      expect(result.chunks[0].bm25_score).toBeUndefined();
      expect(result.chunks[0].vector_score).toBeUndefined();
      expect(result.chunks[0].combined_score).toBeUndefined();
    });

    it("propagates error when axios rejects", async () => {
      vi.mocked(ragApiClient.post).mockRejectedValue(
        new Error("Service unavailable"),
      );

      const request = {
        working_dir: "/data/project",
        query: "test",
        top_k: 5,
        num_variations: 2,
        relevance_threshold: 0.5,
        enable_llm_judge: false,
        mode: "hybrid" as const,
      };

      await expect(ragQueryApi.queryClassical(request)).rejects.toThrow(
        "Service unavailable",
      );
    });

    it("throws ZodError when response does not match schema", async () => {
      const mockResponse = {
        data: { invalid: "response" },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        working_dir: "/data/project",
        query: "test",
        top_k: 5,
        num_variations: 2,
        relevance_threshold: 0.5,
        enable_llm_judge: false,
        mode: "hybrid" as const,
      };

      await expect(ragQueryApi.queryClassical(request)).rejects.toThrow();
    });
  });
});
