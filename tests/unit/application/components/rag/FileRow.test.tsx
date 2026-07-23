import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FileRow from "@/application/components/rag/FileRow";

describe("FileRow", () => {
  const baseProps = {
    filename: "report.pdf",
    size: 1024,
    lastModified: "2026-04-06T10:00:00Z",
  };

  it("renders_delete_button_when_onDelete_provided", () => {
    render(
      <FileRow
        {...baseProps}
        onDelete={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: /delete report\.pdf/i })).toBeInTheDocument();
  });

  it("does_not_render_delete_button_when_no_onDelete", () => {
    render(<FileRow {...baseProps} />);

    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });

  it("delete_click_calls_onDelete_and_stops_propagation", () => {
    const onDelete = vi.fn();
    const onRowClick = vi.fn();

    render(
      <div onClick={onRowClick}>
        <FileRow {...baseProps} onDelete={onDelete} />
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: /delete report\.pdf/i }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("delete_button_is_disabled_when_indexing", () => {
    render(
      <FileRow {...baseProps} onDelete={() => {}} isIndexing={true} />,
    );

    expect(screen.getByRole("button", { name: /delete report\.pdf/i })).toBeDisabled();
  });
});