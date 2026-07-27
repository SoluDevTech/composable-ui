import type { ApiKeyView, CreatedApiKey, CreateApiKeyInput } from "@/domain/entities/auth/apiKey";
import type { IApiKeyPort } from "@/domain/ports/auth/apiKeyPort";
import { apiClient } from "@/infrastructure/api/axiosInstance";

/**
 * Infrastructure adapter — implements IApiKeyPort against the
 * composable-agents backend (`/api/v1/api-keys`).
 */
export const apiKeyApi: IApiKeyPort = {
  async list(): Promise<ApiKeyView[]> {
    const response = await apiClient.get<ApiKeyView[]>("/api/v1/api-keys");
    return response.data ?? [];
  },

  async create(input: CreateApiKeyInput): Promise<CreatedApiKey> {
    const response = await apiClient.post<CreatedApiKey>("/api/v1/api-keys", {
      name: input.name,
    });
    return response.data;
  },

  async revoke(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/api-keys/${id}`);
  },
};
