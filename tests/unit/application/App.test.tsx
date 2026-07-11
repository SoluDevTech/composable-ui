import { screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../utils/render";

// Mock route components so App renders without real lazy imports.
vi.mock("@/application/pages/ChatPage", () => ({
  default: () => <div>ChatPage</div>,
}));

vi.mock("@/application/pages/AgentsPage", () => ({
  default: () => <div>AgentsPage</div>,
}));

vi.mock("@/application/pages/RagPage", () => ({
  default: () => <div>RagPage</div>,
}));

import { PageFallback } from "@/application/App";

describe("PageFallback — a11y", () => {
  it("renders with role=status", () => {
    renderWithProviders(<PageFallback />);

    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
  });

  it("has aria-live=polite for screen reader announcements", () => {
    renderWithProviders(<PageFallback />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("displays 'Loading…' text for users", () => {
    renderWithProviders(<PageFallback />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
