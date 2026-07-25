import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import AgentConfigViewer from "@/application/components/agent/AgentConfigViewer";
import type { AgentConfig } from "@/domain/entities/agent/agentConfig";
import { BackendType } from "@/domain/entities/agent/agentConfig";

const { mockAgentConfigData, mockDeleteMutate, mockUpdateMutate } = vi.hoisted(() => {
  return {
    mockAgentConfigData: {
      data: undefined as AgentConfig | undefined,
      isLoading: false,
    },
    mockDeleteMutate: vi.fn(),
    mockUpdateMutate: vi.fn(),
  };
});

vi.mock("@/application/hooks/agent/useAgentConfig", () => ({
  useAgentConfig: () => mockAgentConfigData,
}));

vi.mock("@/application/hooks/agent/useDeleteAgent", () => ({
  useDeleteAgent: () => ({
    mutate: mockDeleteMutate,
    isPending: false,
  }),
}));

vi.mock("@/application/hooks/agent/useUpdateAgent", () => ({
  useUpdateAgent: () => ({
    mutate: mockUpdateMutate,
    isPending: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/application/lib/yaml", () => ({
  serializeAgentConfig: vi.fn(() => "name: test"),
  agentConfigToYamlFile: vi.fn(() => new File(["yaml"], "test.yaml")),
}));

vi.mock("@/infrastructure/api/store/storeApi", () => ({
  storeApi: {
    listFiles: vi.fn().mockResolvedValue([]),
    getFile: vi.fn().mockResolvedValue(null),
    putFile: vi.fn().mockResolvedValue(undefined),
    deleteFile: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/application/hooks/store/useStoreFiles", () => ({
  useStoreFiles: (prefix: string) => ({
    data:
      prefix === "/skills/"
        ? [{ path: "/skills/mcp/SKILL.md" }, { path: "/skills/rag/SKILL.md" }]
        : prefix === "/memories/"
          ? [{ path: "/memories/AGENTS.md" }, { path: "/memories/coding.md" }]
          : [],
  }),
}));

// Fixture for the AgentConfig type after the source change.
const fullConfig: AgentConfig = {
  name: "test-agent",
  model: "openai:gpt-4o",
  system_prompt: "You are a helpful assistant that provides accurate information.",
  tools: ["search", "calculator"],
  backend: {
    type: BackendType.STORE,
    checkpoint_backend: "memory",
  },
  hitl: { rules: {} },
  memory: [],
  skills: [],
  subagents: [],
  mcp_servers: [],
  debug: false,
};

const postgresBackendConfig: AgentConfig = {
  ...fullConfig,
  name: "postgres-agent",
  backend: {
    type: BackendType.STORE,
    checkpoint_backend: "postgres",
  },
};

describe("AgentConfigViewer", () => {
  beforeEach(() => {
    mockAgentConfigData.data = undefined;
    mockAgentConfigData.isLoading = false;
    mockDeleteMutate.mockClear();
    mockUpdateMutate.mockClear();
  });

  it("returns null when open is false", () => {
    const { container } = renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={false} onOpenChange={vi.fn()} />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("renders agent name when open", () => {
    mockAgentConfigData.data = fullConfig;

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByText("test-agent")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockAgentConfigData.isLoading = true;

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByText("Loading configuration…")).toBeInTheDocument();
  });

  it("renders model name from config", () => {
    mockAgentConfigData.data = fullConfig;

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByText("openai:gpt-4o")).toBeInTheDocument();
  });

  it("renders tools list", () => {
    mockAgentConfigData.data = fullConfig;

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    // After the change, the Tools section is no longer rendered.
    expect(screen.queryByText("Tools (2)")).not.toBeInTheDocument();
  });

  it("renders backend checkpoint_backend", () => {
    mockAgentConfigData.data = fullConfig;

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByText("memory")).toBeInTheDocument();
  });

  it("shows delete button and requires confirmation", async () => {
    mockAgentConfigData.data = fullConfig;
    const user = userEvent.setup();

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    const deleteButton = screen.getByRole("button", { name: /^delete$/i });
    expect(deleteButton).toBeInTheDocument();

    await user.click(deleteButton);

    expect(screen.getByRole("button", { name: /confirm delete/i })).toBeInTheDocument();
  });

  it("does NOT render a Debug section", () => {
    mockAgentConfigData.data = fullConfig;

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.queryByText(/debug/i)).not.toBeInTheDocument();
  });

  it("does NOT render a middleware section", () => {
    // Arrange — after the change, the viewer must not render any middleware heading/label.
    mockAgentConfigData.data = fullConfig;

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    // Assert — no "Middleware" section label or middleware tags.
    expect(screen.queryByText(/^Middleware \(\d+\)$/)).not.toBeInTheDocument();
    expect(screen.queryByText("Middleware")).not.toBeInTheDocument();
    expect(screen.queryByText("todo_list")).not.toBeInTheDocument();
    expect(screen.queryByText("filesystem")).not.toBeInTheDocument();
  });

  it("does NOT render root_dir", () => {
    // Arrange — a config whose backend has no root_dir.
    mockAgentConfigData.data = fullConfig;

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    // Assert — the root_dir value must not appear, and "Root:" label must be gone.
    expect(screen.queryByText(/\/data\/agents/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Root:/)).not.toBeInTheDocument();
  });

  it("renders checkpoint_backend", () => {
    // Arrange
    mockAgentConfigData.data = postgresBackendConfig;

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    // Assert — checkpoint_backend label must be rendered.
    expect(screen.getByText(/checkpoint_backend/i)).toBeInTheDocument();
    expect(screen.getByText("postgres")).toBeInTheDocument();
  });

  it("renders HITL rules when present", () => {
    mockAgentConfigData.data = {
      ...fullConfig,
      hitl: { rules: { create_file: true, delete_file: false } },
    };

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByText("HITL Rules")).toBeInTheDocument();
    expect(screen.getByText("create_file")).toBeInTheDocument();
    expect(screen.getByText("Enabled")).toBeInTheDocument();
    expect(screen.getByText("delete_file")).toBeInTheDocument();
    expect(screen.getByText("Disabled")).toBeInTheDocument();
  });

  it("renders MCP servers when present", () => {
    mockAgentConfigData.data = {
      ...fullConfig,
      mcp_servers: [
        {
          name: "filesystem-server",
          transport: "stdio" as any,
          args: [],
          headers: {},
          env: {},
        },
      ],
    };

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByText("MCP Servers (1)")).toBeInTheDocument();
    expect(screen.getByText("filesystem-server")).toBeInTheDocument();
    expect(screen.getByText("stdio")).toBeInTheDocument();
  });

  it("renders subagents when present", () => {
    mockAgentConfigData.data = {
      ...fullConfig,
      subagents: [
        {
          name: "research-sub",
          description: "Research subagent",
          tools: [],
          skills: [],
          mcp_servers: [],
        },
      ],
    };

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByText("Subagents (1)")).toBeInTheDocument();
    expect(screen.getByText("research-sub")).toBeInTheDocument();
    expect(screen.getByText("Research subagent")).toBeInTheDocument();
  });

  it("expands and collapses long system prompt", async () => {
    const longPrompt = "A".repeat(300);
    mockAgentConfigData.data = {
      ...fullConfig,
      system_prompt: longPrompt,
    };
    const user = userEvent.setup();

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    const showMoreBtn = screen.getByRole("button", { name: /show more/i });
    expect(showMoreBtn).toBeInTheDocument();
    await user.click(showMoreBtn);

    expect(screen.getByText("Show less")).toBeInTheDocument();
  });

  it("calls deleteAgent.mutate on confirm delete", async () => {
    mockAgentConfigData.data = fullConfig;
    const user = userEvent.setup();

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    await user.click(screen.getByRole("button", { name: /confirm delete/i }));

    expect(mockDeleteMutate).toHaveBeenCalledWith(
      "test-agent",
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it("does NOT render an Active debug badge when debug is true", () => {
    mockAgentConfigData.data = { ...fullConfig, debug: true };

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.queryByText("Active")).not.toBeInTheDocument();
  });

  it("has an Edit button", () => {
    mockAgentConfigData.data = fullConfig;

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("has an Export YAML button", () => {
    mockAgentConfigData.data = fullConfig;

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: /export yaml/i })).toBeInTheDocument();
  });

  it("renders skills list when present", () => {
    // Arrange — a config with two skills paths.
    mockAgentConfigData.data = {
      ...fullConfig,
      skills: ["/skills/mcp/", "/skills/rag/"],
    };

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    // Assert — the Skills section label with count and skill names as pills.
    expect(screen.getByText("Skills (2)")).toBeInTheDocument();
    expect(screen.getByText(/^mcp$/i)).toBeInTheDocument();
    expect(screen.getByText(/^rag$/i)).toBeInTheDocument();
  });

  it("renders memories list when present", () => {
    // Arrange — a config with two memory paths.
    mockAgentConfigData.data = {
      ...fullConfig,
      memory: ["/memories/AGENTS.md", "/memories/coding.md"],
    };

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    // Assert — the Memories section label with count and filenames as pills.
    expect(screen.getByText("Memories (2)")).toBeInTheDocument();
    expect(screen.getByText(/^agents\.md$/i)).toBeInTheDocument();
    expect(screen.getByText(/^coding\.md$/i)).toBeInTheDocument();
  });

  it("does NOT render skills section when empty", () => {
    // Arrange — a config with an empty skills array.
    mockAgentConfigData.data = { ...fullConfig, skills: [] };

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    // Assert — no Skills section label is rendered.
    expect(screen.queryByText(/Skills \(/)).not.toBeInTheDocument();
  });

  it("does NOT render memories section when empty", () => {
    // Arrange — a config with an empty memory array.
    mockAgentConfigData.data = { ...fullConfig, memory: [] };

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    // Assert — no Memories section label is rendered.
    expect(screen.queryByText(/Memories \(/)).not.toBeInTheDocument();
  });

  it("does NOT render a Tools section (even when config.tools has items)", () => {
    // Arrange — fullConfig has tools: ["search", "calculator"].
    mockAgentConfigData.data = fullConfig;

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    // Assert — the Tools section label must no longer be rendered.
    expect(screen.queryByText(/^Tools \(\d+\)$/)).not.toBeInTheDocument();
    expect(screen.queryByText("Tools (2)")).not.toBeInTheDocument();
  });

  it("renders a Description section when config.description is present", () => {
    // Arrange — a config carrying a top-level description.
    mockAgentConfigData.data = {
      ...fullConfig,
      description: "An agent that writes tests.",
    } as AgentConfig;

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    // Assert — a Description section label and the description text must appear.
    expect(screen.getByText(/^description$/i)).toBeInTheDocument();
    expect(screen.getByText("An agent that writes tests.")).toBeInTheDocument();
  });

  it("renders a ref badge on referenced subagents", () => {
    // Arrange — a config with a subagent that references another agent.
    mockAgentConfigData.data = {
      ...fullConfig,
      subagents: [
        {
          name: "researcher",
          description: "Research sub-agent",
          agent_ref: "researcher",
          tools: [],
          skills: [],
          mcp_servers: [],
        } as AgentConfig["subagents"][number],
      ],
    } as AgentConfig;

    renderWithProviders(
      <AgentConfigViewer agentName="test-agent" open={true} onOpenChange={vi.fn()} />,
    );

    // Assert — a ref badge "ref: researcher" must be rendered on the subagent.
    expect(screen.getByText(/ref:\s*researcher/i)).toBeInTheDocument();
  });
});
