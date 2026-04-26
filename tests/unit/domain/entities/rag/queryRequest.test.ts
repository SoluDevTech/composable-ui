import { describe, it, expect } from "vitest";

describe("LightRAGQueryRequest", () => {
  it("allows constructing an object with all required fields", async () => {
    const { LightRAGQueryRequest } = await import(
      "@/domain/entities/rag/queryRequest"
    );

    const request: LightRAGQueryRequest = {
      working_dir: "/data/projects/acme",
      query: "What are the main findings?",
      mode: "hybrid",
      top_k: 10,
    };

    expect(request.working_dir).toBe("/data/projects/acme");
    expect(request.query).toBe("What are the main findings?");
    expect(request.mode).toBe("hybrid");
    expect(request.top_k).toBe(10);
  });

  it("accepts all valid QueryMode values", async () => {
    const { LightRAGQueryRequest, QueryMode } = await import(
      "@/domain/entities/rag/queryRequest"
    );

    const validModes: QueryMode[] = [
      "naive",
      "local",
      "global",
      "hybrid",
      "hybrid+",
      "mix",
      "bm25",
      "bypass",
    ];

    for (const mode of validModes) {
      const request: LightRAGQueryRequest = {
        working_dir: "/data/test",
        query: "test query",
        mode,
        top_k: 5,
      };
      expect(request.mode).toBe(mode);
    }
  });
});

describe("ClassicalQueryRequest", () => {
  it("allows constructing an object with all required fields", async () => {
    const { ClassicalQueryRequest } = await import(
      "@/domain/entities/rag/queryRequest"
    );

    const request: ClassicalQueryRequest = {
      working_dir: "/data/projects/acme",
      query: "Summarize the document",
      top_k: 5,
      num_variations: 3,
      relevance_threshold: 0.75,
      enable_llm_judge: true,
      mode: "hybrid",
    };

    expect(request.working_dir).toBe("/data/projects/acme");
    expect(request.query).toBe("Summarize the document");
    expect(request.top_k).toBe(5);
    expect(request.num_variations).toBe(3);
    expect(request.relevance_threshold).toBe(0.75);
    expect(request.enable_llm_judge).toBe(true);
    expect(request.mode).toBe("hybrid");
  });

  it("accepts optional vector_distance_threshold", async () => {
    const { ClassicalQueryRequest } = await import(
      "@/domain/entities/rag/queryRequest"
    );

    const withThreshold: ClassicalQueryRequest = {
      working_dir: "/data/test",
      query: "test",
      top_k: 5,
      num_variations: 2,
      relevance_threshold: 0.8,
      vector_distance_threshold: 0.5,
      enable_llm_judge: false,
      mode: "vector",
    };

    expect(withThreshold.vector_distance_threshold).toBe(0.5);
  });

  it("allows omitting optional vector_distance_threshold", async () => {
    const { ClassicalQueryRequest } = await import(
      "@/domain/entities/rag/queryRequest"
    );

    const withoutThreshold: ClassicalQueryRequest = {
      working_dir: "/data/test",
      query: "test",
      top_k: 5,
      num_variations: 2,
      relevance_threshold: 0.8,
      enable_llm_judge: false,
      mode: "vector",
    };

    expect(withoutThreshold.vector_distance_threshold).toBeUndefined();
  });

  it("accepts all valid ClassicalQueryMode values", async () => {
    const { ClassicalQueryMode } = await import(
      "@/domain/entities/rag/queryRequest"
    );

    const validModes: ClassicalQueryMode[] = ["vector", "hybrid"];

    for (const mode of validModes) {
      const request: ClassicalQueryRequest = {
        working_dir: "/data/test",
        query: "test",
        top_k: 5,
        num_variations: 1,
        relevance_threshold: 0.5,
        enable_llm_judge: false,
        mode,
      };
      expect(request.mode).toBe(mode);
    }
  });
});

describe("RagQueryResponse", () => {
  it("allows constructing a response with status and data", async () => {
    const { RagQueryResponse } = await import(
      "@/domain/entities/rag/queryRequest"
    );

    const response: RagQueryResponse = {
      status: "success",
      data: { results: ["result1", "result2"] },
    };

    expect(response.status).toBe("success");
    expect(response.data).toEqual({ results: ["result1", "result2"] });
  });

  it("allows including optional message and metadata", async () => {
    const { RagQueryResponse } = await import(
      "@/domain/entities/rag/queryRequest"
    );

    const response: RagQueryResponse = {
      status: "success",
      message: "Query completed successfully",
      data: ["chunk1", "chunk2"],
      metadata: { total: 2, elapsed_ms: 150 },
    };

    expect(response.message).toBe("Query completed successfully");
    expect(response.metadata).toEqual({ total: 2, elapsed_ms: 150 });
  });

  it("allows constructing an error response", async () => {
    const { RagQueryResponse } = await import(
      "@/domain/entities/rag/queryRequest"
    );

    const response: RagQueryResponse = {
      status: "error",
      message: "Working directory not found",
      data: null,
    };

    expect(response.status).toBe("error");
    expect(response.message).toBe("Working directory not found");
  });

  it("allows omitting optional message and metadata", async () => {
    const { RagQueryResponse } = await import(
      "@/domain/entities/rag/queryRequest"
    );

    const response: RagQueryResponse = {
      status: "success",
      data: [],
    };

    expect(response.message).toBeUndefined();
    expect(response.metadata).toBeUndefined();
  });
});