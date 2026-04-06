import { describe, it, expect, beforeEach } from "vitest";
import { useChatStore } from "@/application/stores/useChatStore";

describe("useChatStore", () => {
  beforeEach(() => {
    useChatStore.setState({
      activeThreadId: null,
      streamingContent: "",
      isStreaming: false,
      pendingUserMessage: null,
      useStreaming: false,
    });
  });

  it("has pendingUserMessage=null in initial state", () => {
    const state = useChatStore.getState();
    expect(state.pendingUserMessage).toBeNull();
  });

  it("has useStreaming=false in initial state", () => {
    const state = useChatStore.getState();
    expect(state.useStreaming).toBe(false);
  });

  it("setPendingUserMessage updates state", () => {
    useChatStore.getState().setPendingUserMessage("Hello world");

    expect(useChatStore.getState().pendingUserMessage).toBe("Hello world");
  });

  it("setPendingUserMessage clears with null", () => {
    useChatStore.getState().setPendingUserMessage("Some message");
    useChatStore.getState().setPendingUserMessage(null);

    expect(useChatStore.getState().pendingUserMessage).toBeNull();
  });

  it("toggleStreaming toggles useStreaming from false to true", () => {
    expect(useChatStore.getState().useStreaming).toBe(false);

    useChatStore.getState().toggleStreaming();

    expect(useChatStore.getState().useStreaming).toBe(true);
  });

  it("toggleStreaming toggles useStreaming from true to false", () => {
    useChatStore.setState({ useStreaming: true });

    useChatStore.getState().toggleStreaming();

    expect(useChatStore.getState().useStreaming).toBe(false);
  });

  it("clearStream also clears pendingUserMessage", () => {
    useChatStore.setState({
      streamingContent: "partial content",
      isStreaming: true,
      pendingUserMessage: "user typed this",
    });

    useChatStore.getState().clearStream();

    const state = useChatStore.getState();
    expect(state.streamingContent).toBe("");
    expect(state.isStreaming).toBe(false);
    expect(state.pendingUserMessage).toBeNull();
  });

  it("appendStreamChunk appends to streamingContent", () => {
    useChatStore.getState().appendStreamChunk("Hello ");
    useChatStore.getState().appendStreamChunk("world");

    expect(useChatStore.getState().streamingContent).toBe("Hello world");
  });

  it("setActiveThread updates activeThreadId", () => {
    useChatStore.getState().setActiveThread("thread-42");

    expect(useChatStore.getState().activeThreadId).toBe("thread-42");
  });
});
