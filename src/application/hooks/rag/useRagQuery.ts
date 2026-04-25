import { useMutation } from "@tanstack/react-query";
import { ragQueryApi } from "@/infrastructure/api/rag/ragQueryApi";
import type { QueryMode } from "@/domain/entities/rag/queryRequest";

export function useRagQuery() {
  return useMutation({
    mutationFn: (request: {
      workingDir: string;
      query: string;
      mode: QueryMode;
      topK: number;
    }) =>
      ragQueryApi.queryLightRAG({
        working_dir: request.workingDir,
        query: request.query,
        mode: request.mode,
        top_k: request.topK,
      }),
  });
}