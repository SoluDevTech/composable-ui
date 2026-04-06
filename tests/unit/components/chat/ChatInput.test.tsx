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
    useStreaming: true,
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
    expect(mockStream).toHaveBeenCalledWith({ message: "Hello agent" });
  });

  it("submits on Enter key (without Shift)", async () => {
    const user = userEvent.setup();

    renderWithProviders(<ChatInput threadId="thread-1" />);

    const textarea = screen.getByPlaceholderText(
      "Orchestrate your next move...",
    );
    await user.type(textarea, "Enter message");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });
    expect(mockStream).toHaveBeenCalledWith({ message: "Enter message" });
  });

  it("does not submit on Shift+Enter", async () => {
    const user = userEvent.setup();

    renderWithProviders(<ChatInput threadId="thread-1" />);

    const textarea = screen.getByPlaceholderText(
      "Orchestrate your next move...",
    );
    await user.type(textarea, "Line 1");
    await user.keyboard("{Shift>}{Enter}{/Shift}");

    expect(mockStream).not.toHaveBeenCalled();
  });

  it("does not submit when input is empty", async () => {
    const user = userEvent.setup();

    renderWithProviders(<ChatInput threadId="thread-1" />);

    const submitButton = screen.getByRole("button", { name: /send/i });
    expect(submitButton).toBeDisabled();
  });

  it("uses sendMessage.mutate in standard mode (non-streaming)", async () => {
    mockStoreState.useStreaming = false;
    const user = userEvent.setup();

    renderWithProviders(<ChatInput threadId="thread-1" />);

    const textarea = screen.getByPlaceholderText(
      "Orchestrate your next move...",
    );
    await user.type(textarea, "Standard message");
    await user.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });
    expect(mockSendMessageMutate).toHaveBeenCalledWith(
      { message: "Standard message" },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );

    // Restore
    mockStoreState.useStreaming = true;
  });

  it("disables textarea when isStreaming is true", () => {
    mockStoreState.isStreaming = true;

    renderWithProviders(<ChatInput threadId="thread-1" />);

    const textarea = screen.getByPlaceholderText(
      "Orchestrate your next move...",
    );
    expect(textarea).toBeDisabled();

    mockStoreState.isStreaming = false;
  });

  it("renders version text", () => {
    renderWithProviders(<ChatInput threadId="thread-1" />);

    expect(screen.getByText("Composables v0.1")).toBeInTheDocument();
  });
});
