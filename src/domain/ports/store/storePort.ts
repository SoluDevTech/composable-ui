import type { StoreFile, StoreFileMetadata } from "@/domain/entities/store/storeFile";

export interface IStorePort {
  listFiles(prefix: string): Promise<StoreFileMetadata[]>;
  getFile(path: string): Promise<StoreFile | null>;
  putFile(path: string, content: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
}
