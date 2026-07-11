import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import IndexActionMenu from "@/application/components/rag/IndexActionMenu";

describe("IndexActionMenu", () => {
  it("renders trigger button", () => {
    renderWithProviders(<IndexActionMenu onIndexLightRAG={vi.fn()} onIndexClassical={vi.fn()} />);

    expect(screen.getByRole("button", { name: /index options/i })).toBeInTheDocument();
  });

  it("clicking trigger shows dropdown options", async () => {
    const user = userEvent.setup();

    renderWithProviders(<IndexActionMenu onIndexLightRAG={vi.fn()} onIndexClassical={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /index options/i }));

    expect(screen.getByRole("menuitem", { name: /index with lightrag/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /index with classical/i })).toBeInTheDocument();
  });

  it("clicking LightRAG option calls onIndexLightRAG", async () => {
    const user = userEvent.setup();
    const onIndexLightRAG = vi.fn();

    renderWithProviders(
      <IndexActionMenu onIndexLightRAG={onIndexLightRAG} onIndexClassical={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: /index options/i }));
    await user.click(screen.getByRole("menuitem", { name: /index with lightrag/i }));

    expect(onIndexLightRAG).toHaveBeenCalledOnce();
  });

  it("clicking Classical option calls onIndexClassical", async () => {
    const user = userEvent.setup();
    const onIndexClassical = vi.fn();

    renderWithProviders(
      <IndexActionMenu onIndexLightRAG={vi.fn()} onIndexClassical={onIndexClassical} />,
    );

    await user.click(screen.getByRole("button", { name: /index options/i }));
    await user.click(screen.getByRole("menuitem", { name: /index with classical/i }));

    expect(onIndexClassical).toHaveBeenCalledOnce();
  });

  // ─── a11y: keyboard navigation ────────────────────────────────────────────

  it("ArrowDown on trigger opens the menu", async () => {
    const user = userEvent.setup();

    renderWithProviders(<IndexActionMenu onIndexLightRAG={vi.fn()} onIndexClassical={vi.fn()} />);

    const trigger = screen.getByRole("button", { name: /index options/i });
    trigger.focus();
    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("menuitem", { name: /index with lightrag/i })).toBeInTheDocument();
  });

  it("Enter on trigger opens the menu", async () => {
    const user = userEvent.setup();

    renderWithProviders(<IndexActionMenu onIndexLightRAG={vi.fn()} onIndexClassical={vi.fn()} />);

    const trigger = screen.getByRole("button", { name: /index options/i });
    trigger.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("menuitem", { name: /index with lightrag/i })).toBeInTheDocument();
  });

  it("ArrowDown cycles through menu items (wraps around)", async () => {
    const user = userEvent.setup();

    renderWithProviders(<IndexActionMenu onIndexLightRAG={vi.fn()} onIndexClassical={vi.fn()} />);

    const trigger = screen.getByRole("button", { name: /index options/i });
    trigger.focus();
    await user.keyboard("{ArrowDown}");

    const lightrag = screen.getByRole("menuitem", { name: /index with lightrag/i });
    const classical = screen.getByRole("menuitem", { name: /index with classical/i });

    // First item should be focused after opening.
    expect(lightrag).toHaveFocus();

    // ArrowDown → second item.
    await user.keyboard("{ArrowDown}");
    expect(classical).toHaveFocus();

    // ArrowDown again wraps to first item.
    await user.keyboard("{ArrowDown}");
    expect(lightrag).toHaveFocus();
  });

  it("ArrowUp cycles through menu items in reverse (wraps around)", async () => {
    const user = userEvent.setup();

    renderWithProviders(<IndexActionMenu onIndexLightRAG={vi.fn()} onIndexClassical={vi.fn()} />);

    const trigger = screen.getByRole("button", { name: /index options/i });
    trigger.focus();
    await user.keyboard("{ArrowDown}");

    const lightrag = screen.getByRole("menuitem", { name: /index with lightrag/i });
    const classical = screen.getByRole("menuitem", { name: /index with classical/i });

    // First item is focused after open.
    expect(lightrag).toHaveFocus();

    // ArrowUp wraps to last item.
    await user.keyboard("{ArrowUp}");
    expect(classical).toHaveFocus();

    // ArrowUp again → back to first item.
    await user.keyboard("{ArrowUp}");
    expect(lightrag).toHaveFocus();
  });

  it("Escape closes the menu and returns focus to the trigger", async () => {
    const user = userEvent.setup();

    renderWithProviders(<IndexActionMenu onIndexLightRAG={vi.fn()} onIndexClassical={vi.fn()} />);

    const trigger = screen.getByRole("button", { name: /index options/i });
    trigger.focus();
    await user.keyboard("{ArrowDown}");

    // Menu is open.
    expect(screen.getByRole("menuitem", { name: /index with lightrag/i })).toBeInTheDocument();

    await user.keyboard("{Escape}");

    // Menu is closed.
    expect(
      screen.queryByRole("menuitem", { name: /index with lightrag/i }),
    ).not.toBeInTheDocument();

    // Focus returned to trigger.
    expect(trigger).toHaveFocus();
  });

  it("outside click closes the menu", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <div>
        <div data-testid="outside">Outside</div>
        <IndexActionMenu onIndexLightRAG={vi.fn()} onIndexClassical={vi.fn()} />
      </div>,
    );

    await user.click(screen.getByRole("button", { name: /index options/i }));

    expect(screen.getByRole("menuitem", { name: /index with lightrag/i })).toBeInTheDocument();

    await user.click(screen.getByTestId("outside"));

    expect(
      screen.queryByRole("menuitem", { name: /index with lightrag/i }),
    ).not.toBeInTheDocument();
  });

  it("selecting via keyboard calls the right handler and closes menu", async () => {
    const user = userEvent.setup();
    const onIndexLightRAG = vi.fn();

    renderWithProviders(
      <IndexActionMenu onIndexLightRAG={onIndexLightRAG} onIndexClassical={vi.fn()} />,
    );

    const trigger = screen.getByRole("button", { name: /index options/i });
    trigger.focus();
    await user.keyboard("{ArrowDown}");

    const lightrag = screen.getByRole("menuitem", { name: /index with lightrag/i });
    expect(lightrag).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(onIndexLightRAG).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole("menuitem", { name: /index with lightrag/i }),
    ).not.toBeInTheDocument();
  });
});
