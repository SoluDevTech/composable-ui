import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import SegmentedToggle from "@/application/components/shared/SegmentedToggle";

const OPTIONS = [
  { value: "a" as const, label: "Option A" },
  { value: "b" as const, label: "Option B" },
  { value: "c" as const, label: "Option C" },
];

describe("SegmentedToggle — tab pattern", () => {
  it("renders a tablist with role=tab on items", () => {
    renderWithProviders(
      <SegmentedToggle
        value="a"
        options={OPTIONS}
        onChange={vi.fn()}
        pattern="tab"
        ariaLabel="View selector"
      />,
    );

    expect(screen.getByRole("tablist")).toBeInTheDocument();
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
  });

  it("sets aria-selected on the active tab only", () => {
    renderWithProviders(
      <SegmentedToggle value="b" options={OPTIONS} onChange={vi.fn()} pattern="tab" />,
    );

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[2]).toHaveAttribute("aria-selected", "false");
  });

  it("does not set aria-pressed or aria-checked in tab mode", () => {
    renderWithProviders(
      <SegmentedToggle value="a" options={OPTIONS} onChange={vi.fn()} pattern="tab" />,
    );

    const tabs = screen.getAllByRole("tab");
    for (const tab of tabs) {
      expect(tab).not.toHaveAttribute("aria-pressed");
      expect(tab).not.toHaveAttribute("aria-checked");
    }
  });

  it("calls onChange when clicking a different tab", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(
      <SegmentedToggle value="a" options={OPTIONS} onChange={onChange} pattern="tab" />,
    );

    await user.click(screen.getByText("Option B"));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("does not call onChange when clicking the already-selected tab", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(
      <SegmentedToggle value="a" options={OPTIONS} onChange={onChange} pattern="tab" />,
    );

    await user.click(screen.getByText("Option A"));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("SegmentedToggle — radio pattern", () => {
  it("renders a radiogroup with role=radio on items", () => {
    renderWithProviders(
      <SegmentedToggle value="a" options={OPTIONS} onChange={vi.fn()} pattern="radio" />,
    );

    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
  });

  it("sets aria-checked on the active radio only", () => {
    renderWithProviders(
      <SegmentedToggle value="c" options={OPTIONS} onChange={vi.fn()} pattern="radio" />,
    );

    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("aria-checked", "false");
    expect(radios[1]).toHaveAttribute("aria-checked", "false");
    expect(radios[2]).toHaveAttribute("aria-checked", "true");
  });

  it("implements roving tabindex — selected radio is 0, others are -1", () => {
    renderWithProviders(
      <SegmentedToggle value="b" options={OPTIONS} onChange={vi.fn()} pattern="radio" />,
    );

    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("tabindex", "-1");
    expect(radios[1]).toHaveAttribute("tabindex", "0");
    expect(radios[2]).toHaveAttribute("tabindex", "-1");
  });

  it("does not set aria-selected in radio mode", () => {
    renderWithProviders(
      <SegmentedToggle value="a" options={OPTIONS} onChange={vi.fn()} pattern="radio" />,
    );

    const radios = screen.getAllByRole("radio");
    for (const radio of radios) {
      expect(radio).not.toHaveAttribute("aria-selected");
    }
  });
});

describe("SegmentedToggle — toggle pattern", () => {
  it("renders plain buttons with aria-pressed (no tablist/radiogroup role)", () => {
    renderWithProviders(
      <SegmentedToggle value="a" options={OPTIONS} onChange={vi.fn()} pattern="toggle" />,
    );

    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
  });

  it("sets aria-pressed on the active toggle only", () => {
    renderWithProviders(
      <SegmentedToggle value="a" options={OPTIONS} onChange={vi.fn()} pattern="toggle" />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[1]).toHaveAttribute("aria-pressed", "false");
    expect(buttons[2]).toHaveAttribute("aria-pressed", "false");
  });

  it("does not set aria-selected or aria-checked in toggle mode", () => {
    renderWithProviders(
      <SegmentedToggle value="a" options={OPTIONS} onChange={vi.fn()} pattern="toggle" />,
    );

    const buttons = screen.getAllByRole("button");
    for (const btn of buttons) {
      expect(btn).not.toHaveAttribute("aria-selected");
      expect(btn).not.toHaveAttribute("aria-checked");
    }
  });
});
