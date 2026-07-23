import { describe, it, expect, beforeEach } from "vitest";
import { useChatStore } from "@/application/stores/useChatStore";
import { TraceEventType } from "@/domain/entities/chat/traceEvent";
import { createTraceEvent } from "../../../fixtures/external";

describe("useChatStore", () => {
  beforeEach(() => {
    useChatStore.getState().clearStream();
    useChatStore.setState({
      activeThreadId: null,
      streamingTurn: null,
      isStreaming: false,
      pendingUserMessage: null,
      error: null,
    });
  });

  describe("initial state", () => {
    it("has null activeThreadId, streamingTurn, pendingUserMessage and error", () => {
      const s = useChatStore.getState();
      expect(s.activeThreadId).toBeNull();
      expect(s.streamingTurn).toBeNull();
      expect(s.isStreaming).toBe(false);
      expect(s.pendingUserMessage).toBeNull();
      expect(s.error).toBeNull();
    });
  });

  describe("setActiveThread", () => {
    it("updates activeThreadId", () => {
      useChatStore.getState().setActiveThread("thread-42");
      expect(useChatStore.getState().activeThreadId).toBe("thread-42");
    });
  });

  describe("setStreaming", () => {
    it("toggles isStreaming flag", () => {
      useChatStore.getState().setStreaming(true);
      expect(useChatStore.getState().isStreaming).toBe(true);
      useChatStore.getState().setStreaming(false);
      expect(useChatStore.getState().isStreaming).toBe(false);
    });
  });

  describe("setPendingUserMessage", () => {
    it("stores then clears the pending user message", () => {
      useChatStore.getState().setPendingUserMessage("Hello");
      expect(useChatStore.getState().pendingUserMessage).toBe("Hello");
      useChatStore.getState().setPendingUserMessage(null);
      expect(useChatStore.getState().pendingUserMessage).toBeNull();
    });
  });

  describe("setError", () => {
    it("stores then clears the error message", () => {
      useChatStore.getState().setError("Boom");
      expect(useChatStore.getState().error).toBe("Boom");
      useChatStore.getState().setError(null);
      expect(useChatStore.getState().error).toBeNull();
    });
  });

  describe("appendTraceEvent", () => {
    it("is a no-op when streamingTurn is null", () => {
      useChatStore.getState().appendTraceEvent(createTraceEvent());
      expect(useChatStore.getState().streamingTurn).toBeNull();
    });

    it("appends event to streamingTurn.events", () => {
      useChatStore.getState().setActiveThread("thread-1");
      useChatStore.setState({
        isStreaming: true,
        streamingTurn: {
          turnId: "turn-1",
          events: [],
          parentContent: "",
          parentThinking: "",
          subagents: {},
          currentSource: null,
        },
      });
      const ev = createTraceEvent({ type: TraceEventType.CONTENT, content: "Hi", source: null });
      useChatStore.getState().appendTraceEvent(ev);

      const turn = useChatStore.getState().streamingTurn;
      expect(turn).not.toBeNull();
      expect(turn?.events).toHaveLength(1);
      expect(turn?.events[0]).toBe(ev);
    });

    it("accumulates parent thinking when source is null", () => {
      useChatStore.setState({
        isStreaming: true,
        streamingTurn: {
          turnId: "turn-1",
          events: [],
          parentContent: "",
          parentThinking: "",
          subagents: {},
          currentSource: null,
        },
      });
      useChatStore
        .getState()
        .appendTraceEvent(
          createTraceEvent({ type: TraceEventType.THINKING, content: "I think ", source: null }),
        );
      useChatStore
        .getState()
        .appendTraceEvent(
          createTraceEvent({ type: TraceEventType.THINKING, content: "this", source: null }),
        );
      expect(useChatStore.getState().streamingTurn?.parentThinking).toBe("I think this");
    });

    it("accumulates parent content when source is null", () => {
      useChatStore.setState({
        isStreaming: true,
        streamingTurn: {
          turnId: "turn-1",
          events: [],
          parentContent: "",
          parentThinking: "",
          subagents: {},
          currentSource: null,
        },
      });
      useChatStore
        .getState()
        .appendTraceEvent(
          createTraceEvent({ type: TraceEventType.CONTENT, content: "Hello ", source: null }),
        );
      useChatStore
        .getState()
        .appendTraceEvent(
          createTraceEvent({ type: TraceEventType.CONTENT, content: "world", source: null }),
        );
      expect(useChatStore.getState().streamingTurn?.parentContent).toBe("Hello world");
    });

    it("accumulates thinking in subagent slot when source is set", () => {
      useChatStore.setState({
        isStreaming: true,
        streamingTurn: {
          turnId: "turn-1",
          events: [],
          parentContent: "",
          parentThinking: "",
          subagents: {},
          currentSource: null,
        },
      });
      useChatStore.getState().appendTraceEvent(
        createTraceEvent({
          type: TraceEventType.THINKING,
          content: "Sub thinks ",
          source: "subagent-a",
        }),
      );
      useChatStore.getState().appendTraceEvent(
        createTraceEvent({
          type: TraceEventType.THINKING,
          content: "deeply",
          source: "subagent-a",
        }),
      );
      expect(useChatStore.getState().streamingTurn?.subagents["subagent-a"].thinking).toBe(
        "Sub thinks deeply",
      );
    });

    it("accumulates content in subagent slot when source is set", () => {
      useChatStore.setState({
        isStreaming: true,
        streamingTurn: {
          turnId: "turn-1",
          events: [],
          parentContent: "",
          parentThinking: "",
          subagents: {},
          currentSource: null,
        },
      });
      useChatStore.getState().appendTraceEvent(
        createTraceEvent({
          type: TraceEventType.CONTENT,
          content: "Sub result",
          source: "subagent-a",
        }),
      );
      expect(useChatStore.getState().streamingTurn?.subagents["subagent-a"].content).toBe(
        "Sub result",
      );
    });

    it("pushes TOOL_CALL events into subagent.toolCalls", () => {
      useChatStore.setState({
        isStreaming: true,
        streamingTurn: {
          turnId: "turn-1",
          events: [],
          parentContent: "",
          parentThinking: "",
          subagents: {},
          currentSource: null,
        },
      });
      const call = createTraceEvent({
        type: TraceEventType.TOOL_CALL,
        name: "search",
        source: "subagent-a",
      });
      useChatStore.getState().appendTraceEvent(call);
      expect(useChatStore.getState().streamingTurn?.subagents["subagent-a"].toolCalls).toEqual([
        call,
      ]);
    });

    it("pushes TOOL_RESULT events into subagent.toolResults", () => {
      useChatStore.setState({
        isStreaming: true,
        streamingTurn: {
          turnId: "turn-1",
          events: [],
          parentContent: "",
          parentThinking: "",
          subagents: {},
          currentSource: null,
        },
      });
      const result = createTraceEvent({
        type: TraceEventType.TOOL_RESULT,
        content: "ok",
        source: "subagent-a",
      });
      useChatStore.getState().appendTraceEvent(result);
      expect(useChatStore.getState().streamingTurn?.subagents["subagent-a"].toolResults).toEqual([
        result,
      ]);
    });

    it("updates currentSource to the last event source", () => {
      useChatStore.setState({
        isStreaming: true,
        streamingTurn: {
          turnId: "turn-1",
          events: [],
          parentContent: "",
          parentThinking: "",
          subagents: {},
          currentSource: null,
        },
      });
      useChatStore
        .getState()
        .appendTraceEvent(createTraceEvent({ type: TraceEventType.CONTENT, source: "subagent-a" }));
      expect(useChatStore.getState().streamingTurn?.currentSource).toBe("subagent-a");
    });

    it("sets isStreaming to false when AI_MESSAGE event arrives", () => {
      useChatStore.setState({
        isStreaming: true,
        streamingTurn: {
          turnId: "turn-1",
          events: [],
          parentContent: "",
          parentThinking: "",
          subagents: {},
          currentSource: null,
        },
      });
      useChatStore
        .getState()
        .appendTraceEvent(createTraceEvent({ type: TraceEventType.AI_MESSAGE, source: null }));
      expect(useChatStore.getState().isStreaming).toBe(false);
    });

    it("stores structured_response {kind:'valid'} when AI_MESSAGE content has structured_response", () => {
      useChatStore.setState({
        isStreaming: true,
        streamingTurn: {
          turnId: "turn-1",
          events: [],
          parentContent: "",
          parentThinking: "",
          subagents: {},
          currentSource: null,
          structured_response: null,
        },
      });
      const ev = createTraceEvent({
        type: TraceEventType.AI_MESSAGE,
        source: null,
        content: JSON.stringify({
          role: "ai",
          content: "answer",
          structured_response: { answer: 42 },
        }),
      });
      useChatStore.getState().appendTraceEvent(ev);
      const turn = useChatStore.getState().streamingTurn;
      expect(turn?.structured_response).toEqual({ kind: "valid", data: { answer: 42 } });
    });

    it("stores structured_response {kind:'missing'} when AI_MESSAGE content has no structured_response", () => {
      useChatStore.setState({
        isStreaming: true,
        streamingTurn: {
          turnId: "turn-1",
          events: [],
          parentContent: "",
          parentThinking: "",
          subagents: {},
          currentSource: null,
          structured_response: null,
        },
      });
      const ev = createTraceEvent({
        type: TraceEventType.AI_MESSAGE,
        source: null,
        content: JSON.stringify({ role: "ai", content: "answer" }),
      });
      useChatStore.getState().appendTraceEvent(ev);
      const turn = useChatStore.getState().streamingTurn;
      expect(turn?.structured_response).toEqual({ kind: "missing" });
    });

    it("stores structured_response {kind:'malformed'} when AI_MESSAGE content is not JSON", () => {
      useChatStore.setState({
        isStreaming: true,
        streamingTurn: {
          turnId: "turn-1",
          events: [],
          parentContent: "",
          parentThinking: "",
          subagents: {},
          currentSource: null,
          structured_response: null,
        },
      });
      const ev = createTraceEvent({
        type: TraceEventType.AI_MESSAGE,
        source: null,
        content: "not-json{",
      });
      useChatStore.getState().appendTraceEvent(ev);
      const turn = useChatStore.getState().streamingTurn;
      expect(turn?.structured_response?.kind).toBe("malformed");
    });

    it("keeps structured_response null for non-AI_MESSAGE events", () => {
      useChatStore.setState({
        isStreaming: true,
        streamingTurn: {
          turnId: "turn-1",
          events: [],
          parentContent: "",
          parentThinking: "",
          subagents: {},
          currentSource: null,
          structured_response: null,
        },
      });
      useChatStore
        .getState()
        .appendTraceEvent(
          createTraceEvent({ type: TraceEventType.CONTENT, content: "hi", source: null }),
        );
      const turn = useChatStore.getState().streamingTurn;
      expect(turn?.structured_response).toBeNull();
    });
  });

  describe("clearStream", () => {
    it("resets streamingTurn, isStreaming, pendingUserMessage and error", () => {
      useChatStore.setState({
        streamingTurn: {
          turnId: "x",
          events: [],
          parentContent: "x",
          parentThinking: "x",
          subagents: {},
          currentSource: null,
          structured_response: null,
        },
        isStreaming: true,
        pendingUserMessage: "pending",
        error: "err",
      });

      useChatStore.getState().clearStream();

      const s = useChatStore.getState();
      expect(s.streamingTurn).toBeNull();
      expect(s.isStreaming).toBe(false);
      expect(s.pendingUserMessage).toBeNull();
      expect(s.error).toBeNull();
    });
  });
});
