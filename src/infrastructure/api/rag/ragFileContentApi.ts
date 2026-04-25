import { ragApiClient } from "@/infrastructure/api/ragAxiosInstance";
import type { IRagFileContentPort } from "@/domain/ports/rag/ragFileContentPort";
import type { FileContentResponse } from "@/domain/entities/rag/fileContent";

export const ragFileContentApi: IRagFileContentPort = {
  async readFile(filePath: string): Promise<FileContentResponse> {
    const response = await ragApiClient.post<{
      content: string;
      metadata: { format_type: string; mime_type: string };
      tables: { headers: string[]; rows: string[][] }[];
    }>("/api/v1/files/read", { file_path: filePath });

    const { content, metadata, tables } = response.data;
    return {
      content,
      metadata: {
        format_type: metadata.format_type,
        mime_type: metadata.mime_type,
      },
      tables,
    };
  },
};