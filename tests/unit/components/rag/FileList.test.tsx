import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import FileList from "@/application/components/rag/FileList";

describe("FileList", () => {
  it("shows loading state", () => {
    renderWithProviders(
      <FileList
        folders={[]}
        files={[]}
        isLoading={true}
        error={null}
        onFolderClick={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows error state with retry button", () => {
    renderWithProviders(
      <FileList
        folders={[]}
        files={[]}
        isLoading={false}
        error={new Error("Failed to load")}
        onFolderClick={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText(/unable to load/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /retry/i }),
    ).toBeInTheDocument();
  });

  it("shows empty state when no files or folders", () => {
    renderWithProviders(
      <FileList
        folders={[]}
        files={[]}
        isLoading={false}
        error={null}
        onFolderClick={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText(/no files or folders/i)).toBeInTheDocument();
  });

  it("renders folders before files", () => {
    const folders = [
      { prefix: "docs/", name: "docs" },
      { prefix: "images/", name: "images" },
    ];
    const files = [
      { objectName: "readme.md", filename: "readme.md", size: 500, lastModified: "2026-04-06T10:00:00Z" },
    ];

    renderWithProviders(
      <FileList
        folders={folders}
        files={files}
        isLoading={false}
        error={null}
        onFolderClick={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    const allItems = screen.getAllByRole("row");
    const docsIndex = allItems.findIndex((el) => el.textContent?.includes("docs"));
    const imagesIndex = allItems.findIndex((el) => el.textContent?.includes("images"));
    const readmeIndex = allItems.findIndex((el) => el.textContent?.includes("readme.md"));

    expect(docsIndex).toBeLessThan(readmeIndex);
    expect(imagesIndex).toBeLessThan(readmeIndex);
  });

  it("calls onFolderClick when a folder is clicked", async () => {
    const user = userEvent.setup();
    const onFolderClick = vi.fn();

    const folders = [{ prefix: "docs/", name: "docs" }];

    renderWithProviders(
      <FileList
        folders={folders}
        files={[]}
        isLoading={false}
        error={null}
        onFolderClick={onFolderClick}
        onRetry={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /docs/i }));
    expect(onFolderClick).toHaveBeenCalledWith("docs/");
  });

  it("calls onRetry when retry button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    renderWithProviders(
      <FileList
        folders={[]}
        files={[]}
        isLoading={false}
        error={new Error("Network error")}
        onFolderClick={vi.fn()}
        onRetry={onRetry}
      />,
    );

    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
