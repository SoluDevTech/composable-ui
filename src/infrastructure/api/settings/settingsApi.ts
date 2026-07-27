import type { LlmSettings, UpsertLlmSettingsInput } from "@/domain/entities/settings/llmSettings";
import type { ISettingsPort } from "@/domain/ports/settings/settingsPort";
import { apiClient } from "@/infrastructure/api/axiosInstance";

/**
 * Infrastructure adapter — implements ISettingsPort against the
 * composable-agents backend (`/api/v1/settings/llm`).
 */
export const settingsApi: ISettingsPort = {
  async getLlmSettings(): Promise<LlmSettings | null> {
    const response = await apiClient.get<LlmSettings | null>("/api/v1/settings/llm");
    return response.data ?? null;
  },

  async upsertLlmSettings(input: UpsertLlmSettingsInput): Promise<LlmSettings> {
    const response = await apiClient.put<LlmSettings>("/api/v1/settings/llm", {
      provider: input.provider,
      base_url: input.base_url,
      api_key: input.api_key,
    });
    return response.data;
  },

  async deleteLlmSettings(): Promise<void> {
    await apiClient.delete("/api/v1/settings/llm");
  },
};
