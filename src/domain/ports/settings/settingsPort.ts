import type { LlmSettings, UpsertLlmSettingsInput } from "@/domain/entities/settings/llmSettings";

/**
 * Port for per-user LLM settings (provider, base_url, api_key).
 *
 * Implemented by the infrastructure adapter `settingsApi` and consumed by
 * the application hook `useLlmSettings`. The domain layer never touches
 * the network — it only defines this contract.
 */
export interface ISettingsPort {
  /** Returns the current user's LLM settings, or null if none configured. */
  getLlmSettings(): Promise<LlmSettings | null>;
  /** Creates or replaces the user's LLM settings. Returns the masked response. */
  upsertLlmSettings(input: UpsertLlmSettingsInput): Promise<LlmSettings>;
  /** Deletes the user's LLM settings. */
  deleteLlmSettings(): Promise<void>;
}
