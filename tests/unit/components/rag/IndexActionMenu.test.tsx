import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import IndexActionMenu from "@/application/components/rag/IndexActionMenu";

describe("IndexActionMenu", () => {
  it("renders trigger button", () => {
    renderWithProviders(
      <IndexActionMenu
        onIndexLightRAG={vi.fn()}
        onIndexClassical={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /index options/i }),
    ).toBeInTheDocument();
  });

  it("clicking trigger shows dropdown options", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <IndexActionMenu
        onIndexLightRAG={vi.fn()}
        onIndexClassical={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /index options/i }));

    expect(
      screen.getByRole("button", { name: /index with lightrag/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /index with classical/i }),
    ).toBeInTheDocument();
  });

  it("clicking LightRAG option calls onIndexLightRAG", async () => {
    const user = userEvent.setup();
    const onIndexLightRAG = vi.fn();

    renderWithProviders(
      <IndexActionMenu
        onIndexLightRAG={onIndexLightRAG}
        onIndexClassical={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /index options/i }));
    await user.click(screen.getByRole("button", { name: /index with lightrag/i }));

    expect(onIndexLightRAG).toHaveBeenCalledOnce();
  });

  it("clicking Classical option calls onIndexClassical", async () => {
    const user = userEvent.setup();
    const onIndexClassical = vi.fn();

    renderWithProviders(
      <IndexActionMenu
        onIndexLightRAG={vi.fn()}
        onIndexClassical={onIndexClassical}
      />,
    );

    await user.click(screen.getByRole("button", { name: /index options/i }));
    await user.click(screen.getByRole("button", { name: /index with classical/i }));

    expect(onIndexClassical).toHaveBeenCalledOnce();
  });
});