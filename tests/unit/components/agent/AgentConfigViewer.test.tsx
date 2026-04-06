import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import AgentConfigViewer from "@/application/components/agent/AgentConfigViewer";
import type { AgentConfig } from "@/domain/entities/agent/agentConfig";
import { BackendType, MiddlewareType } from "@/domain/entities/agent/agentConfig";

const { mockAgentConfigData, mockDeleteMutate } = vi.hoisted(() => {
  return {
    mockAgentConfigData: {
      data: undefined as AgentConfig | undefined,
      isLoading: false,
    },
    mockDeleteMutate: vi.fn(),
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

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const fullConfig: AgentConfig = {
  name: "test-agent",
  model: "openai:gpt-4o",
  system_prompt: "You are a helpful assistant that provides accurate information.",
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

describe("AgentConfigViewer", () => {
  beforeEach(() => {
    mockAgentConfigData.data = undefined;
    mockAgentConfigData.isLoading = false;
    mockDeleteMutate.mockClear();
  });

  it("returns null when open is false", () => {
    const { container } = renderWithProviders(
      <AgentConfigViewer
        agentName="test-agent"
        open={false}
        onOpenChange={vi.fn()}
      />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("renders agent name when open", () => {
    mockAgentConfigData.data = fullConfig;

    renderWithProviders(
      <AgentConfigViewer
        agentName="test-agent"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText("test-agent")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockAgentConfigData.isLoading = true;

    renderWithProviders(
      <AgentConfigViewer
        agentName="test-agent"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Loading configuration...")).toBeInTheDocument();
  });

  it("renders model name from config", () => {
    mockAgentConfigData.data = fullConfig;

    renderWithProviders(
      <AgentConfigViewer
        agentName="test-agent"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText("openai:gpt-4o")).toBeInTheDocument();
  });

  it("renders tools list", () => {
    mockAgentConfigData.data = fullConfig;

    renderWithProviders(
      <AgentConfigViewer
        agentName="test-agent"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText("search")).toBeInTheDocument();
    expect(screen.getByText("calculator")).toBeInTheDocument();
    expect(screen.getByText("Tools (2)")).toBeInTheDocument();
  });

  it("renders backend type", () => {
    mockAgentConfigData.data = fullConfig;

    renderWithProviders(
      <AgentConfigViewer
        agentName="test-agent"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/state/)).toBeInTheDocument();
  });

  it("calls onOpenChange when close button is clicked", async () => {
    mockAgentConfigData.data = fullConfig;
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderWithProviders(
      <AgentConfigViewer
        agentName="test-agent"
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    // The close button contains the "close" text in a span
    const closeButtons = screen.getAllByRole("button");
    // First button in header is the close (X) button
    const closeButton = closeButtons.find((btn) =>
      btn.textContent?.includes("close"),
    );
    expect(closeButton).toBeDefined();
    await user.click(closeButton!);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows delete button and requires confirmation", async () => {
    mockAgentConfigData.data = fullConfig;
    const user = userEvent.setup();

    renderWithProviders(
      <AgentConfigViewer
        agentName="test-agent"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    const deleteButton = screen.getByRole("button", { name: /^delete$/i });
    expect(deleteButton).toBeInTheDocument();

    await user.click(deleteButton);

    // After first click, button should show confirm text
    expect(
      screen.getByRole("button", { name: /confirm delete/i }),
    ).toBeInTheDocument();
  });

  it("renders debug status badge", () => {
    mockAgentConfigData.data = fullConfig;

    renderWithProviders(
      <AgentConfigViewer
        agentName="test-agent"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Off")).toBeInTheDocument();
  });

  it("renders middleware list when present", () => {
    mockAgentConfigData.data = {
      ...fullConfig,
      middleware: [MiddlewareType.TODO_LIST, MiddlewareType.FILESYSTEM],
    };

    renderWithProviders(
      <AgentConfigViewer
        agentName="test-agent"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Middleware (2)")).toBeInTheDocument();
    expect(screen.getByText("todo_list")).toBeInTheDocument();
    expect(screen.getByText("filesystem")).toBeInTheDocument();
  });

  it("renders HITL rules when present", () => {
    mockAgentConfigData.data = {
      ...fullConfig,
      hitl: { rules: { create_file: true, delete_file: false } },
    };

    renderWithProviders(
      <AgentConfigViewer
        agentName="test-agent"
        open={true}
        onOpenChange={vi.fn()}
      />,
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
        { name: "filesystem-server", transport: "stdio" as any, args: [], headers: {}, env: {} },
      ],
    };

    renderWithProviders(
      <AgentConfigViewer
        agentName="test-agent"
        open={true}
        onOpenChange={vi.fn()}
      />,
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
      <AgentConfigViewer
        agentName="test-agent"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Subagents (1)")).toBeInTheDocument();
    expect(screen.getByText("research-sub")).toBeInTheDocument();
    expect(screen.getByText("Research subagent")).toBeInTheDocument();
  });

  it("renders backend root_dir when present", () => {
    mockAgentConfigData.data = {
      ...fullConfig,
      backend: { type: BackendType.FILESYSTEM, root_dir: "/data/agents" },
    };

    renderWithProviders(
      <AgentConfigViewer
        agentName="test-agent"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/\/data\/agents/)).toBeInTheDocument();
  });

  it("expands and collapses long system prompt", async () => {
    const longPrompt = "A".repeat(300);
    mockAgentConfigData.data = {
      ...fullConfig,
      system_prompt: longPrompt,
    };
    const user = userEvent.setup();

    renderWithProviders(
      <AgentConfigViewer
        agentName="test-agent"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    // Initially shows truncated (200 chars) with "Show more"
    expect(screen.getByText(/\.\.\.Show more/)).toBeInTheDocument();

    await user.click(screen.getByText(/\.\.\.Show more/));

    // After click, shows "Show less"
    expect(screen.getByText("Show less")).toBeInTheDocument();
  });

  it("calls deleteAgent.mutate on confirm delete", async () => {
    mockAgentConfigData.data = fullConfig;
    const user = userEvent.setup();

    renderWithProviders(
      <AgentConfigViewer
        agentName="test-agent"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    // First click sets confirmDelete
    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    // Second click triggers actual delete
    await user.click(screen.getByRole("button", { name: /confirm delete/i }));

    expect(mockDeleteMutate).toHaveBeenCalledWith(
      "test-agent",
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
  });

  it("closes dialog via Close button in header", async () => {
    mockAgentConfigData.data = fullConfig;
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderWithProviders(
      <AgentConfigViewer
        agentName="test-agent"
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    // Header close (X) button contains "close" icon text
    const allButtons = screen.getAllByRole("button");
    const headerClose = allButtons.find(
      (btn) => btn.textContent?.trim() === "close",
    );
    expect(headerClose).toBeDefined();
    await user.click(headerClose!);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes via Close button in footer", async () => {
    mockAgentConfigData.data = fullConfig;
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderWithProviders(
      <AgentConfigViewer
        agentName="test-agent"
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    // The footer "Close" button
    const closeButtons = screen.getAllByRole("button");
    const footerClose = closeButtons.find(
      (btn) => btn.textContent === "Close",
    );
    expect(footerClose).toBeDefined();
    await user.click(footerClose!);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows Active badge when debug is true", () => {
    mockAgentConfigData.data = { ...fullConfig, debug: true };

    renderWithProviders(
      <AgentConfigViewer
        agentName="test-agent"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});
