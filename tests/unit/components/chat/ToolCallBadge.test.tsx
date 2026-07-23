import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import ToolCallBadge from "@/application/components/chat/ToolCallBadge";

describe("ToolCallBadge", () => {
  it("renders the tool name and label when source is null (parent)", () => {
    renderWithProviders(<ToolCallBadge name="search" args='{"q":"test"}' source={null} />);

    expect(screen.getByText(/Calling tool: search/i)).toBeInTheDocument();
  });

  it("renders the source label when a subagent is the caller", () => {
    renderWithProviders(<ToolCallBadge name="search" args='{"q":"test"}' source="subagent-a" />);

    expect(screen.getByText(/subagent-a/i)).toBeInTheDocument();
  });

  it("toggles args visibility on chevron click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ToolCallBadge name="search" args='{"q":"test"}' source={null} />);

    const toggle = screen.getByRole("button", { name: /toggle args/i });
    expect(screen.queryByText('{"q":"test"}')).not.toBeInTheDocument();

    await user.click(toggle);
    expect(screen.getByText('{"q":"test"}')).toBeInTheDocument();

    await user.click(toggle);
    expect(screen.queryByText('{"q":"test"}')).not.toBeInTheDocument();
  });

  it("does not render args section when args is null", () => {
    renderWithProviders(<ToolCallBadge name="noop" args={null} source={null} />);

    expect(screen.queryByRole("button", { name: /toggle args/i })).not.toBeInTheDocument();
  });
});
