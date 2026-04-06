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

  it("applies green classes for 'Active' status", () => {
    renderWithProviders(<StatusBadge status="Active" />);

    const badge = screen.getByText("Active");
    expect(badge).toHaveClass("bg-emerald-100");
    expect(badge).toHaveClass("text-emerald-700");
  });

  it("applies green classes for 'completed' status", () => {
    renderWithProviders(<StatusBadge status="completed" />);

    const badge = screen.getByText("completed");
    expect(badge).toHaveClass("bg-emerald-100");
    expect(badge).toHaveClass("text-emerald-700");
  });

  it("applies orange classes for 'awaiting_hitl' status", () => {
    renderWithProviders(<StatusBadge status="awaiting_hitl" />);

    const badge = screen.getByText("awaiting_hitl");
    expect(badge).toHaveClass("bg-orange-100");
    expect(badge).toHaveClass("text-orange-700");
  });

  it("applies gray classes for unknown status", () => {
    renderWithProviders(<StatusBadge status="unknown" />);

    const badge = screen.getByText("unknown");
    expect(badge).toHaveClass("bg-slate-100");
    expect(badge).toHaveClass("text-slate-600");
  });
});
