import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import SubAgentEditor from "@/application/components/agent/SubAgentEditor";
import type { SubAgentConfig } from "@/domain/entities/agent/agentConfig";

const minimalSubAgent: SubAgentConfig = {
  name: "researcher",
  description: "Research sub-agent",
  agent_ref: "researcher",
  tools: [],
  skills: [],
  mcp_servers: [],
};

describe("SubAgentEditor", () => {
  it("renders name and description fields", () => {
    renderWithProviders(
      <SubAgentEditor value={minimalSubAgent} onChange={vi.fn()} onRemove={vi.fn()} />,
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it("calls onRemove when remove button is clicked", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    renderWithProviders(
      <SubAgentEditor value={minimalSubAgent} onChange={vi.fn()} onRemove={onRemove} />,
    );

    await user.click(screen.getByRole("button", { name: /remove subagent/i }));
    expect(onRemove).toHaveBeenCalled();
  });

  it("does NOT render tools, skills, or instructions sections", () => {
    renderWithProviders(
      <SubAgentEditor value={minimalSubAgent} onChange={vi.fn()} onRemove={vi.fn()} />,
    );

    expect(screen.queryByText(/^tools$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^skills$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^instructions$/i)).not.toBeInTheDocument();
  });

  describe("reference mode (always on)", () => {
    it("renders a reference badge when agent_ref is set", () => {
      renderWithProviders(
        <SubAgentEditor value={minimalSubAgent} onChange={vi.fn()} onRemove={vi.fn()} index={0} />,
      );

      expect(screen.getByText(/ref:\s*researcher/i)).toBeInTheDocument();
    });

    it("name is read-only", () => {
      renderWithProviders(
        <SubAgentEditor value={minimalSubAgent} onChange={vi.fn()} onRemove={vi.fn()} index={0} />,
      );

      const nameInput = screen.getByLabelText(/^name$/i) as HTMLInputElement;
      expect(nameInput).toBeDisabled();
    });

    it("hides instructions/model/skills editors", () => {
      const refSub: SubAgentConfig = {
        ...minimalSubAgent,
        instructions: "should be hidden",
        model: "openai:gpt-4o",
      } as SubAgentConfig;

      renderWithProviders(
        <SubAgentEditor value={refSub} onChange={vi.fn()} onRemove={vi.fn()} index={0} />,
      );

      expect(screen.queryByLabelText(/^instructions$/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/^model$/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/^skills$/i)).not.toBeInTheDocument();
    });

    it("does NOT render a Tools editor", () => {
      renderWithProviders(
        <SubAgentEditor value={minimalSubAgent} onChange={vi.fn()} onRemove={vi.fn()} index={0} />,
      );

      expect(screen.queryByText(/^tools$/i)).not.toBeInTheDocument();
    });
  });
});
