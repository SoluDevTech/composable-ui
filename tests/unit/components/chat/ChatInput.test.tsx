import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../../utils/render";
import ChatInput from "@/application/components/chat/ChatInput";

const mockStream = vi.fn();

vi.mock("@/application/hooks/chat/useStreamChat", () => ({
  useStreamChat: () => ({
    stream: mockStream,
    cancel: vi.fn(),
  }),
}));

vi.mock("@/application/stores/useChatStore", () => ({
  useChatStore: (selector: (state: { isStreaming: boolean }) => unknown) => {
    const state = {
      isStreaming: false,
    };
    return selector(state);
  },
}));

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
});
