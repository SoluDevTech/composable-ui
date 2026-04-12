import type { IRagFilePort } from "@/domain/ports/rag/ragFilePort";
import { apiClient } from "@/infrastructure/api/axiosInstance";

export const ragApi: IRagFilePort = {
  async uploadFile(
    prefix: string,
    file: File,
  ): Promise<{ object_name: string; size: number; message: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prefix", prefix);
    const response = await apiClient.post("/api/v1/files/upload", formData);
    return response.data;
  },
};
