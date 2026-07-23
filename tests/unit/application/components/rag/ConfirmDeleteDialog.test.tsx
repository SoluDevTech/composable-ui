import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmDeleteDialog from "@/application/components/rag/ConfirmDeleteDialog";

describe("ConfirmDeleteDialog", () => {
  it("renders_name_in_title", () => {
    render(
      <ConfirmDeleteDialog
        open={true}
        name="docs/report.pdf"
        onConfirm={() => {}}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText(/docs\/report\.pdf/i)).toBeInTheDocument();
  });

  it("confirm_calls_onConfirm", () => {
    const onConfirm = vi.fn();

    render(
      <ConfirmDeleteDialog
        open={true}
        name="docs/report.pdf"
        onConfirm={onConfirm}
        onClose={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("cancel_calls_onClose", () => {
    const onClose = vi.fn();

    render(
      <ConfirmDeleteDialog
        open={true}
        name="docs/report.pdf"
        onConfirm={() => {}}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});