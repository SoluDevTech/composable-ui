import type { StoreFile, StoreFileMetadata } from "@/domain/entities/store/storeFile";
import type { IStorePort } from "@/domain/ports/store/storePort";
import { apiClient } from "@/infrastructure/api/axiosInstance";

/**
 * Axios-based implementation of {@link IStorePort}. The backend returns a list
 * of path strings for `listFiles`; we map each to a `StoreFileMetadata`
 * object. Missing files (HTTP 404) resolve to `null` for `getFile`.
 */
export const storeApi: IStorePort = {
  async listFiles(prefix: string): Promise<StoreFileMetadata[]> {
    const response = await apiClient.get<string[]>("/api/v1/store/files", { params: { prefix } });
    return response.data.map((path) => ({ path }));
  },

  async getFile(path: string): Promise<StoreFile | null> {
    try {
      const response = await apiClient.get<StoreFile>(
        `/api/v1/store/files/${encodeURIComponent(path)}`,
      );
      return response.data;
    } catch (error) {
      // 404 (or any "not found") resolves to null per the port contract.
      if (isNotFound(error)) return null;
      throw error;
    }
  },

  async putFile(path: string, content: string): Promise<void> {
    await apiClient.put(`/api/v1/store/files/${encodeURIComponent(path)}`, {
      content,
    });
  },

  async deleteFile(path: string): Promise<void> {
    await apiClient.delete(`/api/v1/store/files/${encodeURIComponent(path)}`);
  },
};

function isNotFound(error: unknown): boolean {
  if (error && typeof error === "object" && "response" in error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    return status === 404;
  }
  return false;
}

/**
 * Extract a human-readable error message from an axios error. The backend's
 * actual error body (`detail` or `message`) is preferred over axios's generic
 * "Request failed with status code N" message.
 */
export function extractApiMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const data = (error as { response?: { data?: { detail?: unknown; message?: unknown } } })
      .response?.data;
    if (typeof data?.detail === "string" && data.detail) return data.detail;
    if (typeof data?.message === "string" && data.message) return data.message;
  }
  if (error instanceof Error) return error.message;
  return "Unknown error";
}
