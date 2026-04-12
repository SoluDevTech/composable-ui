import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import BreadcrumbBar from "@/application/components/rag/BreadcrumbBar";

describe("BreadcrumbBar", () => {
  it("renders path segments as breadcrumbs", () => {
    renderWithProviders(
      <BreadcrumbBar
        segments={["docs", "reports", "2026"]}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByText("docs")).toBeInTheDocument();
    expect(screen.getByText("reports")).toBeInTheDocument();
    expect(screen.getByText("2026")).toBeInTheDocument();
  });

  it("shows Home icon for root", () => {
    renderWithProviders(
      <BreadcrumbBar segments={["docs"]} onNavigate={vi.fn()} />,
    );

    expect(screen.getByLabelText("Home")).toBeInTheDocument();
  });

  it("current (last) segment is not clickable — plain text, not a button", () => {
    renderWithProviders(
      <BreadcrumbBar
        segments={["docs", "reports"]}
        onNavigate={vi.fn()}
      />,
    );

    const lastSegment = screen.getByText("reports");
    expect(lastSegment.tagName).not.toBe("BUTTON");
  });

  it("other segments are clickable buttons", () => {
    renderWithProviders(
      <BreadcrumbBar
        segments={["docs", "reports", "q1"]}
        onNavigate={vi.fn()}
      />,
    );

    const docsSegment = screen.getByRole("button", { name: "docs" });
    const reportsSegment = screen.getByRole("button", { name: "reports" });
    expect(docsSegment).toBeInTheDocument();
    expect(reportsSegment).toBeInTheDocument();
  });

  it("calls onNavigate with correct index when clicking a segment", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    renderWithProviders(
      <BreadcrumbBar
        segments={["docs", "reports", "q1"]}
        onNavigate={onNavigate}
      />,
    );

    await user.click(screen.getByRole("button", { name: "docs" }));
    expect(onNavigate).toHaveBeenCalledWith(0);

    await user.click(screen.getByRole("button", { name: "reports" }));
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it("calls onNavigate(-1) when Home is clicked", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    renderWithProviders(
      <BreadcrumbBar
        segments={["docs", "reports"]}
        onNavigate={onNavigate}
      />,
    );

    await user.click(screen.getByLabelText("Home"));
    expect(onNavigate).toHaveBeenCalledWith(-1);
  });
});
