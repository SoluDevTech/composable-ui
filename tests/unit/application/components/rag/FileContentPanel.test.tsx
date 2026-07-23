import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FileContentPanel from "@/application/components/rag/FileContentPanel";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("FileContentPanel", () => {
  it("renders_with_pages_content_joined", () => {
    render(
      <FileContentPanel
        content={[
          { page: 1, content: "hello" },
          { page: 2, content: "world" },
        ]}
        metadata={{ format_type: "text", mime_type: "text/plain" }}
        tables={null}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(screen.getByText("world")).toBeInTheDocument();
  });

  it("renders_with_null_metadata_without_crashing", () => {
    render(
      <FileContentPanel
        content={[{ page: 1, content: "no metadata" }]}
        metadata={null}
        tables={null}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("no metadata")).toBeInTheDocument();
  });

  it("renders_with_null_tables_without_crashing_and_no_table_section", () => {
    render(
      <FileContentPanel
        content={[{ page: 1, content: "no data here" }]}
        metadata={{ format_type: "text", mime_type: "text/plain" }}
        tables={null}
        onClose={() => {}}
      />,
    );

    expect(screen.queryByText(/tables/i)).not.toBeInTheDocument();
  });

  it("renders_with_markdown_tables", () => {
    render(
      <FileContentPanel
        content={[{ page: 1, content: "report body" }]}
        metadata={{ format_type: "pdf", mime_type: "application/pdf" }}
        tables={[{ markdown: "| a | b |\n| --- | --- |\n| 1 | 2 |" }]}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("| a | b |")).toBeInTheDocument();
  });

  it("renders_metadata_format_and_mime_when_provided", () => {
    render(
      <FileContentPanel
        content={[{ page: 1, content: "body" }]}
        metadata={{ format_type: "pdf", mime_type: "application/pdf" }}
        tables={null}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("pdf")).toBeInTheDocument();
    expect(screen.getByText("application/pdf")).toBeInTheDocument();
  });
});