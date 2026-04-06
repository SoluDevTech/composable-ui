import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import ChatInput from "@/application/components/chat/ChatInput";

const { mockStream, mockSendMessageMutate, mockStoreState } = vi.hoisted(() => {
  const mockStream = vi.fn();
  const mockSendMessageMutate = vi.fn();
  const mockStoreState = {
    isStreaming: false,
    useStreaming: false,
    toggleStreaming: vi.fn(),
    setPendingUserMessage: vi.fn(),
    setStreaming: vi.fn(),
  };
  return { mockStream, mockSendMessageMutate, mockStoreState };
});

vi.mock("@/application/hooks/chat/useStreamChat", () => ({
  useStreamChat: () => ({
    stream: mockStream,
    cancel: vi.fn(),
  }),
}));

vi.mock("@/application/hooks/chat/useSendMessage", () => ({
  useSendMessage: () => ({
    mutate: mockSendMessageMutate,
    isPending: false,
  }),
}));

vi.mock("@/application/stores/useChatStore", () => {
  const fn = (selector: (state: typeof mockStoreState) => unknown) => {
    return selector(mockStoreState);
  };
  fn.getState = () => mockStoreState;
  return { useChatStore: fn };
});

describe("ChatInput", () => {
  beforeEach(() => {
    mockStream.mockClear();
  });

  it("renders input with correct placeholder", () => {
    renderWithProviders(<ChatInput threadId="thread-1" />);

    expect(
      screen.getByPlaceholderText("Orchestrate your next move..."),
    ).toBeInTheDocument();
  });

  it("has a send button", () => {
    renderWithProviders(<ChatInput threadId="thread-1" />);

    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("clears input after submission", async () => {
    const user = userEvent.setup();

    renderWithProviders(<ChatInput threadId="thread-1" />);

    const textarea = screen.getByPlaceholderText(
      "Orchestrate your next move...",
    );
    await user.type(textarea, "Hello agent");
    await user.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });
    expect(mockSendMessageMutate).toHaveBeenCalledWith(
      { message: "Hello agent" },
      expect.any(Object),
    );
  });
});
