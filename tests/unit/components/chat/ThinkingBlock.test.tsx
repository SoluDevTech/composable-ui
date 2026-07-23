import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import ThinkingBlock from "@/application/components/chat/ThinkingBlock";

describe("ThinkingBlock", () => {
  it("renders nothing when text is null or empty", () => {
    const { container } = renderWithProviders(<ThinkingBlock text={null} source={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders default 'Thinking' label when source is null", () => {
    renderWithProviders(<ThinkingBlock text="I am thinking" source={null} />);

    expect(screen.getByRole("button", { name: /Thinking/i })).toBeInTheDocument();
  });

  it("renders 'Thinking — {source}' when source is provided", () => {
    renderWithProviders(<ThinkingBlock text="Sub thought" source="subagent-a" />);

    expect(screen.getByRole("button", { name: /Thinking — subagent-a/i })).toBeInTheDocument();
  });

  it("toggles content visibility on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThinkingBlock text="secret thoughts" source={null} />);

    expect(screen.queryByText("secret thoughts")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Thinking/i }));
    expect(screen.getByText("secret thoughts")).toBeInTheDocument();
  });
});
