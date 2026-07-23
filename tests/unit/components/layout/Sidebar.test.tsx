import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import Sidebar from "@/application/components/layout/Sidebar";

describe("Sidebar", () => {
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

    expect(screen.getByText("Yohan")).toBeInTheDocument();
    expect(screen.getByText("Operator")).toBeInTheDocument();
  });

  it("renders the user avatar initials YH", () => {
    renderWithProviders(<Sidebar />, { initialEntries: ["/chat"] });

    expect(screen.getByText("YH")).toBeInTheDocument();
  });

  it("renders the brand icon letter C", () => {
    renderWithProviders(<Sidebar />, { initialEntries: ["/chat"] });

    expect(screen.getByText("C")).toBeInTheDocument();
  });
});
