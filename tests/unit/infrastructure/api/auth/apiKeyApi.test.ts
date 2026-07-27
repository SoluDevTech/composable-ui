import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ApiKeyView, CreatedApiKey } from "@/domain/entities/auth/apiKey";

vi.mock("@/infrastructure/api/axiosInstance", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiKeyApi } from "@/infrastructure/api/auth/apiKeyApi";
import { apiClient } from "@/infrastructure/api/axiosInstance";

describe("apiKeyApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("GETs /api/v1/api-keys and returns the ApiKeyView[]", async () => {
      const keys: ApiKeyView[] = [
        {
          id: "k1",
          name: "ci",
          key_prefix: "csk_abc12",
          created_at: "2025-01-01T00:00:00Z",
          last_used_at: "2025-01-04T00:00:00Z",
          revoked_at: null,
        },
      ];
      vi.mocked(apiClient.get).mockResolvedValue({ data: keys });

      const result = await apiKeyApi.list();

      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/api-keys");
      expect(result).toEqual(keys);
    });
  });

  describe("create", () => {
    it("POSTs {name} to /api/v1/api-keys and returns the CreatedApiKey (with plaintext)", async () => {
      const created: CreatedApiKey = {
        id: "k2",
        name: "ci",
        key_prefix: "csk_abc12",
        plaintext: "csk_live_supersecret",
        created_at: "2025-01-05T00:00:00Z",
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: created });

      const result = await apiKeyApi.create({ name: "ci" });

      expect(apiClient.post).toHaveBeenCalledWith("/api/v1/api-keys", { name: "ci" });
      expect(result).toEqual(created);
      expect(result.plaintext).toBe("csk_live_supersecret");
    });
  });

  describe("revoke", () => {
    it("DELETEs /api/v1/api-keys/{id} and resolves void", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ status: 204 });

      await apiKeyApi.revoke("k1");

      expect(apiClient.delete).toHaveBeenCalledWith("/api/v1/api-keys/k1");
    });
  });
});
