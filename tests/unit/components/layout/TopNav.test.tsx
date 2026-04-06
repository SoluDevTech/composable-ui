import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import TopNav from "@/application/components/layout/TopNav";

describe("TopNav", () => {
  it("renders app name 'Composables'", () => {
    renderWithProviders(<TopNav />);

    expect(screen.getByText("Composables")).toBeInTheDocument();
  });

  it("renders Orchestration link", () => {
    renderWithProviders(<TopNav />);

    const link = screen.getByRole("link", { name: /orchestration/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/chat");
  });

  it("renders Agents link", () => {
    renderWithProviders(<TopNav />);

    const link = screen.getByRole("link", { name: /agents/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/agents");
  });

  it("renders settings and account buttons", () => {
    renderWithProviders(<TopNav />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });
});
