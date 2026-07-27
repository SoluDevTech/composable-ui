import type { ApiKeyView, CreatedApiKey, CreateApiKeyInput } from "@/domain/entities/auth/apiKey";

/**
 * Port for per-user API key management (personal access tokens used as
 * the secondary `X-API-Key` authentication mechanism).
 *
 * Implemented by `apiKeyApi` and consumed by the `useApiKeys` hook.
 */
export interface IApiKeyPort {
  /** Lists the user's API keys (active + revoked, plaintext never returned). */
  list(): Promise<ApiKeyView[]>;
  /** Creates a new key. `plaintext` is returned ONCE — display + copy UX. */
  create(input: CreateApiKeyInput): Promise<CreatedApiKey>;
  /** Revokes (soft-deletes) a key by id. */
  revoke(id: string): Promise<void>;
}
