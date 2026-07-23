import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FolderRow from "@/application/components/rag/FolderRow";

describe("FolderRow", () => {
  const baseProps = {
    name: "docs",
    onClick: () => {},
  };

  it("renders_delete_button_when_onDelete_provided", () => {
    render(
      <FolderRow
        {...baseProps}
        onDelete={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: /delete docs/i })).toBeInTheDocument();
  });

  it("does_not_render_delete_button_when_no_onDelete", () => {
    render(<FolderRow {...baseProps} />);

    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });

  it("delete_click_calls_onDelete_and_stops_propagation", () => {
    const onDelete = vi.fn();
    const onRowClick = vi.fn();

    render(
      <div onClick={onRowClick}>
        <FolderRow {...baseProps} onClick={onRowClick} onDelete={onDelete} />
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: /delete docs/i }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});