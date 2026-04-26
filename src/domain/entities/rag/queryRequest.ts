export type QueryMode =
  | "naive"
  | "local"
  | "global"
  | "hybrid"
  | "hybrid+"
  | "mix"
  | "bm25"
  | "bypass";

export type ClassicalQueryMode = "vector" | "hybrid";

export interface LightRAGQueryRequest {
  working_dir: string;
  query: string;
  mode: QueryMode;
  top_k: number;
}

export interface ClassicalQueryRequest {
  working_dir: string;
  query: string;
  top_k: number;
  num_variations: number;
  relevance_threshold: number;
  vector_distance_threshold?: number;
  enable_llm_judge: boolean;
  mode: ClassicalQueryMode;
}

