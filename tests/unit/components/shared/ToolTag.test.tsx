import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import ToolTag from "@/application/components/shared/ToolTag";

describe("ToolTag", () => {
  it("renders the label text", () => {
    renderWithProviders(<ToolTag label="web_search" />);

    expect(screen.getByText("web_search")).toBeInTheDocument();
  });
});
