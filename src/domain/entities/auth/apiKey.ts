/**
 * API key entity — per-user personal access tokens used as the secondary
 * authentication mechanism (X-API-Key) alongside the oauth2-proxy JWT cookie.
 *
 * `plaintext` is only ever returned ONCE, on creation. It is never persisted
 * client-side and must be displayed once with a copy + warning UX.
 */

export interface ApiKeyView {
  readonly id: string;
  readonly name: string;
  /** Visible prefix (e.g. `csk_abc12`) shown in the list. */
  readonly key_prefix: string;
  readonly created_at: string;
  readonly last_used_at?: string | null;
  readonly revoked_at?: string | null;
}

export interface CreatedApiKey {
  readonly id: string;
  readonly name: string;
  readonly key_prefix: string;
  /** Plaintext returned ONCE on creation. */
  readonly plaintext: string;
  readonly created_at: string;
}

export interface CreateApiKeyInput {
  readonly name: string;
}
