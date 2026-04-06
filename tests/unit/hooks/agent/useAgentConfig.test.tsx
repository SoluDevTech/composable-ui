import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useAgentConfig } from "@/application/hooks/agent/useAgentConfig";
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
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const mockAgentConfig: AgentConfig = {
  name: "test-agent",
  model: "openai:gpt-4o",
  system_prompt: "You are a helpful assistant.",
  tools: ["search", "calculator"],
  middleware: [],
  backend: { type: "state" as BackendType },
  hitl: { rules: {} },
  memory: [],
  skills: [],
  subagents: [],
  mcp_servers: [],
  debug: false,
};

describe("useAgentConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns agent config when name is provided", async () => {
    vi.mocked(agentApi.getAgent).mockResolvedValue(mockAgentConfig);

    const { result } = renderHook(() => useAgentConfig("test-agent"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockAgentConfig);
    expect(agentApi.getAgent).toHaveBeenCalledWith("test-agent");
  });

  it("does not fetch when name is null", async () => {
    const { result } = renderHook(() => useAgentConfig(null), {
      wrapper: createWrapper(),
    });

    // The query should not be fetching since enabled is false
    expect(result.current.isFetching).toBe(false);
    expect(agentApi.getAgent).not.toHaveBeenCalled();
  });

  it("returns error state when API call fails", async () => {
    vi.mocked(agentApi.getAgent).mockRejectedValue(new Error("Not found"));

    const { result } = renderHook(() => useAgentConfig("unknown-agent"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Not found");
  });
});
