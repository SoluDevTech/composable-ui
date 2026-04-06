import { screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../utils/render";
import AgentsPage from "@/application/pages/AgentsPage";
import { createAgentConfigMetadata } from "../../fixtures/external";

vi.mock("@/application/hooks/agent/useAgents", () => ({
  useAgents: () => ({
    data: [createAgentConfigMetadata({ name: "my-agent", is_builtin: true })],
    isLoading: false,
    error: null,
  }),
}));

vi.mock("@/application/hooks/agent/useCreateAgent", () => ({
  useCreateAgent: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

describe("AgentsPage", () => {
  it("renders Active Agents heading", () => {
    renderWithProviders(<AgentsPage />, { initialEntries: ["/agents"] });

    expect(
      screen.getByRole("heading", { name: /active agents/i }),
    ).toBeInTheDocument();
  });

  it("renders Create Agent button", () => {
    renderWithProviders(<AgentsPage />, { initialEntries: ["/agents"] });

    expect(
      screen.getByRole("button", { name: /create agent/i }),
    ).toBeInTheDocument();
  });

  it("shows agent grid with agents", () => {
    renderWithProviders(<AgentsPage />, { initialEntries: ["/agents"] });

    expect(screen.getByText("my-agent")).toBeInTheDocument();
  });
});
