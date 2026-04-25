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

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    renderWithProviders(<FolderRow name="docs" onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: /docs/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders an index action menu when onIndexLightRAG is provided", () => {
    renderWithProviders(
      <FolderRow name="docs" onClick={vi.fn()} onIndexLightRAG={vi.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: /index options/i }),
    ).toBeInTheDocument();
  });

  it("shows dropdown with LightRAG option when index button is clicked", async () => {
    const user = userEvent.setup();
    const onIndexLightRAG = vi.fn();

    renderWithProviders(
      <FolderRow name="docs" onClick={vi.fn()} onIndexLightRAG={onIndexLightRAG} />,
    );

    await user.click(screen.getByRole("button", { name: /index options/i }));
    expect(screen.getByText("Index with LightRAG")).toBeInTheDocument();
  });

  it("calls onIndexLightRAG when LightRAG option is clicked", async () => {
    const user = userEvent.setup();
    const onIndexLightRAG = vi.fn();

    renderWithProviders(
      <FolderRow name="docs" onClick={vi.fn()} onIndexLightRAG={onIndexLightRAG} />,
    );

    await user.click(screen.getByRole("button", { name: /index options/i }));
    await user.click(screen.getByText("Index with LightRAG"));

    expect(onIndexLightRAG).toHaveBeenCalledOnce();
  });

  it("calls onIndexClassical when Classical option is clicked", async () => {
    const user = userEvent.setup();
    const onIndexClassical = vi.fn();

    renderWithProviders(
      <FolderRow name="docs" onClick={vi.fn()} onIndexClassical={onIndexClassical} />,
    );

    await user.click(screen.getByRole("button", { name: /index options/i }));
    await user.click(screen.getByText("Index with Classical"));

    expect(onIndexClassical).toHaveBeenCalledOnce();
  });

  it("shows spinner when isIndexing is true", () => {
    renderWithProviders(<FolderRow name="docs" onClick={vi.fn()} isIndexing />);

    expect(screen.getByText("docs")).toBeInTheDocument();
  });
});