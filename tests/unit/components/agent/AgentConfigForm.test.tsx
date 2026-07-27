import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import AgentConfigForm from "@/application/components/agent/AgentConfigForm";
import type { AgentConfig } from "@/domain/entities/agent/agentConfig";
import { BackendType } from "@/domain/entities/agent/agentConfig";
import type { AgentConfigMetadata } from "@/domain/entities/agent/agentConfigMetadata";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";
import type { RegisteredMcpServer } from "@/domain/entities/mcpServer/registeredMcpServer";

const mockSubmit = vi.fn();
const mockCancel = vi.fn();

const { mockAgentsData, registryState, revealMock } = vi.hoisted(() => ({
  mockAgentsData: {
    data: [] as AgentConfigMetadata[] | undefined,
    isLoading: false,
  },
  registryState: {
    data: undefined as RegisteredMcpServer[] | undefined,
    isLoading: false,
  },
  revealMock: vi.fn(),
}));

vi.mock("@/application/hooks/agent/useAgents", () => ({
  useAgents: () => mockAgentsData,
}));

vi.mock("@/application/hooks/mcpServer/useMcpRegistry", () => ({
  useMcpRegistry: () => registryState,
}));

vi.mock("@/infrastructure/api/mcpServer/mcpRegistryApi", () => ({
  mcpRegistryApi: {
    reveal: (name: string) => revealMock(name),
  },
}));

