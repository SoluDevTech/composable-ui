/**
 * Current-user profile entity — public projection of the authenticated user
 * returned by `GET /api/v1/users/me`.
 *
 * The optional fields (`email`, `name`, `username`) are populated from the JWT
 * claims when the user authenticated via oauth2-proxy (Logto). For API-key
 * auth only `userId` is available and the optional fields are `null`.
 */

export interface UserProfile {
  readonly userId: string;
  readonly email?: string | null;
  readonly name?: string | null;
  readonly username?: string | null;
}

/**
 * Best-effort display name for the current user.
 *
 * Priority: `name` -> `username` -> local part of `email` -> `userId`.
 * Never returns an empty string.
 */
export function getDisplayName(profile: UserProfile | null | undefined): string {
  if (!profile) return "";
  if (profile.name && profile.name.trim()) return profile.name.trim();
  if (profile.username && profile.username.trim()) return profile.username.trim();
  if (profile.email && profile.email.trim()) {
    const localPart = profile.email.split("@")[0];
    if (localPart) return localPart;
  }
  return profile.userId;
}

/**
 * Up to two uppercase initials derived from the display name.
 *
 * Takes the first letter of the first two whitespace-separated words
 * (e.g. "Jane Doe" -> "JD", "jane" -> "J"). Falls back to the first
 * character of the display name, then to a single space when no display
 * name is available (loading state).
 */
export function getInitials(displayName: string): string {
  if (!displayName) return " ";
  const words = displayName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return " ";
  const first = words[0].charAt(0).toUpperCase();
  if (words.length === 1) return first;
  const second = words[1].charAt(0).toUpperCase();
  return (first + second).slice(0, 2);
}