import type { UserProfile } from "@/domain/entities/auth/currentUser";

/**
 * Port for retrieving the authenticated user's profile.
 *
 * Implemented by `userApi` and consumed by the `useCurrentUser` hook.
 */
export interface ICurrentUserPort {
  /** Returns the profile of the authenticated user (`GET /api/v1/users/me`). */
  me(): Promise<UserProfile>;
}