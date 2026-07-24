import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import { PillMultiSelect } from "@/application/components/shared/PillMultiSelect";

describe("PillMultiSelect", () => {
  const options = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
  ];

  it("renders all options as toggle pills", () => {
    renderWithProviders(
      <PillMultiSelect
        options={options}
        selected={[]}
        onChange={vi.fn()}
        emptyMessage="No items found"
      />,
    );

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("highlights selected pills with active styling", () => {
    renderWithProviders(
      <PillMultiSelect
        options={options}
        selected={["a"]}
        onChange={vi.fn()}
        emptyMessage="No items found"
      />,
    );

    // The selected pill ("Alpha") must carry an aria-pressed state distinguishing it
    const alphaPill = screen.getByRole("button", { name: /alpha/i });
    expect(alphaPill).toHaveAttribute("aria-pressed", "true");

    // The unselected pill ("Beta") must not be pressed
    const betaPill = screen.getByRole("button", { name: /beta/i });
    expect(betaPill).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onChange when a pill is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(
      <PillMultiSelect
        options={options}
        selected={[]}
        onChange={onChange}
        emptyMessage="No items found"
      />,
    );

    await user.click(screen.getByRole("button", { name: /alpha/i }));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(["a"]);
  });

  it("shows emptyMessage when options array is empty", () => {
    renderWithProviders(
      <PillMultiSelect
        options={[]}
        selected={[]}
        onChange={vi.fn()}
        emptyMessage="No items found"
      />,
    );

    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("shows emptyMessage with custom text when provided", () => {
    renderWithProviders(
      <PillMultiSelect
        options={[]}
        selected={[]}
        onChange={vi.fn()}
        emptyMessage="Aucune compétence disponible"
      />,
    );

    expect(screen.getByText("Aucune compétence disponible")).toBeInTheDocument();
  });
});