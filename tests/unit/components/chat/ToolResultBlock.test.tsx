import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import ToolResultBlock from "@/application/components/chat/ToolResultBlock";

describe("ToolResultBlock", () => {
  it("renders the header with name and source when provided", () => {
    renderWithProviders(<ToolResultBlock name="search" content="result payload" source={null} />);

    expect(screen.getByText(/Tool Result/i)).toBeInTheDocument();
    expect(screen.getByText(/search/i)).toBeInTheDocument();
  });

  it("renders source label for subagent results", () => {
    renderWithProviders(<ToolResultBlock name="search" content="ok" source="subagent-a" />);

    expect(screen.getByText(/subagent-a/i)).toBeInTheDocument();
  });

  it("toggles content visibility on header click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ToolResultBlock name="search" content="visible-payload" source={null} />);

    const toggle = screen.getByRole("button", { name: /toggle result/i });
    expect(screen.queryByText("visible-payload")).not.toBeInTheDocument();

    await user.click(toggle);
    expect(screen.getByText("visible-payload")).toBeInTheDocument();
  });

  it("renders gracefully when content is null", () => {
    renderWithProviders(<ToolResultBlock name="noop" content={null} source={null} />);

    expect(screen.getByText(/Tool Result/i)).toBeInTheDocument();
  });
});
