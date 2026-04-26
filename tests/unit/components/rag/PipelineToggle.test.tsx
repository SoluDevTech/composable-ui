import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import PipelineToggle from "@/application/components/rag/PipelineToggle";

describe("PipelineToggle", () => {
  it("renders 2 toggle options: LightRAG and Classical", () => {
    renderWithProviders(
      <PipelineToggle value="lightrag" onChange={vi.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: /lightrag/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /classical/i }),
    ).toBeInTheDocument();
  });

  it("shows active value for LightRAG", () => {
    renderWithProviders(
      <PipelineToggle value="lightrag" onChange={vi.fn()} />,
    );

    const lightragBtn = screen.getByRole("button", { name: /lightrag/i });
    const classicalBtn = screen.getByRole("button", { name: /classical/i });

    expect(lightragBtn).toHaveAttribute("aria-pressed", "true");
    expect(classicalBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("shows active value for Classical", () => {
    renderWithProviders(
      <PipelineToggle value="classical" onChange={vi.fn()} />,
    );

    const lightragBtn = screen.getByRole("button", { name: /lightrag/i });
    const classicalBtn = screen.getByRole("button", { name: /classical/i });

    expect(lightragBtn).toHaveAttribute("aria-pressed", "false");
    expect(classicalBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("clicking inactive option calls onChange with correct value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(
      <PipelineToggle value="lightrag" onChange={onChange} />,
    );

    await user.click(screen.getByRole("button", { name: /classical/i }));
    expect(onChange).toHaveBeenCalledWith("classical");
  });

  it("clicking inactive Classical option calls onChange with lightrag", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(
      <PipelineToggle value="classical" onChange={onChange} />,
    );

    await user.click(screen.getByRole("button", { name: /lightrag/i }));
    expect(onChange).toHaveBeenCalledWith("lightrag");
  });
});