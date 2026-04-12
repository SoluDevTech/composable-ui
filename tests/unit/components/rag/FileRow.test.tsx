import { screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import FileRow from "@/application/components/rag/FileRow";

describe("FileRow", () => {
  it("renders filename as the last path segment", () => {
    renderWithProviders(
      <FileRow
        filename="readme.md"
        size={1024}
        lastModified="2026-04-06T10:00:00Z"
      />,
    );

    expect(screen.getByText("readme.md")).toBeInTheDocument();
  });

  it("renders human-readable file size", () => {
    renderWithProviders(
      <FileRow
        filename="report.pdf"
        size={1536000}
        lastModified="2026-04-06T10:00:00Z"
      />,
    );

    expect(screen.getByText("1.5 MB")).toBeInTheDocument();
  });

  it("renders formatted date", () => {
    renderWithProviders(
      <FileRow
        filename="guide.md"
        size={500}
        lastModified="2026-04-06T10:00:00Z"
      />,
    );

    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("shows — for null lastModified", () => {
    renderWithProviders(
      <FileRow filename="draft.txt" size={100} lastModified={null} />,
    );

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows 0 B for zero size", () => {
    renderWithProviders(
      <FileRow
        filename="empty.log"
        size={0}
        lastModified="2026-04-06T10:00:00Z"
      />,
    );

    expect(screen.getByText("0 B")).toBeInTheDocument();
  });

  it("shows 1.2 MB for large files", () => {
    renderWithProviders(
      <FileRow
        filename="archive.zip"
        size={1258291}
        lastModified="2026-04-06T10:00:00Z"
      />,
    );

    expect(screen.getByText("1.2 MB")).toBeInTheDocument();
  });

  it("does not have a clickable role — it is a row, not a button", () => {
    renderWithProviders(
      <FileRow
        filename="readme.md"
        size={1024}
        lastModified="2026-04-06T10:00:00Z"
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
