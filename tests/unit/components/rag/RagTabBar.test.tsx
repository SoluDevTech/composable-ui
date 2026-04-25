import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import RagTabBar from "@/application/components/rag/RagTabBar";

describe("RagTabBar", () => {
  it("renders 2 tab buttons: Browse and Query", () => {
    renderWithProviders(
      <RagTabBar activeTab="browse" onTabChange={vi.fn()} />,
    );

    expect(screen.getByRole("tab", { name: /browse/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /query/i })).toBeInTheDocument();
  });

  it("shows active tab with aria-selected indicator", () => {
    renderWithProviders(
      <RagTabBar activeTab="browse" onTabChange={vi.fn()} />,
    );

    const browseTab = screen.getByRole("tab", { name: /browse/i });
    const queryTab = screen.getByRole("tab", { name: /query/i });

    expect(browseTab).toHaveAttribute("aria-selected", "true");
    expect(queryTab).toHaveAttribute("aria-selected", "false");
  });

  it("shows Query tab as active when value is query", () => {
    renderWithProviders(
      <RagTabBar activeTab="query" onTabChange={vi.fn()} />,
    );

    const browseTab = screen.getByRole("tab", { name: /browse/i });
    const queryTab = screen.getByRole("tab", { name: /query/i });

    expect(browseTab).toHaveAttribute("aria-selected", "false");
    expect(queryTab).toHaveAttribute("aria-selected", "true");
  });

  it("clicking inactive tab calls onTabChange with the correct value", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();

    renderWithProviders(
      <RagTabBar activeTab="browse" onTabChange={onTabChange} />,
    );

    await user.click(screen.getByRole("tab", { name: /query/i }));
    expect(onTabChange).toHaveBeenCalledWith("query");
  });

  it("clicking the active tab does not call onTabChange", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();

    renderWithProviders(
      <RagTabBar activeTab="browse" onTabChange={onTabChange} />,
    );

    await user.click(screen.getByRole("tab", { name: /browse/i }));
    expect(onTabChange).not.toHaveBeenCalled();
  });
});