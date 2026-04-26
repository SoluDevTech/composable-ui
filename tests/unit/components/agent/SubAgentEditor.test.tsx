import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import SubAgentEditor from "@/application/components/agent/SubAgentEditor";
import type { SubAgentConfig } from "@/domain/entities/agent/agentConfig";

const minimalSubAgent: SubAgentConfig = {
  name: "researcher",
  description: "Research sub-agent",
  tools: ["search"],
  skills: ["web-search"],
  mcp_servers: [],
};

describe("SubAgentEditor", () => {
  it("renders name and description fields", () => {
    renderWithProviders(
      <SubAgentEditor
        value={minimalSubAgent}
        onChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it("calls onRemove when remove button is clicked", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    renderWithProviders(
      <SubAgentEditor
        value={minimalSubAgent}
        onChange={vi.fn()}
        onRemove={onRemove}
      />,
    );

    await user.click(screen.getByRole("button", { name: /remove subagent/i }));
    expect(onRemove).toHaveBeenCalled();
  });

  it("renders tools and skills sections", () => {
    renderWithProviders(
      <SubAgentEditor
        value={minimalSubAgent}
        onChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText("Tools")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();
  });

  it("renders instructions field when present", () => {
    const withInstructions: SubAgentConfig = {
      ...minimalSubAgent,
      instructions: "Do deep research",
    };

    renderWithProviders(
      <SubAgentEditor
        value={withInstructions}
        onChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/instructions/i)).toBeInTheDocument();
  });
});
