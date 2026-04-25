import type { FileContentResponse } from "@/domain/entities/rag/fileContent";

export interface IRagFileContentPort {
  readFile(filePath: string): Promise<FileContentResponse>;
}