import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useStreamChat } from "@/application/hooks/chat/useStreamChat";
import { chatApi } from "@/infrastructure/api/chat/chatApi";
import { useChatStore } from "@/application/stores/useChatStore";
import { createTraceEvent } from "../../../../fixtures/external";
import { TraceEventType } from "@/domain/entities/chat/traceEvent";
import type { ReactNode } from "react";

vi.mock("@/infrastructure/api/chat/chatApi", () => ({
  chatApi: {
    streamMessage: vi.fn(),
    getThreadHistory: vi.fn(),
    sendMessage: vi.fn(),
    createThread: vi.fn(),
    listThreads: vi.fn(),
    getThread: vi.fn(),
    deleteThread: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

interface CapturedCallbacks {
  onEvent: (e: unknown) => void;
  onComplete: () => void;
  onError: (e: Error) => void;
}

function captureStreamCallbacks(): CapturedCallbacks {
  const captured: CapturedCallbacks = {
    onEvent: vi.fn(),
    onComplete: vi.fn(),
    onError: vi.fn(),
  };
  vi.mocked(chatApi.streamMessage).mockImplementation(
    (
      _threadId: string,
      _request: unknown,
      onEvent: (e: unknown) => void,
      onComplete: () => void,
      onError: (e: Error) => void,
    ) => {
      captured.onEvent = onEvent;
      captured.onComplete = onComplete;
      captured.onError = onError;
      return new AbortController();
    },
  );
  return captured;
}

describe("useStreamChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useChatStore.getState().clearStream();
    useChatStore.setState({
      activeThreadId: null,
      streamingTurn: null,
      isStreaming: false,
      pendingUserMessage: null,
      error: null,
    });
  });

  it("stream() initializes streamingTurn and calls chatApi.streamMessage with onEvent", async () => {
    captureStreamCallbacks();
    const { result } = renderHook(() => useStreamChat("thread-123"), {
      wrapper: createWrapper(),
    });

    result.current.stream({ message: "Hello" });

    expect(chatApi.streamMessage).toHaveBeenCalledTimes(1);
    expect(useChatStore.getState().isStreaming).toBe(true);
    expect(useChatStore.getState().pendingUserMessage).toBe("Hello");
    expect(useChatStore.getState().streamingTurn).not.toBeNull();
    expect(useChatStore.getState().streamingTurn?.turnId).toBeTypeOf("string");
  });

  it("onEvent forwards TraceEvent to appendTraceEvent", async () => {
    const captured = captureStreamCallbacks();
    const { result } = renderHook(() => useStreamChat("thread-123"), {
      wrapper: createWrapper(),
    });

    result.current.stream({ message: "Hi" });

    const ev = createTraceEvent({ type: TraceEventType.CONTENT, content: "chunk", source: null });
    captured.onEvent(ev);

    const turn = useChatStore.getState().streamingTurn;
    expect(turn?.events).toContain(ev);
    expect(turn?.parentContent).toBe("chunk");
  });

  it("onComplete invalidates history query and stops streaming", async () => {
    const captured = captureStreamCallbacks();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useStreamChat("thread-123"), { wrapper });

    result.current.stream({ message: "Hi" });

    captured.onComplete();

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["history", "thread-123"] });
    });
    expect(useChatStore.getState().isStreaming).toBe(false);
    expect(useChatStore.getState().pendingUserMessage).toBeNull();
  });

  it("onError sets error and stops streaming", async () => {
    const captured = captureStreamCallbacks();
    const { result } = renderHook(() => useStreamChat("thread-123"), {
      wrapper: createWrapper(),
    });

    result.current.stream({ message: "Hi" });

    captured.onError(new Error("Stream broke"));

    expect(useChatStore.getState().isStreaming).toBe(false);
    expect(useChatStore.getState().error).toBe("Stream broke");
  });

  it("cancel() aborts the in-flight controller and clears stream", async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    captureStreamCallbacks();
    const { result } = renderHook(() => useStreamChat("thread-123"), {
      wrapper: createWrapper(),
    });

    result.current.stream({ message: "Hi" });
    result.current.cancel();

    expect(abortSpy).toHaveBeenCalled();
    expect(useChatStore.getState().streamingTurn).toBeNull();
  });
});
