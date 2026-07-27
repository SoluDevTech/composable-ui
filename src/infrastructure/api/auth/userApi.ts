import type { UserProfile } from "@/domain/entities/auth/currentUser";
import type { ICurrentUserPort } from "@/domain/ports/auth/currentUserPort";
import { apiClient } from "@/infrastructure/api/axiosInstance";

/**
 * Infrastructure adapter — implements ICurrentUserPort against the
 * composable-agents backend (`/api/v1/users/me`).
 */
export const userApi: ICurrentUserPort = {
  async me(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>("/api/v1/users/me");
    return response.data;
  },
};