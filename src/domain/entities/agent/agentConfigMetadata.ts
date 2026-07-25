export interface AgentConfigMetadata {
  name: string;
  model: string;
  description?: string | null;
  minio_path: string;
  created_at: string;
  updated_at: string;
}
