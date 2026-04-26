import type {
  LightRAGQueryRequest,
  ClassicalQueryRequest,
  RagQueryResponse,
} from "@/domain/entities/rag/queryRequest";

export interface IRagQueryPort {
  queryLightRAG(request: LightRAGQueryRequest): Promise<RagQueryResponse>;
  queryClassical(request: ClassicalQueryRequest): Promise<RagQueryResponse>;
}