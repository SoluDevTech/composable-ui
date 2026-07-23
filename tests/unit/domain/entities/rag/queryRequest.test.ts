import { describe, it, expect } from "vitest";

describe("ClassicalQueryRequest", () => {
  it("allows constructing an object with all required fields", async () => {
    const { ClassicalQueryRequest } = await import("@/domain/entities/rag/queryRequest");

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
    const { ClassicalQueryRequest } = await import("@/domain/entities/rag/queryRequest");

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
    const { ClassicalQueryRequest } = await import("@/domain/entities/rag/queryRequest");

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
    const { ClassicalQueryMode } = await import("@/domain/entities/rag/queryRequest");

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
