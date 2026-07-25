import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CreateFolderDialog from "@/application/components/rag/CreateFolderDialog";

describe("CreateFolderDialog", () => {
  it("renders_input_and_create_button", () => {
    render(<CreateFolderDialog open={true} onClose={() => {}} onCreate={() => {}} />);

    expect(screen.getByRole("textbox", { name: /folder/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
  });

  it("create_calls_onCreate_with_folder_name", () => {
    const onCreate = vi.fn();
    const onClose = vi.fn();

    render(<CreateFolderDialog open={true} onClose={onClose} onCreate={onCreate} />);

    fireEvent.change(screen.getByRole("textbox", { name: /folder/i }), {
      target: { value: "myfolder" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(onCreate).toHaveBeenCalledWith("myfolder");
  });

  it("cancel_calls_onClose", () => {
    const onClose = vi.fn();

    render(<CreateFolderDialog open={true} onClose={onClose} onCreate={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does_not_call_onCreate_when_folder_name_is_empty", () => {
    const onCreate = vi.fn();

    render(<CreateFolderDialog open={true} onClose={() => {}} onCreate={onCreate} />);

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(onCreate).not.toHaveBeenCalled();
  });
});
