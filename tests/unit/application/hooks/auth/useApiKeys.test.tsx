import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { ReactNode } from "react";
import type { ApiKeyView, CreatedApiKey } from "@/domain/entities/auth/apiKey";

vi.mock("@/infrastructure/api/auth/apiKeyApi", () => ({
  apiKeyApi: {
    list: vi.fn(),
    create: vi.fn(),
    revoke: vi.fn(),
  },
}));

import { useApiKeys } from "@/application/hooks/auth/useApiKeys";
import { apiKeyApi } from "@/infrastructure/api/auth/apiKeyApi";

const sampleKeys: ApiKeyView[] = [
  {
    id: "k1",
    name: "ci",
    key_prefix: "csk_abc12",
    created_at: "2025-01-01T00:00:00Z",
    last_used_at: "2025-01-04T00:00:00Z",
    revoked_at: null,
  },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useApiKeys", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists existing API keys on mount", async () => {
    vi.mocked(apiKeyApi.list).mockResolvedValue(sampleKeys);

    const { result } = renderHook(() => useApiKeys(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.keys).toEqual(sampleKeys));
    expect(apiKeyApi.list).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("exposes an error state when list rejects", async () => {
    vi.mocked(apiKeyApi.list).mockRejectedValue(new Error("Forbidden"));

    const { result } = renderHook(() => useApiKeys(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Forbidden");
  });

  it("create captures the plaintext returned once and refreshes the list", async () => {
    vi.mocked(apiKeyApi.list).mockResolvedValue(sampleKeys);
    const created: CreatedApiKey = {
      id: "k2",
      name: "ci-2",
      key_prefix: "csk_xyz99",
      plaintext: "csk_live_supersecret",
      created_at: "2025-01-05T00:00:00Z",
    };
    vi.mocked(apiKeyApi.create).mockResolvedValue(created);

    const { result } = renderHook(() => useApiKeys(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.keys).toEqual(sampleKeys));

    let createdKey: CreatedApiKey | null = null;
    await act(async () => {
      createdKey = await result.current.create({ name: "ci-2" });
    });

    expect(apiKeyApi.create).toHaveBeenCalledWith({ name: "ci-2" });
    expect(createdKey).not.toBeNull();
    expect((createdKey as CreatedApiKey).plaintext).toBe("csk_live_supersecret");
  });

  it("revoke calls apiKeyApi.revoke with the id and refreshes the list", async () => {
    vi.mocked(apiKeyApi.list).mockResolvedValue(sampleKeys);
    vi.mocked(apiKeyApi.revoke).mockResolvedValue(undefined);

    const { result } = renderHook(() => useApiKeys(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.keys).toEqual(sampleKeys));

    await act(async () => {
      await result.current.revoke("k1");
    });

    expect(apiKeyApi.revoke).toHaveBeenCalledWith("k1");
  });
});
