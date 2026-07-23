export enum TraceEventType {
  HUMAN_MESSAGE = "human_message",
  AI_MESSAGE = "ai_message",
  THINKING = "thinking",
  CONTENT = "content",
  TOOL_CALL = "tool_call",
  TOOL_RESULT = "tool_result",
}

export interface TraceEvent {
  id: string;
  thread_id: string;
  turn_id: string;
  type: TraceEventType;
  source: string | null;
  name: string | null;
  content: string | null;
  metadata: Record<string, unknown> | null;
  timestamp: string;
  sequence: number;
}

export interface Turn {
  turn_id: string;
  human_message: import("./message").Message | null;
  ai_message: import("./message").Message | null;
  events: TraceEvent[];
}

export interface ThreadHistory {
  thread: import("./thread").Thread;
  turns: Turn[];
}

export type StructuredResponseResult =
  | { kind: "valid"; data: unknown }
  | { kind: "missing" }
  | { kind: "malformed"; error: string };

export function getStructuredResponseFromAIEvent(ev: TraceEvent): StructuredResponseResult | null {
  if (ev.type !== TraceEventType.AI_MESSAGE) return null;
  const raw = ev.content;
  if (raw == null) return { kind: "missing" };
  try {
    const parsed = JSON.parse(raw) as { structured_response?: unknown };
    if (parsed.structured_response == null) return { kind: "missing" };
    return { kind: "valid", data: parsed.structured_response };
  } catch (e) {
    return { kind: "malformed", error: e instanceof Error ? e.message : String(e) };
  }
}
