import { ragApiClient } from "@/infrastructure/api/ragAxiosInstance";
import type { IRagQueryPort } from "@/domain/ports/rag/ragQueryPort";
import { ChunkResponseSchema } from "@/domain/entities/rag/chunkResponse";
import { ClassicalQueryResponseSchema } from "@/domain/entities/rag/classicalQueryResponse";

export const ragQueryApi: IRagQueryPort = {
  async queryLightRAG(request) {
    const response = await ragApiClient.post<unknown>("/api/v1/query", {
      working_dir: request.working_dir,
      query: request.query,
      mode: request.mode,
      top_k: request.top_k,
    });
    const parsed = ChunkResponseSchema.array().parse(response.data);
    return parsed;
  },

  async queryClassical(request) {
    const body: Record<string, unknown> = {
      working_dir: request.working_dir,
      query: request.query,
      top_k: request.top_k,
      num_variations: request.num_variations,
      relevance_threshold: request.relevance_threshold,
      enable_llm_judge: request.enable_llm_judge,
      mode: request.mode,
    };
    if (request.vector_distance_threshold !== undefined) {
      body.vector_distance_threshold = request.vector_distance_threshold;
    }
    const response = await ragApiClient.post<unknown>("/api/v1/classical/query", body);
    const parsed = ClassicalQueryResponseSchema.parse(response.data);
    return parsed;
  },
};
