import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

vi.mock("@/application/hooks/agent/useAgentConfig", () => ({
  useAgentConfig: () => ({
    data: undefined,
    isLoading: false,
  }),
}));

vi.mock("@/application/hooks/agent/useDeleteAgent", () => ({
  useDeleteAgent: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
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

  it("opens CreateAgentDialog when Create Agent button is clicked", async () => {
    const user = userEvent.setup();

    renderWithProviders(<AgentsPage />, { initialEntries: ["/agents"] });

    await user.click(
      screen.getByRole("button", { name: /create agent/i }),
    );

    expect(screen.getByText("Create Agent")).toBeInTheDocument();
    expect(screen.getByLabelText(/agent name/i)).toBeInTheDocument();
  });

  it("opens AgentConfigViewer when Configure button is clicked", async () => {
    const user = userEvent.setup();

    renderWithProviders(<AgentsPage />, { initialEntries: ["/agents"] });

    await user.click(
      screen.getByRole("button", { name: /configure/i }),
    );

    // The AgentConfigViewer should be rendered with Delete button (unique to viewer)
    expect(screen.getByRole("button", { name: /^delete$/i })).toBeInTheDocument();
    // The dialog should be present
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders description text", () => {
    renderWithProviders(<AgentsPage />, { initialEntries: ["/agents"] });

    expect(
      screen.getByText(/configure and manage your ai agent fleet/i),
    ).toBeInTheDocument();
  });
});
