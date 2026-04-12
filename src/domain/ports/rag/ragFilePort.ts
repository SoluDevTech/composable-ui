import type { FileEntry, FolderEntry } from "@/domain/entities/rag/fileEntry";

export interface IRagFilePort {
  listFolders(prefix?: string): Promise<FolderEntry[]>;
  listFiles(prefix?: string, recursive?: boolean): Promise<FileEntry[]>;
}
