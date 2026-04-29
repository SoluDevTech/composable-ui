import { describe, it, expect, beforeEach } from "vitest";
import { useChatStore } from "@/application/stores/useChatStore";

describe("useChatStore", () => {
  beforeEach(() => {
    useChatStore.setState({
      activeThreadId: null,
      streamingContent: "",
      streamingThinking: "",
      structuredResponse: null,
      isStreaming: false,
      pendingUserMessage: null,
      useStreaming: true,
    });
  });

  it("has pendingUserMessage=null in initial state", () => {
    const state = useChatStore.getState();
    expect(state.pendingUserMessage).toBeNull();
  });

  it("has useStreaming=true in initial state", () => {
    const state = useChatStore.getState();
    expect(state.useStreaming).toBe(true);
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

  it("toggleStreaming toggles useStreaming from true to false", () => {
    expect(useChatStore.getState().useStreaming).toBe(true);

    useChatStore.getState().toggleStreaming();

    expect(useChatStore.getState().useStreaming).toBe(false);
  });

  it("toggleStreaming toggles useStreaming from false to true", () => {
    useChatStore.setState({ useStreaming: false });

    useChatStore.getState().toggleStreaming();

    expect(useChatStore.getState().useStreaming).toBe(true);
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

  it("appendStreamEvent appends content to streamingContent", () => {
    useChatStore.getState().appendStreamEvent({ type: "content", data: "Hello " });
    useChatStore.getState().appendStreamEvent({ type: "content", data: "world" });

    expect(useChatStore.getState().streamingContent).toBe("Hello world");
  });

  it("appendStreamEvent appends thinking to streamingThinking", () => {
    useChatStore.getState().appendStreamEvent({ type: "thinking", data: "I think " });
    useChatStore.getState().appendStreamEvent({ type: "thinking", data: "this" });

    expect(useChatStore.getState().streamingThinking).toBe("I think this");
  });

  it("appendStreamEvent sets structuredResponse from message event", () => {
    const msg = { structured_response: { answer: 42 } };
    useChatStore.getState().appendStreamEvent({ type: "message", data: JSON.stringify(msg) });

    expect(useChatStore.getState().structuredResponse).toEqual({ answer: 42 });
  });

  it("appendStreamEvent ignores unknown event types", () => {
    const initial = useChatStore.getState().streamingContent;
    useChatStore.getState().appendStreamEvent({ type: "unknown" as "content", data: "x" });

    expect(useChatStore.getState().streamingContent).toBe(initial);
  });

  it("setActiveThread updates activeThreadId", () => {
    useChatStore.getState().setActiveThread("thread-42");

    expect(useChatStore.getState().activeThreadId).toBe("thread-42");
  });
});
