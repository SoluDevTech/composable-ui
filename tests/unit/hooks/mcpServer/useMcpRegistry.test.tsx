import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useMcpRegistry } from "@/application/hooks/mcpServer/useMcpRegistry";
import { mcpRegistryApi } from "@/infrastructure/api/mcpServer/mcpRegistryApi";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";
import type { RegisteredMcpServer } from "@/domain/entities/mcpServer/registeredMcpServer";
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

const servers: RegisteredMcpServer[] = [
  {
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
  },
  {
    name: "fs",
    transport: McpTransportType.STDIO,
    url: "",
    headers: {},
    env: {},
    auth_token: null,
    tool_count: 0,
    created_at: "2026-04-06T10:00:00Z",
    updated_at: "2026-04-06T10:00:00Z",
    source_type: "external",
    openapi_url: null,
  },
];

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

describe("useMcpRegistry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the list of registered servers from mcpRegistryApi.list", async () => {
    vi.mocked(mcpRegistryApi.list).mockResolvedValue(servers);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useMcpRegistry(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mcpRegistryApi.list).toHaveBeenCalledOnce();
    expect(result.current.data).toEqual(servers);
  });

  it("uses query key ['mcp-registry']", async () => {
    vi.mocked(mcpRegistryApi.list).mockResolvedValue(servers);
    const { wrapper, queryClient } = createWrapper();

    const { result } = renderHook(() => useMcpRegistry(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cached = queryClient.getQueryData<RegisteredMcpServer[]>(["mcp-registry"]);
    expect(cached).toEqual(servers);
  });

  it("returns empty array when registry is empty", async () => {
    vi.mocked(mcpRegistryApi.list).mockResolvedValue([]);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useMcpRegistry(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
