import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import AgentConfigForm from "@/application/components/agent/AgentConfigForm";
import type { AgentConfig } from "@/domain/entities/agent/agentConfig";
import { BackendType } from "@/domain/entities/agent/agentConfig";

const mockSubmit = vi.fn();
const mockCancel = vi.fn();

describe("AgentConfigForm", () => {
  describe("create mode", () => {
    it("renders form with sections", () => {
      renderWithProviders(
        <AgentConfigForm
          mode="create"
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />,
      );

      expect(screen.getByText("General")).toBeInTheDocument();
      expect(screen.getByText("Tools & Middleware")).toBeInTheDocument();
      expect(screen.getByText("Backend")).toBeInTheDocument();
    });

    it("renders name field enabled in create mode", () => {
      renderWithProviders(
        <AgentConfigForm
          mode="create"
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />,
      );

      const nameInput = screen.getByLabelText(/agent name/i);
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).not.toBeDisabled();
    });

    it("renders model and debug fields", () => {
      renderWithProviders(
        <AgentConfigForm
          mode="create"
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />,
      );

      expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
    });

    it("renders cancel button", () => {
      renderWithProviders(
        <AgentConfigForm
          mode="create"
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />,
      );

      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
    });

    it("calls onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <AgentConfigForm
          mode="create"
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />,
      );

      await user.click(screen.getByRole("button", { name: /cancel/i }));
      expect(mockCancel).toHaveBeenCalled();
    });

    it("shows create button in create mode", () => {
      renderWithProviders(
        <AgentConfigForm
          mode="create"
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />,
      );

      expect(
        screen.getByRole("button", { name: /create/i }),
      ).toBeInTheDocument();
    });
  });

  describe("edit mode", () => {
    const existingConfig: AgentConfig = {
      name: "existing-agent",
      model: "openai:gpt-4o",
      system_prompt: "You are helpful",
      tools: ["search"],
      middleware: [],
      backend: { type: BackendType.STATE },
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

      const nameInput = screen.getByLabelText(
        /agent name/i,
      ) as HTMLInputElement;
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

      const nameInput = screen.getByLabelText(
        /agent name/i,
      ) as HTMLInputElement;
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

      expect(
        screen.getByRole("button", { name: /update/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /create/i }),
      ).not.toBeInTheDocument();
    });
  });
});
