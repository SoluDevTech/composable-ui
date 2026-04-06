import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import AgentCard from "@/application/components/agent/AgentCard";
import { createAgentConfigMetadata } from "../../../fixtures/external";

describe("AgentCard", () => {
  it("renders agent name", () => {
    const agent = createAgentConfigMetadata({ name: "research-agent" });

    renderWithProviders(<AgentCard agent={agent} onConfigure={vi.fn()} />);

    expect(screen.getByText("research-agent")).toBeInTheDocument();
  });

  it("renders agent model", () => {
    const agent = createAgentConfigMetadata({ model: "openai:gpt-4o" });

    renderWithProviders(<AgentCard agent={agent} onConfigure={vi.fn()} />);

    expect(screen.getByText("openai:gpt-4o")).toBeInTheDocument();
  });

  it("calls onConfigure when Configure button is clicked", async () => {
    const user = userEvent.setup();
    const agent = createAgentConfigMetadata({ name: "my-agent" });
    const onConfigure = vi.fn();

    renderWithProviders(<AgentCard agent={agent} onConfigure={onConfigure} />);

    await user.click(screen.getByRole("button", { name: /configure/i }));

    expect(onConfigure).toHaveBeenCalledOnce();
    expect(onConfigure).toHaveBeenCalledWith("my-agent");
  });

  it("shows status badge", () => {
    const agent = createAgentConfigMetadata({ is_builtin: true });

    renderWithProviders(<AgentCard agent={agent} onConfigure={vi.fn()} />);

    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});
