import { describe, it, expect, beforeEach, vi } from "vitest";
import type { LlmSettings } from "@/domain/entities/settings/llmSettings";
import type { UpsertLlmSettingsInput } from "@/domain/entities/settings/llmSettings";

vi.mock("@/infrastructure/api/axiosInstance", () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { settingsApi } from "@/infrastructure/api/settings/settingsApi";
import { apiClient } from "@/infrastructure/api/axiosInstance";

describe("settingsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLlmSettings", () => {
    it("fetches GET /api/v1/settings/llm and returns the parsed LlmSettings", async () => {
      const payload: LlmSettings = {
        user_id: "u1",
        provider: "openai",
        base_url: "https://api.openai.com/v1",
        api_key_masked: "sk-***1234",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-02T00:00:00Z",
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: payload });

      const result = await settingsApi.getLlmSettings();

      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/settings/llm");
      expect(result).toEqual(payload);
    });

    it("returns null when the backend responds with null (no settings configured)", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: null });

      const result = await settingsApi.getLlmSettings();

      expect(result).toBeNull();
    });
  });

  describe("upsertLlmSettings", () => {
    it("PUTs /api/v1/settings/llm with the provider/base_url/api_key body and returns masked response", async () => {
      const input: UpsertLlmSettingsInput = {
        provider: "openai",
        base_url: "https://api.openai.com/v1",
        api_key: "sk-secret",
      };
      const masked: LlmSettings = {
        user_id: "u1",
        provider: "openai",
        base_url: "https://api.openai.com/v1",
        api_key_masked: "sk-***",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-03T00:00:00Z",
      };
      vi.mocked(apiClient.put).mockResolvedValue({ data: masked });

      const result = await settingsApi.upsertLlmSettings(input);

      expect(apiClient.put).toHaveBeenCalledWith("/api/v1/settings/llm", {
        provider: "openai",
        base_url: "https://api.openai.com/v1",
        api_key: "sk-secret",
      });
      expect(result).toEqual(masked);
    });
  });

  describe("deleteLlmSettings", () => {
    it("DELETEs /api/v1/settings/llm and resolves void", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ status: 204 });

      await settingsApi.deleteLlmSettings();

      expect(apiClient.delete).toHaveBeenCalledWith("/api/v1/settings/llm");
    });
  });
});
