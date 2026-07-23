import type { ClassicalQueryRequest } from "@/domain/entities/rag/queryRequest";
import type { ClassicalQueryResponse } from "@/domain/entities/rag/classicalQueryResponse";

export interface IRagQueryPort {
  queryClassical(request: ClassicalQueryRequest): Promise<ClassicalQueryResponse>;
}
