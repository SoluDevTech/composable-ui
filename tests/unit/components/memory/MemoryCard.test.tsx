import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import { MemoryCard } from "@/application/components/memory/MemoryCard";

describe("MemoryCard", () => {
  it("renders memory name", () => {
    renderWithProviders(
      <MemoryCard
        name="AGENTS.md"
        preview="# Project rules..."
        onConfigure={vi.fn()}
      />,
    );

    expect(screen.getByText("AGENTS.md")).toBeInTheDocument();
  });

  it("renders content preview", () => {
    renderWithProviders(
      <MemoryCard
        name="AGENTS.md"
        preview="# Project rules..."
        onConfigure={vi.fn()}
      />,
    );

    expect(screen.getByText("# Project rules...")).toBeInTheDocument();
  });

  it("calls onConfigure when Configure button is clicked", async () => {
    const user = userEvent.setup();
    const onConfigure = vi.fn();

    renderWithProviders(
      <MemoryCard
        name="AGENTS.md"
        preview="# Project rules..."
        onConfigure={onConfigure}
      />,
    );

    await user.click(screen.getByRole("button", { name: /configure/i }));

    expect(onConfigure).toHaveBeenCalledOnce();
    expect(onConfigure).toHaveBeenCalledWith("AGENTS.md");
  });
});