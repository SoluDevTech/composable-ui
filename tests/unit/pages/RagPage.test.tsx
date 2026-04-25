import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

vi.mock("@/application/hooks/rag/useRagQuery", () => ({
  useRagQuery: () => ({
    mutate: vi.fn(),
    data: null,
    isPending: false,
    error: null,
    reset: vi.fn(),
  }),
}));

vi.mock("@/application/hooks/rag/useClassicalQuery", () => ({
  useClassicalQuery: () => ({
    mutate: vi.fn(),
    data: null,
    isPending: false,
    error: null,
    reset: vi.fn(),
  }),
}));

vi.mock("@/application/hooks/rag/useIndexFile", () => ({
  useIndexFile: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/application/hooks/rag/useIndexFolder", () => ({
  useIndexFolder: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/application/hooks/rag/useClassicalIndexFile", () => ({
  useClassicalIndexFile: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/application/hooks/rag/useClassicalIndexFolder", () => ({
  useClassicalIndexFolder: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/application/hooks/rag/useReadFile", () => ({
  useReadFile: () => ({ mutate: vi.fn(), data: null, isPending: false }),
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

  it("shows RagTabBar with Browse and Query tabs", () => {
    renderWithProviders(<RagPage />, { initialEntries: ["/rag"] });

    expect(screen.getByRole("tab", { name: /browse/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /query/i })).toBeInTheDocument();
  });

  it("Browse tab is active by default", () => {
    renderWithProviders(<RagPage />, { initialEntries: ["/rag"] });

    const browseTab = screen.getByRole("tab", { name: /browse/i });
    const queryTab = screen.getByRole("tab", { name: /query/i });

    expect(browseTab).toHaveAttribute("aria-selected", "true");
    expect(queryTab).toHaveAttribute("aria-selected", "false");
  });

  it("clicking Query tab shows QueryPanel", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RagPage />, { initialEntries: ["/rag"] });

    await user.click(screen.getByRole("tab", { name: /query/i }));

    expect(
      screen.getByRole("button", { name: /lightrag/i }),
    ).toBeInTheDocument();
  });

  it("WorkspaceSelector is visible on Query tab", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RagPage />, { initialEntries: ["/rag"] });

    await user.click(screen.getByRole("tab", { name: /query/i }));

    expect(
      screen.getByLabelText(/workspace|working.?dir/i),
    ).toBeInTheDocument();
  });
});
