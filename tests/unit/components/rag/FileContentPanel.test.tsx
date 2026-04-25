import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import FileContentPanel from "@/application/components/rag/FileContentPanel";

describe("FileContentPanel", () => {
  it("renders file content", () => {
    renderWithProviders(
      <FileContentPanel
        content="Hello, world!"
        metadata={{ format_type: "text", mime_type: "text/plain" }}
        tables={[]}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Hello, world!")).toBeInTheDocument();
  });

  it("renders metadata format_type and mime_type", () => {
    renderWithProviders(
      <FileContentPanel
        content="some content"
        metadata={{ format_type: "pdf", mime_type: "application/pdf" }}
        tables={[]}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("pdf")).toBeInTheDocument();
    expect(screen.getByText("application/pdf")).toBeInTheDocument();
  });

  it("renders close button", () => {
    renderWithProviders(
      <FileContentPanel
        content="some content"
        metadata={{ format_type: "text", mime_type: "text/plain" }}
        tables={[]}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /close/i }),
    ).toBeInTheDocument();
  });

  it("clicking close calls onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithProviders(
      <FileContentPanel
        content="some content"
        metadata={{ format_type: "text", mime_type: "text/plain" }}
        tables={[]}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders tables when provided", () => {
    const tables = [
      {
        headers: ["Name", "Value"],
        rows: [["foo", "bar"]],
      },
    ];

    renderWithProviders(
      <FileContentPanel
        content="content with table"
        metadata={{ format_type: "text", mime_type: "text/plain" }}
        tables={tables}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Value")).toBeInTheDocument();
    expect(screen.getByText("foo")).toBeInTheDocument();
    expect(screen.getByText("bar")).toBeInTheDocument();
  });
});