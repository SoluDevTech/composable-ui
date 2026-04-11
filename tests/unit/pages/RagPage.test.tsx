import { screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../utils/render";
import RagPage from "@/application/pages/RagPage";

vi.mock("@/application/hooks/rag/useFolders", () => ({
  useFolders: () => ({
    data: [{ prefix: "docs/", name: "docs" }],
    isLoading: false,
    error: null,
  }),
}));

vi.mock("@/application/hooks/rag/useFiles", () => ({
  useFiles: () => ({
    data: [
      {
        objectName: "readme.md",
        filename: "readme.md",
        size: 500,
        lastModified: "2026-04-06T10:00:00Z",
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

describe("RagPage", () => {
  it("renders page title RAG Storage", () => {
    renderWithProviders(<RagPage />, { initialEntries: ["/rag"] });

    expect(
      screen.getByRole("heading", { name: /rag storage/i }),
    ).toBeInTheDocument();
  });

  it("shows breadcrumb navigation", () => {
    renderWithProviders(<RagPage />, { initialEntries: ["/rag"] });

    expect(screen.getByLabelText("Home")).toBeInTheDocument();
  });

  it("shows file list with folders and files", () => {
    renderWithProviders(<RagPage />, { initialEntries: ["/rag"] });

    expect(screen.getByText("docs")).toBeInTheDocument();
    expect(screen.getByText("readme.md")).toBeInTheDocument();
  });
});
