import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import FolderRow from "@/application/components/rag/FolderRow";

describe("FolderRow", () => {
  it("renders folder name without trailing slash", () => {
    renderWithProviders(<FolderRow name="docs" onClick={vi.fn()} />);

    expect(screen.getByText("docs")).toBeInTheDocument();
  });

  it("shows folder icon", () => {
    renderWithProviders(<FolderRow name="images" onClick={vi.fn()} />);

    expect(screen.getByLabelText("folder icon")).toBeInTheDocument();
  });

  it("has role button for accessibility", () => {
    renderWithProviders(<FolderRow name="reports" onClick={vi.fn()} />);

    expect(screen.getByRole("button", { name: /reports/i })).toBeInTheDocument();
  });

  it("has tabIndex for keyboard accessibility", () => {
    renderWithProviders(<FolderRow name="reports" onClick={vi.fn()} />);

    const button = screen.getByRole("button", { name: /reports/i });
    expect(button).toHaveAttribute("tabindex", "0");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    renderWithProviders(<FolderRow name="docs" onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: /docs/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders an index button when onIndex is provided", () => {
    renderWithProviders(
      <FolderRow name="docs" onClick={vi.fn()} onIndex={vi.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: /index/i }),
    ).toBeInTheDocument();
  });

  it("calls onIndex when the index button is clicked", async () => {
    const user = userEvent.setup();
    const onIndex = vi.fn();

    renderWithProviders(
      <FolderRow name="docs" onClick={vi.fn()} onIndex={onIndex} />,
    );

    await user.click(screen.getByRole("button", { name: /index/i }));
    expect(onIndex).toHaveBeenCalledOnce();
  });
});
