import type { FileEntry, FolderEntry } from "@/domain/entities/rag/fileEntry";

export interface IRagFilePort {
  listFolders(prefix?: string): Promise<FolderEntry[]>;
  listFiles(prefix?: string, recursive?: boolean): Promise<FileEntry[]>;
  uploadFile(
    prefix: string,
    file: File,
  ): Promise<{ object_name: string; size: number; message: string }>;
  createFolder(prefix: string): Promise<{ message: string }>;
  deleteFile(objectName: string, workingDir?: string): Promise<{ message: string }>;
  deleteFolder(prefix: string): Promise<{ message: string }>;
}
