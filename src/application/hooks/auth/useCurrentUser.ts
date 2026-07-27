import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/infrastructure/api/auth/userApi";
import type { UserProfile } from "@/domain/entities/auth/currentUser";

const QUERY_KEY = ["current-user"] as const;

export interface UseCurrentUserResult {
  readonly profile: UserProfile | null;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: Error | null;
}

/**
 * Application hook — bridges the UI with the current-user port.
 *
 * Fetches the authenticated user's profile once per session (the profile does
 * not change without a re-authentication, so `staleTime: Infinity` keeps the
 * cached result fresh for the whole session and avoids refetches on window
 * focus).
 */
export function useCurrentUser(): UseCurrentUserResult {
  const query = useQuery<UserProfile>({
    queryKey: QUERY_KEY,
    queryFn: () => userApi.me(),
    staleTime: Infinity,
    retry: false,
  });

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}