import { screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import Sidebar from "@/application/components/layout/Sidebar";

vi.mock("@/application/hooks/auth/useCurrentUser", () => ({
  useCurrentUser: vi.fn(),
}));

import { useCurrentUser } from "@/application/hooks/auth/useCurrentUser";

describe("Sidebar", () => {
  beforeEach(() => {
    vi.mocked(useCurrentUser).mockReturnValue({
      profile: {
        userId: "user-123",
        email: "jane@example.com",
        name: "Jane Doe",
        username: "jane",
      },
      isLoading: false,
      isError: false,
      error: null,
    });
  });
  it("renders the brand wordmark 'Composable' with 'UI' accent", () => {
    renderWithProviders(<Sidebar />, { initialEntries: ["/chat"] });

    expect(screen.getByText(/Composable/)).toBeInTheDocument();
    expect(screen.getByText("UI")).toBeInTheDocument();
  });

  it("renders the Orchestration nav link pointing to /chat", () => {
    renderWithProviders(<Sidebar />, { initialEntries: ["/chat"] });

    const link = screen.getByRole("link", { name: /orchestration/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/chat");
    expect(link).toHaveAttribute("data-od-id", "nav-orchestration");
  });

  it("renders the Agents nav link pointing to /agents", () => {
    renderWithProviders(<Sidebar />, { initialEntries: ["/chat"] });

    const link = screen.getByRole("link", { name: /agents/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/agents");
    expect(link).toHaveAttribute("data-od-id", "nav-agents");
  });

  it("renders the RAG Storage nav link pointing to /rag", () => {
    renderWithProviders(<Sidebar />, { initialEntries: ["/chat"] });

    const link = screen.getByRole("link", { name: /rag storage/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/rag");
    expect(link).toHaveAttribute("data-od-id", "nav-rag");
  });

  it("renders the Surfaces section label", () => {
    renderWithProviders(<Sidebar />, { initialEntries: ["/chat"] });

    expect(screen.getByText("Surfaces")).toBeInTheDocument();
  });

  it("renders the System section label", () => {
    renderWithProviders(<Sidebar />, { initialEntries: ["/chat"] });

    expect(screen.getByText("System")).toBeInTheDocument();
  });

  it("renders the Settings nav link pointing to /settings", () => {
    renderWithProviders(<Sidebar />, { initialEntries: ["/chat"] });

    const link = screen.getByRole("link", { name: /settings/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/settings");
    expect(link).toHaveAttribute("data-od-id", "nav-settings");
  });

  it("renders the footer operator name and role", () => {
    renderWithProviders(<Sidebar />, { initialEntries: ["/chat"] });

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Operator")).toBeInTheDocument();
  });

  it("renders the user avatar initials derived from the profile name", () => {
    renderWithProviders(<Sidebar />, { initialEntries: ["/chat"] });

    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders the brand icon letter C", () => {
    renderWithProviders(<Sidebar />, { initialEntries: ["/chat"] });

    expect(screen.getByText("C")).toBeInTheDocument();
  });
});
