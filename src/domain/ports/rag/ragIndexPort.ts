import type {
  IndexFileRequest,
  IndexFolderRequest,
  ClassicalIndexFileRequest,
  ClassicalIndexFolderRequest,
} from "@/domain/entities/rag/indexingRequest";

export interface IRagIndexPort {
  indexFile(request: IndexFileRequest): Promise<{ status: string; message: string }>;
  indexFolder(request: IndexFolderRequest): Promise<{ status: string; message: string }>;
  indexFileClassical(request: ClassicalIndexFileRequest): Promise<{ status: string; message: string }>;
  indexFolderClassical(request: ClassicalIndexFolderRequest): Promise<{ status: string; message: string }>;
}