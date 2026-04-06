import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import AgentGrid from "@/application/components/agent/AgentGrid";
import { createAgentConfigMetadata } from "../../../fixtures/external";

vi.mock("@/application/hooks/agent/useAgents");

import { useAgents } from "@/application/hooks/agent/useAgents";

const mockedUseAgents = vi.mocked(useAgents);

describe("AgentGrid", () => {
  it("shows loading text when loading", () => {
    mockedUseAgents.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useAgents>);

    renderWithProviders(
      <AgentGrid onCreateNew={vi.fn()} onConfigure={vi.fn()} />,
    );

    expect(screen.getByText("Loading agents...")).toBeInTheDocument();
  });

  it("renders agent cards when data is available", () => {
    const agents = [
      createAgentConfigMetadata({ name: "agent-alpha" }),
      createAgentConfigMetadata({ name: "agent-beta" }),
    ];
    mockedUseAgents.mockReturnValue({
      data: agents,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useAgents>);

    renderWithProviders(
      <AgentGrid onCreateNew={vi.fn()} onConfigure={vi.fn()} />,
    );

    expect(screen.getByText("agent-alpha")).toBeInTheDocument();
    expect(screen.getByText("agent-beta")).toBeInTheDocument();
  });

  it("shows New Agent Template card", () => {
    mockedUseAgents.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useAgents>);

    renderWithProviders(
      <AgentGrid onCreateNew={vi.fn()} onConfigure={vi.fn()} />,
    );

    expect(screen.getByText("New Agent Template")).toBeInTheDocument();
  });

  it("calls onCreateNew when template card is clicked", async () => {
    const user = userEvent.setup();
    mockedUseAgents.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useAgents>);
    const onCreateNew = vi.fn();

    renderWithProviders(
      <AgentGrid onCreateNew={onCreateNew} onConfigure={vi.fn()} />,
    );

    await user.click(screen.getByText("New Agent Template"));

    expect(onCreateNew).toHaveBeenCalledOnce();
  });
});
