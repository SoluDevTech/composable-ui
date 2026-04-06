import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import ThreadSidebar from "@/application/components/layout/ThreadSidebar";
import {
  createThread,
  createAgentConfigMetadata,
} from "../../../fixtures/external";

const {
  mockThreadsData,
  mockAgentsData,
  mockCreateThreadMutate,
  mockSetActiveThread,
} = vi.hoisted(() => {
  return {
    mockThreadsData: {
      data: undefined as ReturnType<typeof createThread>[] | undefined,
      isLoading: false,
    },
    mockAgentsData: {
      data: undefined as
        | ReturnType<typeof createAgentConfigMetadata>[]
        | undefined,
      isLoading: false,
    },
    mockCreateThreadMutate: vi.fn(),
    mockSetActiveThread: vi.fn(),
  };
});

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
  const fn = (
    selector: (state: {
      setActiveThread: typeof mockSetActiveThread;
    }) => unknown,
  ) => {
    return selector({ setActiveThread: mockSetActiveThread });
  };
  fn.getState = () => ({ setActiveThread: mockSetActiveThread });
  return { useChatStore: fn };
});

describe("ThreadSidebar", () => {
  beforeEach(() => {
    mockThreadsData.data = undefined;
    mockThreadsData.isLoading = false;
    mockAgentsData.data = undefined;
    mockAgentsData.isLoading = false;
    mockCreateThreadMutate.mockClear();
    mockSetActiveThread.mockClear();
  });

  it("renders 'New Conversation' button", () => {
    renderWithProviders(<ThreadSidebar />);

    expect(
      screen.getByRole("button", { name: /new conversation/i }),
    ).toBeInTheDocument();
  });

  it("clicking 'New Conversation' shows agent selection dialog", async () => {
    mockAgentsData.data = [
      createAgentConfigMetadata({ name: "agent-alpha", model: "gpt-4" }),
    ];
    const user = userEvent.setup();

    renderWithProviders(<ThreadSidebar />);
    await user.click(screen.getByRole("button", { name: /new conversation/i }));

    expect(screen.getByText("Choose an Agent")).toBeInTheDocument();
  });

  it("agent list shows available agents in the dialog", async () => {
    mockAgentsData.data = [
      createAgentConfigMetadata({ name: "agent-alpha", model: "gpt-4" }),
      createAgentConfigMetadata({ name: "agent-beta", model: "claude-sonnet" }),
    ];
    const user = userEvent.setup();

    renderWithProviders(<ThreadSidebar />);
    await user.click(screen.getByRole("button", { name: /new conversation/i }));

    expect(screen.getByText("agent-alpha")).toBeInTheDocument();
    expect(screen.getByText("gpt-4")).toBeInTheDocument();
    expect(screen.getByText("agent-beta")).toBeInTheDocument();
    expect(screen.getByText("claude-sonnet")).toBeInTheDocument();
  });

  it("selecting an agent calls createThread with the agent name", async () => {
    mockAgentsData.data = [
      createAgentConfigMetadata({ name: "agent-alpha", model: "gpt-4" }),
    ];
    const user = userEvent.setup();

    renderWithProviders(<ThreadSidebar />);
    await user.click(screen.getByRole("button", { name: /new conversation/i }));
    await user.click(screen.getByText("agent-alpha"));

    expect(mockCreateThreadMutate).toHaveBeenCalledWith(
      "agent-alpha",
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("shows 'No conversations yet' when threads list is empty", () => {
    mockThreadsData.data = [];

    renderWithProviders(<ThreadSidebar />);

    expect(screen.getByText("No conversations yet")).toBeInTheDocument();
  });

  it("renders thread list grouped by agent name", () => {
    mockThreadsData.data = [
      createThread({ id: "t-1", agent_name: "agent-alpha" }),
      createThread({ id: "t-2", agent_name: "agent-beta" }),
    ];

    renderWithProviders(<ThreadSidebar />);

    expect(screen.getByText("agent-alpha")).toBeInTheDocument();
    expect(screen.getByText("agent-beta")).toBeInTheDocument();
  });

  it("shows loading text while threads are loading", () => {
    mockThreadsData.isLoading = true;

    renderWithProviders(<ThreadSidebar />);

    expect(screen.getByText("Loading threads...")).toBeInTheDocument();
  });

  it("shows loading text while agents are loading in the dialog", async () => {
    mockAgentsData.isLoading = true;
    const user = userEvent.setup();

    renderWithProviders(<ThreadSidebar />);
    await user.click(screen.getByRole("button", { name: /new conversation/i }));

    expect(screen.getByText("Loading agents...")).toBeInTheDocument();
  });
});
