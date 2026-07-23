import { ragApiClient } from "@/infrastructure/api/ragAxiosInstance";
import type { IRagFileContentPort } from "@/domain/ports/rag/ragFileContentPort";
import type { FileContentResponse } from "@/domain/entities/rag/fileContent";

export const ragFileContentApi: IRagFileContentPort = {
  async readFile(filePath: string): Promise<FileContentResponse> {
    const response = await ragApiClient.post<{
      content: { page: number; content: string }[];
      metadata: { format_type: string; mime_type: string } | null;
      tables: { markdown: string }[] | null;
    }>("/api/v1/files/read", { file_path: filePath });

    return {
      content: response.data.content,
      metadata: response.data.metadata,
      tables: response.data.tables,
    };
  },
};
