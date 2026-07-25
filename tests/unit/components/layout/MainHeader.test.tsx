import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import MainHeader from "@/application/components/layout/MainHeader";

describe("MainHeader", () => {
  it("renders the page title for /chat route as 'Orchestration Console'", () => {
    renderWithProviders(<MainHeader />, { initialEntries: ["/chat"] });

    expect(screen.getByRole("heading", { name: /orchestration console/i })).toBeInTheDocument();
  });

  it("renders the page title for /agents route as 'Active Agents'", () => {
    renderWithProviders(<MainHeader />, { initialEntries: ["/agents"] });

    expect(screen.getByRole("heading", { name: /active agents/i })).toBeInTheDocument();
  });

  it("renders the page title for /rag route as 'RAG Storage'", () => {
    renderWithProviders(<MainHeader />, { initialEntries: ["/rag"] });

    expect(screen.getByRole("heading", { name: /rag storage/i })).toBeInTheDocument();
  });

  it("renders the page title for /settings route as 'Settings'", () => {
    renderWithProviders(<MainHeader />, { initialEntries: ["/settings"] });

    expect(screen.getByRole("heading", { name: /^settings$/i })).toBeInTheDocument();
  });

  it("does not render the theme toggle button", () => {
    renderWithProviders(<MainHeader />, { initialEntries: ["/chat"] });

    expect(screen.queryByRole("button", { name: /toggle theme/i })).not.toBeInTheDocument();
  });

  it("does not render the settings button in the header", () => {
    renderWithProviders(<MainHeader />, { initialEntries: ["/chat"] });

    expect(screen.queryByRole("button", { name: /settings/i })).not.toBeInTheDocument();
  });

  it("does not render the account button in the header", () => {
    renderWithProviders(<MainHeader />, { initialEntries: ["/chat"] });

    expect(screen.queryByRole("button", { name: /account/i })).not.toBeInTheDocument();
  });

  it("renders the menu button to open the sidebar", () => {
    renderWithProviders(<MainHeader />, { initialEntries: ["/chat"] });

    expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();
  });

  it("renders the page title with data-od-id attribute for QA parity", () => {
    renderWithProviders(<MainHeader />, { initialEntries: ["/chat"] });

    expect(screen.getByRole("heading")).toHaveAttribute("data-od-id", "page-title");
  });
});
