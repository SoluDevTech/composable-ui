import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import StatusBadge from "@/application/components/shared/StatusBadge";

describe("StatusBadge", () => {
  it("renders the status text in uppercase", () => {
    renderWithProviders(<StatusBadge status="Active" />);

    const badge = screen.getByText("Active");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("uppercase");
  });

  it("applies success classes for 'Active' status", () => {
    renderWithProviders(<StatusBadge status="Active" />);

    const badge = screen.getByText("Active");
    expect(badge).toHaveClass("bg-success/10");
    expect(badge).toHaveClass("text-success");
    expect(badge).toHaveClass("border-success");
  });

  it("applies success classes for 'completed' status", () => {
    renderWithProviders(<StatusBadge status="completed" />);

    const badge = screen.getByText("Completed");
    expect(badge).toHaveClass("bg-success/10");
    expect(badge).toHaveClass("text-success");
    expect(badge).toHaveClass("border-success");
  });

  it("applies warn classes for 'awaiting_hitl' status", () => {
    renderWithProviders(<StatusBadge status="awaiting_hitl" />);

    const badge = screen.getByText("Awaiting Hitl");
    expect(badge).toHaveClass("bg-warn/10");
    expect(badge).toHaveClass("text-warn");
    expect(badge).toHaveClass("border-warn");
  });

  it("applies accent classes for 'streaming' status", () => {
    renderWithProviders(<StatusBadge status="streaming" />);

    const badge = screen.getByText("Streaming");
    expect(badge).toHaveClass("bg-accent/10");
    expect(badge).toHaveClass("text-accent");
    expect(badge).toHaveClass("border-accent");
  });

  it("applies danger classes for 'error' status", () => {
    renderWithProviders(<StatusBadge status="error" />);

    const badge = screen.getByText("Error");
    expect(badge).toHaveClass("bg-danger/10");
    expect(badge).toHaveClass("text-danger");
    expect(badge).toHaveClass("border-danger");
  });

  it("applies default classes for unknown status", () => {
    renderWithProviders(<StatusBadge status="unknown" />);

    const badge = screen.getByText("Unknown");
    expect(badge).toHaveClass("bg-surface-warm");
    expect(badge).toHaveClass("text-muted");
    expect(badge).toHaveClass("border-border");
  });
});
