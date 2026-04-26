import type { LightRAGQueryRequest, ClassicalQueryRequest } from "@/domain/entities/rag/queryRequest";
import type { ChunkResponse } from "@/domain/entities/rag/chunkResponse";
import type { ClassicalQueryResponse } from "@/domain/entities/rag/classicalQueryResponse";

export interface IRagQueryPort {
  queryLightRAG(request: LightRAGQueryRequest): Promise<ChunkResponse[]>;
  queryClassical(request: ClassicalQueryRequest): Promise<ClassicalQueryResponse>;
}
