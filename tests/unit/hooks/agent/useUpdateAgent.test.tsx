import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useUpdateAgent } from "@/application/hooks/agent/useUpdateAgent";
import { agentApi } from "@/infrastructure/api/agent/agentApi";
import type { AgentConfig, BackendType } from "@/domain/entities/agent/agentConfig";
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

const mockUpdatedConfig: AgentConfig = {
  name: "my-agent",
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

describe("useUpdateAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls agentApi.updateAgent on mutate", async () => {
    vi.mocked(agentApi.updateAgent).mockResolvedValue(mockUpdatedConfig);
    const { wrapper } = createWrapper();
    const file = new File(["model: gpt-4o"], "config.yaml", {
      type: "application/x-yaml",
    });

    const { result } = renderHook(() => useUpdateAgent(), { wrapper });

    act(() => {
      result.current.mutate({ name: "my-agent", yamlFile: file });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(agentApi.updateAgent).toHaveBeenCalledWith("my-agent", file);
  });

  it("invalidates both agents list and specific agent query on success", async () => {
    vi.mocked(agentApi.updateAgent).mockResolvedValue(mockUpdatedConfig);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const file = new File(["model: gpt-4o"], "config.yaml", {
      type: "application/x-yaml",
    });

    const { result } = renderHook(() => useUpdateAgent(), { wrapper });

    act(() => {
      result.current.mutate({ name: "my-agent", yamlFile: file });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["agents"] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["agent", "my-agent"],
    });
  });

  it("returns error state when update fails", async () => {
    vi.mocked(agentApi.updateAgent).mockRejectedValue(
      new Error("Invalid YAML"),
    );
    const { wrapper } = createWrapper();
    const file = new File(["invalid"], "bad.yaml", {
      type: "application/x-yaml",
    });

    const { result } = renderHook(() => useUpdateAgent(), { wrapper });

    act(() => {
      result.current.mutate({ name: "my-agent", yamlFile: file });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Invalid YAML");
  });
});
