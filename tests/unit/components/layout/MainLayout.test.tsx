import { screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import MainLayout from "@/application/components/layout/MainLayout";
import { createThread, createAgentConfigMetadata } from "../../../fixtures/external";

const { mockThreadsData, mockAgentsData, mockCreateThreadMutate, mockSetActiveThread } = vi.hoisted(
  () => {
    return {
      mockThreadsData: {
        data: undefined as ReturnType<typeof createThread>[] | undefined,
        isLoading: false,
      },
      mockAgentsData: {
        data: undefined as ReturnType<typeof createAgentConfigMetadata>[] | undefined,
        isLoading: false,
      },
      mockCreateThreadMutate: vi.fn(),
      mockSetActiveThread: vi.fn(),
    };
  },
);

// Mock the hooks used by ThreadSidebar (child component)
vi.mock("@/application/hooks/chat/useThreads", () => ({
  useThreads: () => mockThreadsData,
}));

vi.mock("@/application/hooks/agent/useAgents", () => ({
  useAgents: () => mockAgentsData,
}));

vi.mock("@/application/hooks/chat/useCreateThread", () => ({
  useCreateThread: () => ({
    mutate: mockCreateThreadMutate,
    isPending: false,
  }),
}));

vi.mock("@/application/stores/useChatStore", () => {
  const fn = (selector: (state: { setActiveThread: typeof mockSetActiveThread }) => unknown) => {
    return selector({ setActiveThread: mockSetActiveThread });
  };
  fn.getState = () => ({ setActiveThread: mockSetActiveThread });
  return { useChatStore: fn };
});

describe("MainLayout", () => {
  it("renders children content", () => {
    renderWithProviders(
      <MainLayout>
        <div>My Page Content</div>
      </MainLayout>,
    );

    expect(screen.getByText("My Page Content")).toBeInTheDocument();
  });

  it("renders TopNav with app name", () => {
    renderWithProviders(
      <MainLayout>
        <div>Content</div>
      </MainLayout>,
    );

    expect(screen.getByText("Composables")).toBeInTheDocument();
  });

  it("shows sidebar when showSidebar is true", () => {
    mockThreadsData.data = [];

    renderWithProviders(
      <MainLayout showSidebar>
        <div>Content</div>
      </MainLayout>,
    );

    expect(screen.getByRole("button", { name: /new conversation/i })).toBeInTheDocument();
  });

  it("does not show sidebar when showSidebar is false", () => {
    renderWithProviders(
      <MainLayout showSidebar={false}>
        <div>Content</div>
      </MainLayout>,
    );

    expect(screen.queryByRole("button", { name: /new conversation/i })).not.toBeInTheDocument();
  });

  // ─── a11y: skip link ─────────────────────────────────────────────────────

  it("renders a 'Skip to content' link targeting #main-content", () => {
    renderWithProviders(
      <MainLayout>
        <div>Content</div>
      </MainLayout>,
    );

    const skipLink = screen.getByRole("link", { name: /skip to content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("skip link is sr-only by default (not visible)", () => {
    renderWithProviders(
      <MainLayout>
        <div>Content</div>
      </MainLayout>,
    );

    const skipLink = screen.getByRole("link", { name: /skip to content/i });
    expect(skipLink).toHaveClass("sr-only");
  });

  it("main element has id=main-content and is focusable (tabIndex=-1)", () => {
    renderWithProviders(
      <MainLayout>
        <div>Content</div>
      </MainLayout>,
    );

    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "main-content");
    expect(main).toHaveAttribute("tabindex", "-1");
  });
});
