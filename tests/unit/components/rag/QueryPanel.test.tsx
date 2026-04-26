import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import QueryPanel from "@/application/components/rag/QueryPanel";

const { mockRagQuery, mockClassicalQuery } = vi.hoisted(() => ({
  mockRagQuery: vi.fn().mockReturnValue({
    mutate: vi.fn(),
    data: null,
    isPending: false,
    error: null,
    reset: vi.fn(),
  }),
  mockClassicalQuery: vi.fn().mockReturnValue({
    mutate: vi.fn(),
    data: null,
    isPending: false,
    error: null,
    reset: vi.fn(),
  }),
}));

vi.mock("@/application/hooks/rag/useRagQuery", () => ({
  useRagQuery: mockRagQuery,
}));

vi.mock("@/application/hooks/rag/useClassicalQuery", () => ({
  useClassicalQuery: mockClassicalQuery,
}));

describe("QueryPanel", () => {
  it("renders PipelineToggle", () => {
    renderWithProviders(
      <QueryPanel workingDir="/data" />,
    );

    expect(
      screen.getByRole("button", { name: /lightrag/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /classical/i }),
    ).toBeInTheDocument();
  });

  it("renders search textarea", () => {
    renderWithProviders(
      <QueryPanel workingDir="/data" />,
    );

    expect(
      screen.getByPlaceholderText(/ask a question|search|query/i),
    ).toBeInTheDocument();
  });

  it("renders Advanced Options collapsible", () => {
    renderWithProviders(
      <QueryPanel workingDir="/data" />,
    );

    expect(
      screen.getByRole("button", { name: /advanced options/i }),
    ).toBeInTheDocument();
  });

  it("renders search button", () => {
    renderWithProviders(
      <QueryPanel workingDir="/data" />,
    );

    expect(
      screen.getByRole("button", { name: /search/i }),
    ).toBeInTheDocument();
  });

  it("search button is disabled when workingDir is empty", () => {
    renderWithProviders(
      <QueryPanel workingDir="" />,
    );

    const searchBtn = screen.getByRole("button", { name: /search/i });
    expect(searchBtn).toBeDisabled();
  });

  it("search button is enabled when workingDir is provided and query has text", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <QueryPanel workingDir="/data" />,
    );

    const textarea = screen.getByPlaceholderText(/ask a question|search|query/i);
    await user.type(textarea, "test query");

    const searchBtn = screen.getByRole("button", { name: /search/i });
    expect(searchBtn).not.toBeDisabled();
  });
});