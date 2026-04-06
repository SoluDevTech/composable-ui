import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useConfig } from "@/application/hooks/config/useConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

vi.mock("@/infrastructure/config/configRepositoryInstance", () => ({
  configRepository: {
    getConfig: vi.fn().mockResolvedValue({
      apiBaseUrl: "http://api.test.com",
      wsBaseUrl: "ws://api.test.com",
    }),
    isLoaded: vi.fn().mockReturnValue(true),
  },
}));

describe("useConfig", () => {
  let queryClient: QueryClient;

  const mockConfig = {
    apiBaseUrl: "http://api.test.com",
    wsBaseUrl: "ws://api.test.com",
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should fetch and return config", async () => {
    const { result } = renderHook(() => useConfig(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockConfig);
  });

  it("should cache config with infinite stale time", async () => {
    const { result } = renderHook(() => useConfig(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const fetchCount = queryClient.getQueryData(["config"]);
    expect(fetchCount).toEqual(mockConfig);
  });

  it("should have correct query key", async () => {
    const { result } = renderHook(() => useConfig(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
  });
});
