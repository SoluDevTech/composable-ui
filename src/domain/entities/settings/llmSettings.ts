/**
 * Per-user LLM settings entity.
 *
 * Persisted on the backend (PUT /api/v1/settings/llm). The API key is only
 * ever returned in masked form from the backend; the plaintext is sent
 * once on save and never stored client-side.
 */
export interface LlmSettings {
  readonly user_id: string;
  readonly provider: string;
  readonly base_url: string;
  /** Masked representation of the stored API key (e.g. `sk-***1234`). */
  readonly api_key_masked?: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Input payload sent to the backend to create or update LLM settings.
 * `api_key` is sent as plaintext; the backend stores only a hash.
 */
export interface UpsertLlmSettingsInput {
  readonly provider: string;
  readonly base_url: string;
  readonly api_key: string;
}
