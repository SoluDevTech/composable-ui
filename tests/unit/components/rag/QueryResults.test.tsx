import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import QueryResults from "@/application/components/rag/QueryResults";

describe("QueryResults", () => {
  it("shows placeholder when data is null and not loading", () => {
    renderWithProviders(
      <QueryResults data={null} error={null} isLoading={false} onRetry={vi.fn()} />,
    );

    expect(screen.getByText(/run a query/i)).toBeInTheDocument();
  });

  it("shows spinner when isLoading", () => {
    renderWithProviders(
      <QueryResults data={null} error={null} isLoading={true} onRetry={vi.fn()} />,
    );

    expect(screen.getByTestId("query-results-spinner")).toBeInTheDocument();
  });

  it("shows formatted JSON when data is present", () => {
    const mockData = { answer: "test", context: ["doc1"] };

    renderWithProviders(
      <QueryResults data={mockData} error={null} isLoading={false} onRetry={vi.fn()} />,
    );

    expect(screen.getByText(/"answer"/)).toBeInTheDocument();
    expect(screen.getByText(/"test"/)).toBeInTheDocument();
  });

  it("shows copy button when data is present", () => {
    const mockData = { answer: "hello" };

    renderWithProviders(
      <QueryResults data={mockData} error={null} isLoading={false} onRetry={vi.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: /copy/i }),
    ).toBeInTheDocument();
  });

  it("does not show copy button when data is null", () => {
    renderWithProviders(
      <QueryResults data={null} error={null} isLoading={false} onRetry={vi.fn()} />,
    );

    expect(
      screen.queryByRole("button", { name: /copy/i }),
    ).not.toBeInTheDocument();
  });

  it("shows error message with retry button when error is present", () => {
    const error = new Error("Query failed");

    renderWithProviders(
      <QueryResults data={null} error={error} isLoading={false} onRetry={vi.fn()} />,
    );

    expect(screen.getByText("Query failed")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /retry/i }),
    ).toBeInTheDocument();
  });

  it("clicking retry button calls onRetry", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const error = new Error("Query failed");

    renderWithProviders(
      <QueryResults data={null} error={error} isLoading={false} onRetry={onRetry} />,
    );

    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});