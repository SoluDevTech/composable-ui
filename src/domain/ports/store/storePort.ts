import type { StoreFile, StoreFileMetadata } from "@/domain/entities/store/storeFile";

export interface StoreFilePreview {
  path: string;
  preview: string;
}

export interface IStorePort {
  listFiles(prefix: string): Promise<StoreFileMetadata[]>;
  listFilePreviews(prefix: string, chars: number): Promise<StoreFilePreview[]>;
  getFile(path: string): Promise<StoreFile | null>;
  putFile(path: string, content: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
}
