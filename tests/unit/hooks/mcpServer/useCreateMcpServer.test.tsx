import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useCreateMcpServer } from "@/application/hooks/mcpServer/useCreateMcpServer";
import { mcpRegistryApi } from "@/infrastructure/api/mcpServer/mcpRegistryApi";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";
import type { ReactNode } from "react";

vi.mock("@/infrastructure/api/mcpServer/mcpRegistryApi", () => ({
  mcpRegistryApi: {
    list: vi.fn(),
    get: vi.fn(),
    reveal: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    validate: vi.fn(),
  },
}));

const createInput = {
  name: "weather",
  url: "https://example.com/mcp",
  headers: { Authorization: "Bearer tok" },
  env: { LOG_LEVEL: "debug" },
  auth_token: "tok",
  source_type: "external" as const,
  openapi_url: null,
};

const maskedEntry = {
  name: "weather",
  transport: McpTransportType.HTTP,
  url: "https://example.com/mcp",
  headers: {},
  env: {},
  auth_token: null,
  tool_count: 5,
  created_at: "2026-04-06T10:00:00Z",
  updated_at: "2026-04-06T10:00:00Z",
  source_type: "external",
  openapi_url: null,
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
    queryClient,
  };
}

describe("useCreateMcpServer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls mcpRegistryApi.create with the input and resolves to the masked entry", async () => {
    vi.mocked(mcpRegistryApi.create).mockResolvedValue(maskedEntry);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCreateMcpServer(), { wrapper });

    act(() => {
      result.current.mutate(createInput);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mcpRegistryApi.create).toHaveBeenCalledWith(createInput);
    expect(result.current.data).toEqual(maskedEntry);
  });

  it("propagates the error when create fails (e.g. 409 conflict)", async () => {
    vi.mocked(mcpRegistryApi.create).mockRejectedValue(new Error("Server already exists"));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCreateMcpServer(), { wrapper });

    act(() => {
      result.current.mutate(createInput);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Server already exists");
  });

  it("invalidates ['mcp-registry'] on success", async () => {
    vi.mocked(mcpRegistryApi.create).mockResolvedValue(maskedEntry);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateMcpServer(), { wrapper });

    act(() => {
      result.current.mutate(createInput);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["mcp-registry"] });
  });

  it("does NOT invalidate ['mcp-registry'] on failure", async () => {
    vi.mocked(mcpRegistryApi.create).mockRejectedValue(new Error("Server already exists"));
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateMcpServer(), { wrapper });

    act(() => {
      result.current.mutate(createInput);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ["mcp-registry"] });
  });
});
