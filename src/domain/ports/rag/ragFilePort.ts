import type { FileEntry, FolderEntry } from "@/domain/entities/rag/fileEntry";

export interface IRagFilePort {
  listFolders(prefix?: string): Promise<FolderEntry[]>;
  listFiles(prefix?: string, recursive?: boolean): Promise<FileEntry[]>;
  uploadFile(
    prefix: string,
    file: File,
  ): Promise<{ object_name: string; size: number; message: string }>;
}