describe("AgentConfigForm", () => {
  describe("create mode", () => {
    it("renders form with sections", () => {
      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      expect(screen.getByText("General")).toBeInTheDocument();
      expect(screen.getByText("Backend")).toBeInTheDocument();
    });

    it("does NOT render a 'Tools & Middleware' section label", () => {
      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      // After the change, the label must be "Tools" only, not "Tools & Middleware".
      expect(screen.queryByText("Tools & Middleware")).not.toBeInTheDocument();
    });

    it("does NOT render a middleware section", () => {
      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      // After the change, the Middleware label and toggle buttons must be gone.
      expect(screen.queryByText("Middleware")).not.toBeInTheDocument();
      // The middleware toggle buttons (todo_list, filesystem, sub_agent) must
      // not appear as toggle buttons.
      expect(screen.queryByRole("button", { name: /^todo_list$/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /^filesystem$/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /^sub_agent$/i })).not.toBeInTheDocument();
    });

    it("does NOT render filesystem in the backend type dropdown", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      // Expand the Backend accordion so the Type Select trigger is rendered.
      await user.click(screen.getByRole("button", { name: "Backend" }));

      // Act — open the backend type select dropdown.
      await user.click(screen.getByRole("combobox"));

      // Assert — filesystem must not be a selectable option.
      await waitFor(() => {
        expect(screen.queryByRole("option", { name: "filesystem" })).not.toBeInTheDocument();
      });
    });

    it("does NOT render composite in the backend type dropdown", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      await user.click(screen.getByRole("button", { name: "Backend" }));
      await user.click(screen.getByRole("combobox"));

      await waitFor(() => {
        expect(screen.queryByRole("option", { name: "composite" })).not.toBeInTheDocument();
      });
    });

    it("does NOT render a root_dir input field", () => {
      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      // After the change, root_dir input must not be rendered for any backend.
      expect(screen.queryByLabelText(/root directory/i)).not.toBeInTheDocument();
      expect(screen.queryByText("Root Directory")).not.toBeInTheDocument();
    });

    it("renders checkpoint_backend select when backend type is store", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      // Expand the Backend accordion.
      await user.click(screen.getByRole("button", { name: "Backend" }));

      // Assert — backend type is shown as static text "store".
      expect(screen.getByText("store")).toBeInTheDocument();

      // Assert — checkpoint_backend select must appear.
      await waitFor(() => {
        expect(screen.getByText(/checkpoint backend/i)).toBeInTheDocument();
      });
    });

    it("renders name field enabled in create mode", () => {
      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      const nameInput = screen.getByLabelText(/agent name/i);
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).not.toBeDisabled();
    });

    it("renders model field", () => {
      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
    });

    it("does NOT render a Debug switch", () => {
      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      expect(screen.queryByLabelText(/debug/i)).not.toBeInTheDocument();
    });

    it("renders cancel button", () => {
      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("calls onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      await user.click(screen.getByRole("button", { name: /cancel/i }));
      expect(mockCancel).toHaveBeenCalled();
    });

    it("shows create button in create mode", () => {
      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
    });
  });

  describe("edit mode", () => {
    const existingConfig: AgentConfig = {
      name: "existing-agent",
      model: "openai:gpt-4o",
      system_prompt: "You are helpful",
      tools: ["search"],
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

    it("renders name field disabled in edit mode", () => {
      renderWithProviders(
        <AgentConfigForm
          mode="edit"
          initialData={existingConfig}
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />,
      );

      const nameInput = screen.getByLabelText(/agent name/i) as HTMLInputElement;
      expect(nameInput).toBeDisabled();
    });

    it("pre-fills form with existing data", () => {
      renderWithProviders(
        <AgentConfigForm
          mode="edit"
          initialData={existingConfig}
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />,
      );

      const nameInput = screen.getByLabelText(/agent name/i) as HTMLInputElement;
      expect(nameInput.value).toBe("existing-agent");

      const modelInput = screen.getByLabelText(/model/i) as HTMLInputElement;
      expect(modelInput.value).toBe("openai:gpt-4o");
    });

    it("renders update button instead of create in edit mode", () => {
      renderWithProviders(
        <AgentConfigForm
          mode="edit"
          initialData={existingConfig}
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />,
      );

      expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /create/i })).not.toBeInTheDocument();
    });
  });

  describe("description & subagent reference feature", () => {
    beforeEach(() => {
      mockAgentsData.data = [];
      mockAgentsData.isLoading = false;
    });

    it("renders a Description input in the General section", () => {
      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      // The General section is open by default; a Description field must be present.
      expect(screen.getByLabelText(/^description$/i)).toBeInTheDocument();
    });

    it("does NOT render a Tools accordion section", () => {
      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      // After the change, there must be no accordion trigger labelled "Tools".
      expect(screen.queryByRole("button", { name: /^tools$/i })).not.toBeInTheDocument();
    });

    it("shows an 'Add from existing agents' control in the Subagents section when useAgents returns agents", async () => {
      // Arrange — useAgents returns two existing agents.
      mockAgentsData.data = [
        { name: "researcher", description: "Research agent" } as AgentConfigMetadata,
        { name: "writer", description: "Writer agent" } as AgentConfigMetadata,
      ];
      const user = userEvent.setup();

      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      // Act — expand the Subagents accordion.
      await user.click(screen.getByRole("button", { name: "Subagents" }));

      // Assert — the "Add from existing agents" control must be rendered.
      await waitFor(() => {
        expect(screen.getByText(/add from existing agents/i)).toBeInTheDocument();
      });
    });

    it("clicking an existing agent in the picker adds a subagent with agent_ref", async () => {
      // Arrange — useAgents returns a "researcher" agent.
      mockAgentsData.data = [
        { name: "researcher", description: "Research agent" } as AgentConfigMetadata,
      ];
      const user = userEvent.setup();

      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      // Act — expand Subagents, open the picker, and select the researcher.
      await user.click(screen.getByRole("button", { name: "Subagents" }));

      await waitFor(() => {
        expect(screen.getByText(/add from existing agents/i)).toBeInTheDocument();
      });

      // The picker is the combobox inside the Subagents section.
      await user.click(screen.getByRole("combobox"));
      await user.click(await screen.findByRole("option", { name: /researcher/i }));

      // Assert — a SubAgentEditor in reference mode must appear, showing a
      // "ref: researcher" badge.
      await waitFor(() => {
        expect(screen.getByText(/ref:\s*researcher/i)).toBeInTheDocument();
      });
    });
  });

  describe("MCP servers pills", () => {
    const registryServers: RegisteredMcpServer[] = [
      {
        name: "weather",
        transport: McpTransportType.HTTP,
        url: "https://example.com/mcp",
        headers: { Authorization: "Bearer secret" },
        env: {},
        auth_token: "tok",
        tool_count: 5,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        source_type: "external",
        openapi_url: null,
      },
      {
        name: "github",
        transport: McpTransportType.HTTP,
        url: "https://api.github.com/mcp",
        headers: {},
        env: {},
        auth_token: null,
        tool_count: 12,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        source_type: "external",
        openapi_url: null,
      },
    ];

    beforeEach(() => {
      mockAgentsData.data = [];
      mockAgentsData.isLoading = false;
      registryState.data = registryServers;
      registryState.isLoading = false;
      revealMock.mockReset();
    });

    async function expandMcpServers(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole("button", { name: "MCP Servers" }));
    }

    it("renders registry servers as toggle pills", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      await expandMcpServers(user);

      await waitFor(() => {
        expect(screen.getByText("weather")).toBeInTheDocument();
        expect(screen.getByText("github")).toBeInTheDocument();
      });
    });

    it("does NOT render the old 'Add from registry' dropdown, editor cards or 'Add MCP Server' button", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      await expandMcpServers(user);

      // Dropdown + custom-server button are gone.
      expect(screen.queryByText(/add from registry/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/add mcp server/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/select a registered server/i)).not.toBeInTheDocument();
      // No combobox in the MCP section (the backend/subagent comboboxes live
      // in other sections that are closed, so none should be present at all).
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });

    it("clicking a registry pill reveals and embeds the server (pill becomes active)", async () => {
      revealMock.mockResolvedValue(registryServers[0]);
      const user = userEvent.setup();
      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      await expandMcpServers(user);

      const pill = await screen.findByRole("button", { name: "weather" });
      expect(pill).toHaveAttribute("aria-pressed", "false");

      await user.click(pill);

      await waitFor(() => {
        expect(pill).toHaveAttribute("aria-pressed", "true");
      });
      expect(revealMock).toHaveBeenCalledWith("weather");
    });

    it("clicking an active pill removes the embedded entry", async () => {
      revealMock.mockResolvedValue(registryServers[0]);
      const user = userEvent.setup();
      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      await expandMcpServers(user);

      const pill = await screen.findByRole("button", { name: "weather" });
      await user.click(pill);
      await waitFor(() => {
        expect(pill).toHaveAttribute("aria-pressed", "true");
      });

      await user.click(pill);

      await waitFor(() => {
        expect(pill).toHaveAttribute("aria-pressed", "false");
      });
    });

    it("shows the empty message when the registry is empty", async () => {
      registryState.data = [];
      const user = userEvent.setup();
      renderWithProviders(
        <AgentConfigForm mode="create" onSubmit={mockSubmit} onCancel={mockCancel} />,
      );

      await expandMcpServers(user);

      await waitFor(() => {
        expect(screen.getByText(/add servers in the mcp registry page first/i)).toBeInTheDocument();
      });
    });

    it("edit mode: an existing registry server shows as an active pill with no editor card", async () => {
      const config: AgentConfig = {
        name: "existing-agent",
        model: "openai:gpt-4o",
        system_prompt: "You are helpful",
        tools: ["search"],
        backend: { type: BackendType.STORE, checkpoint_backend: "memory" },
        hitl: { rules: {} },
        memory: [],
        skills: [],
        subagents: [],
        mcp_servers: [
          {
            name: "weather",
            transport: McpTransportType.HTTP,
            command: undefined,
            args: [],
            url: "https://example.com/mcp",
            headers: {},
            env: {},
            auth_token: undefined,
          },
        ],
        debug: false,
      };
      const user = userEvent.setup();

      renderWithProviders(
        <AgentConfigForm
          mode="edit"
          initialData={config}
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />,
      );

      await expandMcpServers(user);

      const pill = await screen.findByRole("button", { name: "weather" });
      expect(pill).toHaveAttribute("aria-pressed", "true");
      // No editor card rendered.
      expect(screen.queryByText(/add mcp server/i)).not.toBeInTheDocument();
    });

    it("edit mode: a legacy custom (non-registry) server shows as a removable pill", async () => {
      const config: AgentConfig = {
        name: "existing-agent",
        model: "openai:gpt-4o",
        system_prompt: "You are helpful",
        tools: ["search"],
        backend: { type: BackendType.STORE, checkpoint_backend: "memory" },
        hitl: { rules: {} },
        memory: [],
        skills: [],
        subagents: [],
        mcp_servers: [
          {
            name: "legacy-local",
            transport: McpTransportType.STDIO,
            command: "npx",
            args: [],
            headers: {},
            env: {},
            auth_token: undefined,
          },
        ],
        debug: false,
      };
      const user = userEvent.setup();

      renderWithProviders(
        <AgentConfigForm
          mode="edit"
          initialData={config}
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />,
      );

      await expandMcpServers(user);

      const pill = await screen.findByRole("button", { name: /legacy-local/i });
      expect(pill).toHaveAttribute("aria-pressed", "true");

      // Removing a legacy entry should not call reveal (it's not in registry).
      await user.click(pill);
      // Legacy entries are not in the registry, so once removed the pill is
      // gone entirely (it cannot be re-added).
      await waitFor(() => {
        expect(screen.queryByRole("button", { name: /legacy-local/i })).not.toBeInTheDocument();
      });
      expect(revealMock).not.toHaveBeenCalled();
    });
  });
});
