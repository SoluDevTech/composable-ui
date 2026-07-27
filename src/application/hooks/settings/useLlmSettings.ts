import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/infrastructure/api/settings/settingsApi";
import type { LlmSettings, UpsertLlmSettingsInput } from "@/domain/entities/settings/llmSettings";

const QUERY_KEY = ["settings", "llm"] as const;

export interface UseLlmSettingsResult {
  readonly settings: LlmSettings | null;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: Error | null;
  readonly upsert: (input: UpsertLlmSettingsInput) => Promise<LlmSettings>;
  readonly remove: () => Promise<void>;
  readonly isUpserting: boolean;
  readonly isRemoving: boolean;
}

/**
 * Application hook — bridges the SettingsPage with the LLM settings port.
 *
 * Fetches the current settings on mount (TanStack Query cache) and exposes
 * `upsert`/`remove` mutations that update the cached value on success.
 */
export function useLlmSettings(): UseLlmSettingsResult {
  const queryClient = useQueryClient();

  const query = useQuery<LlmSettings | null>({
    queryKey: QUERY_KEY,
    queryFn: () => settingsApi.getLlmSettings(),
  });

  const upsertMutation = useMutation({
    mutationFn: (input: UpsertLlmSettingsInput) => settingsApi.upsertLlmSettings(input),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => settingsApi.deleteLlmSettings(),
    onSuccess: () => {
      queryClient.setQueryData(QUERY_KEY, null);
    },
  });

  return {
    settings: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    upsert: upsertMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isUpserting: upsertMutation.isPending,
    isRemoving: deleteMutation.isPending,
  };
}
