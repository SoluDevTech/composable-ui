import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import StringListEditor from "@/application/components/agent/StringListEditor";

describe("StringListEditor", () => {
  it("renders with label and existing items", () => {
    renderWithProviders(
      <StringListEditor
        label="Tools"
        value={["search", "calculator"]}
        onChange={vi.fn()}
        placeholder="Add tool..."
      />,
    );

    expect(screen.getByText("Tools")).toBeInTheDocument();
    expect(screen.getByText("search")).toBeInTheDocument();
    expect(screen.getByText("calculator")).toBeInTheDocument();
  });

  it("renders input with placeholder", () => {
    renderWithProviders(
      <StringListEditor
        label="Skills"
        value={[]}
        onChange={vi.fn()}
        placeholder="Add skill..."
      />,
    );

    expect(screen.getByPlaceholderText("Add skill...")).toBeInTheDocument();
  });

  it("calls onChange when adding an item", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(
      <StringListEditor
        label="Tools"
        value={["search"]}
        onChange={onChange}
        placeholder="Add tool..."
      />,
    );

    const input = screen.getByPlaceholderText("Add tool...");
    await user.type(input, "calculator");
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith(["search", "calculator"]);
  });

  it("calls onChange when removing an item", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(
      <StringListEditor
        label="Tools"
        value={["search", "calculator"]}
        onChange={onChange}
        placeholder="Add tool..."
      />,
    );

    const removeButtons = screen.getAllByRole("button", { name: /remove/i });
    await user.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledWith(["calculator"]);
  });

  it("does not add empty or duplicate items", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(
      <StringListEditor
        label="Tools"
        value={["search"]}
        onChange={onChange}
        placeholder="Add tool..."
      />,
    );

    const input = screen.getByPlaceholderText("Add tool...");
    await user.type(input, "search");
    await user.keyboard("{Enter}");

    expect(onChange).not.toHaveBeenCalled();

    onChange.mockClear();
    await user.clear(input);
    await user.keyboard("{Enter}");

    expect(onChange).not.toHaveBeenCalled();
  });
});
