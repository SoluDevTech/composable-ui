import { describe, it, expect } from "vitest";
import {
  TraceEventType,
  type TraceEvent,
  getStructuredResponseFromAIEvent,
} from "@/domain/entities/chat/traceEvent";
import { createTraceEvent, createTurn, createThreadHistory } from "../../../../fixtures/external";

describe("TraceEventType", () => {
  it("exposes the backend event types", () => {
    expect(TraceEventType.HUMAN_MESSAGE).toBe("human_message");
    expect(TraceEventType.AI_MESSAGE).toBe("ai_message");
    expect(TraceEventType.THINKING).toBe("thinking");
    expect(TraceEventType.CONTENT).toBe("content");
    expect(TraceEventType.TOOL_CALL).toBe("tool_call");
    expect(TraceEventType.TOOL_RESULT).toBe("tool_result");
  });

  // ─── HITL refactor: new HITL_DECISION event type ─────────────────────────
  // Contract: a new enum member `HITL_DECISION = "hitl_decision"` is added so
  // that chatApi's `Object.values(TraceEventType)`-driven VALID_EVENT_TYPES
  // accepts HITL decision trace events streamed from the backend.
  it("exposes the HITL_DECISION event type", () => {
    expect(TraceEventType.HITL_DECISION).toBe("hitl_decision");
  });

  it("has exactly seven enum members", () => {
    expect(Object.keys(TraceEventType)).toHaveLength(7);
  });
});

describe("TraceEvent fixture", () => {
  it("creates a valid TraceEvent with required fields", () => {
    const ev = createTraceEvent();
    expect(ev.id).toBeTypeOf("string");
    expect(ev.thread_id).toBeTypeOf("string");
    expect(ev.turn_id).toBeTypeOf("string");
    expect(ev.timestamp).toBeTypeOf("string");
    expect(ev.sequence).toBeTypeOf("number");
    expect(Object.values(TraceEventType)).toContain(ev.type);
  });

  it("allows overriding type to THINKING with source null (parent)", () => {
    const ev = createTraceEvent({ type: TraceEventType.THINKING, source: null });
    expect(ev.type).toBe(TraceEventType.THINKING);
    expect(ev.source).toBeNull();
  });

  it("allows overriding source to a subagent name", () => {
    const ev = createTraceEvent({ source: "security-auditor" });
    expect(ev.source).toBe("security-auditor");
  });
});

describe("Turn fixture", () => {
  it("creates a Turn with human_message, ai_message and events", () => {
    const turn = createTurn();
    expect(turn.turn_id).toBeTypeOf("string");
    expect(Array.isArray(turn.events)).toBe(true);
  });

  it("allows overriding events with intermediate trace events", () => {
    const thinking = createTraceEvent({ type: TraceEventType.THINKING });
    const content = createTraceEvent({ type: TraceEventType.CONTENT });
    const turn = createTurn({ events: [thinking, content] });
    expect(turn.events).toHaveLength(2);
    expect(turn.events[0].type).toBe(TraceEventType.THINKING);
  });
});

describe("ThreadHistory fixture", () => {
  it("creates a ThreadHistory with thread and turns", () => {
    const history = createThreadHistory();
    expect(history.thread).toBeDefined();
    expect(Array.isArray(history.turns)).toBe(true);
  });

  it("allows overriding turns", () => {
    const turn = createTurn();
    const history = createThreadHistory({ turns: [turn] });
    expect(history.turns).toHaveLength(1);
    expect(history.turns[0].turn_id).toBe(turn.turn_id);
  });
});

describe("Message turn_id field", () => {
  it("TraceEvent shape is compatible with a discriminated union by type", () => {
    const ev: TraceEvent = createTraceEvent({ type: TraceEventType.TOOL_CALL });
    const byType: Record<TraceEventType, TraceEvent> = {
      [TraceEventType.HUMAN_MESSAGE]: ev,
      [TraceEventType.AI_MESSAGE]: ev,
      [TraceEventType.THINKING]: ev,
      [TraceEventType.CONTENT]: ev,
      [TraceEventType.TOOL_CALL]: ev,
      [TraceEventType.TOOL_RESULT]: ev,
      [TraceEventType.HITL_DECISION]: ev,
    };
    expect(byType[TraceEventType.TOOL_CALL]).toBe(ev);
  });
});

describe("getStructuredResponseFromAIEvent", () => {
  it("returns null for non-AI_MESSAGE events", () => {
    const ev = createTraceEvent({ type: TraceEventType.HUMAN_MESSAGE, content: "hi" });
    expect(getStructuredResponseFromAIEvent(ev)).toBeNull();
  });

  it("returns {kind:'valid', data} when content JSON contains structured_response", () => {
    const ev = createTraceEvent({
      type: TraceEventType.AI_MESSAGE,
      content: JSON.stringify({
        role: "ai",
        content: "answer",
        structured_response: { foo: "bar" },
      }),
    });
    const result = getStructuredResponseFromAIEvent(ev);
    expect(result).toEqual({ kind: "valid", data: { foo: "bar" } });
  });

  it("returns {kind:'missing'} when content JSON has no structured_response key", () => {
    const ev = createTraceEvent({
      type: TraceEventType.AI_MESSAGE,
      content: JSON.stringify({ role: "ai", content: "answer" }),
    });
    expect(getStructuredResponseFromAIEvent(ev)).toEqual({ kind: "missing" });
  });

  it("returns {kind:'malformed', error} when content is not valid JSON", () => {
    const ev = createTraceEvent({
      type: TraceEventType.AI_MESSAGE,
      content: "not valid json{",
    });
    const result = getStructuredResponseFromAIEvent(ev);
    expect(result?.kind).toBe("malformed");
    expect(typeof (result as { error: string }).error).toBe("string");
    expect((result as { error: string }).error.length).toBeGreaterThan(0);
  });

  it("returns {kind:'missing'} when content is null", () => {
    const ev = createTraceEvent({
      type: TraceEventType.AI_MESSAGE,
      content: null,
    });
    expect(getStructuredResponseFromAIEvent(ev)).toEqual({ kind: "missing" });
  });

  it("returns {kind:'missing'} when structured_response is explicitly null in content", () => {
    const ev = createTraceEvent({
      type: TraceEventType.AI_MESSAGE,
      content: JSON.stringify({ structured_response: null, content: "x" }),
    });
    expect(getStructuredResponseFromAIEvent(ev)).toEqual({ kind: "missing" });
  });
});
