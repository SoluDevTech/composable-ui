import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiKeyApi } from "@/infrastructure/api/auth/apiKeyApi";
import type { ApiKeyView, CreatedApiKey, CreateApiKeyInput } from "@/domain/entities/auth/apiKey";

const QUERY_KEY = ["api-keys"] as const;

export interface UseApiKeysResult {
  readonly keys: ApiKeyView[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: Error | null;
  readonly create: (input: CreateApiKeyInput) => Promise<CreatedApiKey>;
  readonly revoke: (id: string) => Promise<void>;
  readonly isCreating: boolean;
  readonly isRevoking: boolean;
}

/**
 * Application hook — bridges the SettingsPage with the API key port.
 *
 * Lists the user's keys on mount and exposes create/revoke mutations that
 * invalidate the list after each change. The plaintext returned on create is
 * captured once by the caller (the page) — it is never persistently stored.
 */
export function useApiKeys(): UseApiKeysResult {
  const queryClient = useQueryClient();

  const query = useQuery<ApiKeyView[]>({
    queryKey: QUERY_KEY,
    queryFn: () => apiKeyApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateApiKeyInput) => apiKeyApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => apiKeyApi.revoke(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    keys: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    create: createMutation.mutateAsync,
    revoke: revokeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isRevoking: revokeMutation.isPending,
  };
}
