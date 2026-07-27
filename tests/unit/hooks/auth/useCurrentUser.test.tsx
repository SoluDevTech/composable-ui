import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { useCurrentUser } from "@/application/hooks/auth/useCurrentUser";
import { userApi } from "@/infrastructure/api/auth/userApi";
import type { UserProfile } from "@/domain/entities/auth/currentUser";

vi.mock("@/infrastructure/api/auth/userApi", () => ({
  userApi: {
    me: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the profile when data loads", async () => {
    // Arrange
    const profile: UserProfile = {
      userId: "user-123",
      email: "jane@example.com",
      name: "Jane Doe",
      username: "jane",
    };
    vi.mocked(userApi.me).mockResolvedValue(profile);

    // Act
    const { result } = renderHook(() => useCurrentUser(), { wrapper: createWrapper() });

    // Assert
    await waitFor(() => expect(result.current.profile).not.toBeNull());
    expect(result.current.profile).toEqual(profile);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("exposes the error and null profile when the call fails", async () => {
    // Arrange
    vi.mocked(userApi.me).mockRejectedValue(new Error("Unauthorized"));

    // Act
    const { result } = renderHook(() => useCurrentUser(), { wrapper: createWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("calls userApi.me exactly once per mount", async () => {
    // Arrange
    vi.mocked(userApi.me).mockResolvedValue({ userId: "u1" });

    // Act
    renderHook(() => useCurrentUser(), { wrapper: createWrapper() });

    // Assert
    await waitFor(() => expect(vi.mocked(userApi.me)).toHaveBeenCalledTimes(1));
  });
});