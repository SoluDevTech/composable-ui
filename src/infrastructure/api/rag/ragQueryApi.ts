import { ragApiClient } from "@/infrastructure/api/ragAxiosInstance";
import type { IRagQueryPort } from "@/domain/ports/rag/ragQueryPort";
import type { RagQueryResponse } from "@/domain/entities/rag/queryRequest";

function mapMetadata(metadata: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!metadata) return undefined;
  const mapped: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    const camelKey = key.replaceAll(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    mapped[camelKey] = value;
  }
  return mapped;
}

export const ragQueryApi: IRagQueryPort = {
  async queryLightRAG(request) {
    const response = await ragApiClient.post<RagQueryResponse>("/api/v1/query", {
      working_dir: request.working_dir,
      query: request.query,
      mode: request.mode,
      top_k: request.top_k,
    });
    const data = response.data;
    return {
      status: data.status,
      message: (data as Record<string, unknown>).message as string | undefined,
      data: data.data,
      metadata: mapMetadata((data as Record<string, unknown>).metadata as Record<string, unknown> | undefined),
    };
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
    const response = await ragApiClient.post<RagQueryResponse>("/api/v1/classical/query", body);
    const data = response.data;
    return {
      status: data.status,
      message: (data as Record<string, unknown>).message as string | undefined,
      data: data.data,
      metadata: mapMetadata((data as Record<string, unknown>).metadata as Record<string, unknown> | undefined),
    };
  },
};