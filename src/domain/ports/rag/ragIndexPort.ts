import type {
  ClassicalIndexFileRequest,
  ClassicalIndexFolderRequest,
} from "@/domain/entities/rag/indexingRequest";

export interface IRagIndexPort {
  indexFileClassical(
    request: ClassicalIndexFileRequest,
  ): Promise<{ status: string; message: string }>;
  indexFolderClassical(
    request: ClassicalIndexFolderRequest,
  ): Promise<{ status: string; message: string }>;
}
