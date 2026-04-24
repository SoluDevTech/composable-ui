import { ragApiClient } from "@/infrastructure/api/ragAxiosInstance";
import type { IRagFilePort } from "@/domain/ports/rag/ragFilePort";
import { FileEntry, FolderEntry } from "@/domain/entities/rag/fileEntry";

export const ragApi: IRagFilePort = {
  async listFolders(prefix?: string) {
    const params = new URLSearchParams();
    if (prefix !== undefined) params.set("prefix", prefix);
    const qs = params.toString();
    const response = await ragApiClient.get<string[]>(
      `/api/v1/files/folders${qs ? `?${qs}` : ""}`,
    );
    return response.data.map((p) => new FolderEntry({ prefix: p }));
  },

  async listFiles(prefix?: string, recursive = false) {
    const params = new URLSearchParams({
      prefix: prefix ?? "",
      recursive: String(recursive),
    });
    const response = await ragApiClient.get<
      { object_name: string; size: number; last_modified: string | null }[]
    >(`/api/v1/files/list?${params}`);

    return response.data.map(
      (f) =>
        new FileEntry({
          objectName: f.object_name,
          size: f.size,
          lastModified: f.last_modified,
        }),
    );
  },

  async uploadFile(prefix: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prefix", prefix);
    const response = await ragApiClient.post("/api/v1/files/upload", formData);
    return response.data;
  },
};
