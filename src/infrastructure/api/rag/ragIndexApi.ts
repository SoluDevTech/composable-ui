import { ragApiClient } from "@/infrastructure/api/ragAxiosInstance";
import type { IRagIndexPort } from "@/domain/ports/rag/ragIndexPort";

export const ragIndexApi: IRagIndexPort = {
  async indexFile(request) {
    const response = await ragApiClient.post<{ status: string; message: string }>("/api/v1/file/index", {
      file_name: request.file_name,
      working_dir: request.working_dir,
    });
    return {
      status: response.data.status,
      message: response.data.message,
    };
  },

  async indexFolder(request) {
    const body: Record<string, unknown> = {
      working_dir: request.working_dir,
      recursive: request.recursive,
    };
    if (request.file_extensions) {
      body.file_extensions = request.file_extensions;
    }
    const response = await ragApiClient.post<{ status: string; message: string }>("/api/v1/folder/index", body);
    return {
      status: response.data.status,
      message: response.data.message,
    };
  },

  async indexFileClassical(request) {
    const response = await ragApiClient.post<{ status: string; message: string }>("/api/v1/classical/file/index", {
      file_name: request.file_name,
      working_dir: request.working_dir,
      chunk_size: request.chunk_size,
      chunk_overlap: request.chunk_overlap,
    });
    return {
      status: response.data.status,
      message: response.data.message,
    };
  },

  async indexFolderClassical(request) {
    const body: Record<string, unknown> = {
      working_dir: request.working_dir,
      recursive: request.recursive,
      chunk_size: request.chunk_size,
      chunk_overlap: request.chunk_overlap,
    };
    if (request.file_extensions) {
      body.file_extensions = request.file_extensions;
    }
    const response = await ragApiClient.post<{ status: string; message: string }>("/api/v1/classical/folder/index", body);
    return {
      status: response.data.status,
      message: response.data.message,
    };
  },
};