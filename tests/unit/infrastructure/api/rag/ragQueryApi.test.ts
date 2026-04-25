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
        data: {
          status: "success",
          message: "Query completed",
          data: "LightRAG response text",
          metadata: { source_count: 5, elapsed_time_ms: 1200 },
        },
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
      expect(result).toEqual({
        status: "success",
        message: "Query completed",
        data: "LightRAG response text",
        metadata: { sourceCount: 5, elapsedTimeMs: 1200 },
      });
    });

    it("maps snake_case response to camelCase", async () => {
      const mockResponse = {
        data: {
          status: "success",
          data: "some result",
          metadata: { source_count: 3, elapsed_time_ms: 800 },
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        working_dir: "/data/project",
        query: "test query",
        mode: "local" as const,
        top_k: 10,
      };

      const result = await ragQueryApi.queryLightRAG(request);

      expect(result.metadata?.sourceCount).toBe(3);
      expect(result.metadata?.elapsedTimeMs).toBe(800);
    });

    it("handles response without optional message and metadata", async () => {
      const mockResponse = {
        data: {
          status: "success",
          data: "LightRAG result",
        },
      };
      vi.mocked(ragApiClient.post).mockResolvedValue(mockResponse);

      const request = {
        working_dir: "/data/project",
        query: "test",
        mode: "naive" as const,
        top_k: 5,
      };

      const result = await ragQueryApi.queryLightRAG(request);

      expect(result.status).toBe("success");
      expect(result.data).toBe("LightRAG result");
      expect(result.message).toBeUndefined();
      expect(result.metadata).toBeUndefined();
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
  });

  describe("queryClassical", () => {
    it("sends correct POST to /api/v1/classical/query with body", async () => {
      const mockResponse = {
        data: {
          status: "success",
          message: "Classical query completed",
          data: "Classical RAG response",
          metadata: { source_count: 4, elapsed_time_ms: 950 },
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
      expect(result).toEqual({
        status: "success",
        message: "Classical query completed",
        data: "Classical RAG response",
        metadata: { sourceCount: 4, elapsedTimeMs: 950 },
      });
    });

    it("sends optional vector_distance_threshold when provided", async () => {
      const mockResponse = {
        data: {
          status: "success",
          data: "result text",
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
        mode: "local" as const,
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
          data: "result",
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
        mode: "local" as const,
      };

      await ragQueryApi.queryClassical(request);

      const calledBody = vi.mocked(ragApiClient.post).mock.calls[0][1] as Record<
        string,
        unknown
      >;
      expect(calledBody).not.toHaveProperty("vector_distance_threshold");
    });

    it("maps snake_case response to camelCase", async () => {
      const mockResponse = {
        data: {
          status: "success",
          data: "classical result",
          metadata: { source_count: 7, elapsed_time_ms: 2100 },
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
        mode: "hybrid" as const,
      };

      const result = await ragQueryApi.queryClassical(request);

      expect(result.metadata?.sourceCount).toBe(7);
      expect(result.metadata?.elapsedTimeMs).toBe(2100);
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
        mode: "local" as const,
      };

      await expect(ragQueryApi.queryClassical(request)).rejects.toThrow(
        "Service unavailable",
      );
    });
  });
});