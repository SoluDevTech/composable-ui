import { useMutation } from "@tanstack/react-query";
import { ragQueryApi } from "@/infrastructure/api/rag/ragQueryApi";
import type { ClassicalQueryMode } from "@/domain/entities/rag/queryRequest";

export function useClassicalQuery() {
  return useMutation({
    mutationFn: (request: {
      workingDir: string;
      query: string;
      topK: number;
      numVariations: number;
      relevanceThreshold: number;
      vectorDistanceThreshold?: number;
      enableLlmJudge: boolean;
      mode: ClassicalQueryMode;
    }) =>
      ragQueryApi.queryClassical({
        working_dir: request.workingDir,
        query: request.query,
        top_k: request.topK,
        num_variations: request.numVariations,
        relevance_threshold: request.relevanceThreshold,
        vector_distance_threshold: request.vectorDistanceThreshold,
        enable_llm_judge: request.enableLlmJudge,
        mode: request.mode,
      }),
  });
}