import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import IndexActionMenu from "@/application/components/rag/IndexActionMenu";

describe("IndexActionMenu", () => {
  it("renders an Index button", () => {
    renderWithProviders(<IndexActionMenu onIndexClassical={vi.fn()} />);

    expect(screen.getByRole("button", { name: /index/i })).toBeInTheDocument();
  });

  it("clicking the Index button calls onIndexClassical", async () => {
    const user = userEvent.setup();
    const onIndexClassical = vi.fn();

    renderWithProviders(<IndexActionMenu onIndexClassical={onIndexClassical} />);

    await user.click(screen.getByRole("button", { name: /index/i }));

    expect(onIndexClassical).toHaveBeenCalledOnce();
  });

  it("is keyboard accessible (Enter triggers the action)", async () => {
    const user = userEvent.setup();
    const onIndexClassical = vi.fn();

    renderWithProviders(<IndexActionMenu onIndexClassical={onIndexClassical} />);

    const button = screen.getByRole("button", { name: /index/i });
    button.focus();
    await user.keyboard("{Enter}");

    expect(onIndexClassical).toHaveBeenCalledOnce();
  });
});
