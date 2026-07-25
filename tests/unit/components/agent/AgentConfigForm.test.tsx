import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import AgentConfigForm from "@/application/components/agent/AgentConfigForm";
import type { AgentConfig } from "@/domain/entities/agent/agentConfig";
import { BackendType } from "@/domain/entities/agent/agentConfig";
import type { AgentConfigMetadata } from "@/domain/entities/agent/agentConfigMetadata";

const mockSubmit = vi.fn();
const mockCancel = vi.fn();

const { mockAgentsData } = vi.hoisted(() => ({
  mockAgentsData: {
    data: [] as AgentConfigMetadata[] | undefined,
    isLoading: false,
  },
}));

vi.mock("@/application/hooks/agent/useAgents", () => ({
  useAgents: () => mockAgentsData,
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
});
