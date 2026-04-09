import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useCreateAgent } from "@/application/hooks/agent/useCreateAgent";
import { agentApi } from "@/infrastructure/api/agent/agentApi";
import type {
  AgentConfig,
  BackendType,
} from "@/domain/entities/agent/agentConfig";
import type { ReactNode } from "react";

vi.mock("@/infrastructure/api/agent/agentApi", () => ({
  agentApi: {
    getAgent: vi.fn(),
    listAgents: vi.fn(),
    createAgent: vi.fn(),
    updateAgent: vi.fn(),
    deleteAgent: vi.fn(),
  },
}));

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

const mockCreatedConfig: AgentConfig = {
  name: "new-agent",
  model: "openai:gpt-4o",
  tools: [],
  middleware: [],
  backend: { type: "state" as BackendType },
  hitl: { rules: {} },
  memory: [],
  skills: [],
  subagents: [],
  mcp_servers: [],
  debug: false,
};

describe("useCreateAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls agentApi.createAgent on mutate", async () => {
    vi.mocked(agentApi.createAgent).mockResolvedValue(mockCreatedConfig);
    const { wrapper } = createWrapper();
    const file = new File(["model: gpt-4o"], "config.yaml", {
      type: "application/x-yaml",
    });

    const { result } = renderHook(() => useCreateAgent(), { wrapper });

    act(() => {
      result.current.mutate({ name: "new-agent", yamlFile: file });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(agentApi.createAgent).toHaveBeenCalledWith("new-agent", file);
  });

  it("invalidates agents query on success", async () => {
    vi.mocked(agentApi.createAgent).mockResolvedValue(mockCreatedConfig);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const file = new File(["model: gpt-4o"], "config.yaml", {
      type: "application/x-yaml",
    });

    const { result } = renderHook(() => useCreateAgent(), { wrapper });

    act(() => {
      result.current.mutate({ name: "new-agent", yamlFile: file });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["agents"] });
  });
});
