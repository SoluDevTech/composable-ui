import { screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import AppShell from "@/application/components/layout/AppShell";

vi.mock("@/application/hooks/chat/useThreads", () => ({
  useThreads: () => ({ data: undefined, isLoading: false }),
}));

vi.mock("@/application/hooks/agent/useAgents", () => ({
  useAgents: () => ({ data: undefined, isLoading: false }),
}));

vi.mock("@/application/hooks/chat/useCreateThread", () => ({
  useCreateThread: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/application/stores/useChatStore", () => {
  const fn = (selector: (state: { setActiveThread: () => void }) => unknown) =>
    selector({ setActiveThread: vi.fn() });
  fn.getState = () => ({ setActiveThread: vi.fn() });
  return { useChatStore: fn };
});

describe("AppShell", () => {
  it("renders children content", () => {
    renderWithProviders(
      <AppShell>
        <div>My Page Content</div>
      </AppShell>,
      { initialEntries: ["/chat"] },
    );

    expect(screen.getByText("My Page Content")).toBeInTheDocument();
  });

  it("renders a 'Skip to content' link targeting #main-content", () => {
    renderWithProviders(
      <AppShell>
        <div>Content</div>
      </AppShell>,
      { initialEntries: ["/chat"] },
    );

    const skipLink = screen.getByRole("link", { name: /skip to content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("skip link is sr-only by default (not visible)", () => {
    renderWithProviders(
      <AppShell>
        <div>Content</div>
      </AppShell>,
      { initialEntries: ["/chat"] },
    );

    const skipLink = screen.getByRole("link", { name: /skip to content/i });
    expect(skipLink).toHaveClass("sr-only");
  });

  it("main element has id=main-content and is focusable (tabIndex=-1)", () => {
    renderWithProviders(
      <AppShell>
        <div>Content</div>
      </AppShell>,
      { initialEntries: ["/chat"] },
    );

    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "main-content");
    expect(main).toHaveAttribute("tabindex", "-1");
  });

  it("renders the sidebar brand wordmark", () => {
    renderWithProviders(
      <AppShell>
        <div>Content</div>
      </AppShell>,
      { initialEntries: ["/chat"] },
    );

    expect(screen.getByText(/Composable/)).toBeInTheDocument();
  });
});
