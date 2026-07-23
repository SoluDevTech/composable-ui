import { create } from "zustand";
import type { TraceEvent, StructuredResponseResult } from "@/domain/entities/chat/traceEvent";
import {
  TraceEventType,
  getStructuredResponseFromAIEvent,
} from "@/domain/entities/chat/traceEvent";

interface SubagentState {
  content: string;
  thinking: string;
  toolCalls: TraceEvent[];
  toolResults: TraceEvent[];
}

interface StreamingTurn {
  turnId: string;
  events: TraceEvent[];
  parentContent: string;
  parentThinking: string;
  subagents: Record<string, SubagentState>;
  currentSource: string | null;
  structured_response: StructuredResponseResult | null;
}

interface ChatState {
  activeThreadId: string | null;
  streamingTurn: StreamingTurn | null;
  isStreaming: boolean;
  pendingUserMessage: string | null;
  error: string | null;
  setActiveThread: (id: string | null) => void;
  initStreamingTurn: (turnId: string) => void;
  appendTraceEvent: (event: TraceEvent) => void;
  clearStream: () => void;
  setStreaming: (streaming: boolean) => void;
  setPendingUserMessage: (msg: string | null) => void;
  setError: (msg: string | null) => void;
}

function emptyStreamingTurn(turnId: string): StreamingTurn {
  return {
    turnId,
    events: [],
    parentContent: "",
    parentThinking: "",
    subagents: {},
    currentSource: null,
    structured_response: null,
  };
}

export const useChatStore = create<ChatState>((set) => ({
  activeThreadId: null,
  streamingTurn: null,
  isStreaming: false,
  pendingUserMessage: null,
  error: null,
  setActiveThread: (id) => set({ activeThreadId: id }),
  initStreamingTurn: (turnId) => set({ streamingTurn: emptyStreamingTurn(turnId) }),
  appendTraceEvent: (ev) =>
    set((state) => {
      if (!state.streamingTurn) return state;
      const turn: StreamingTurn = {
        ...state.streamingTurn,
        events: [...state.streamingTurn.events, ev],
        currentSource: ev.source,
      };

      if (ev.source === null) {
        if (ev.type === TraceEventType.THINKING && ev.content) {
          turn.parentThinking = state.streamingTurn.parentThinking + ev.content;
        } else if (ev.type === TraceEventType.CONTENT && ev.content) {
          turn.parentContent = state.streamingTurn.parentContent + ev.content;
        }
      } else {
        const prev = state.streamingTurn.subagents[ev.source] ?? {
          content: "",
          thinking: "",
          toolCalls: [],
          toolResults: [],
        };
        const sub: SubagentState = { ...prev };
        if (ev.type === TraceEventType.THINKING && ev.content) {
          sub.thinking = prev.thinking + ev.content;
        } else if (ev.type === TraceEventType.CONTENT && ev.content) {
          sub.content = prev.content + ev.content;
        } else if (ev.type === TraceEventType.TOOL_CALL) {
          sub.toolCalls = [...prev.toolCalls, ev];
        } else if (ev.type === TraceEventType.TOOL_RESULT) {
          sub.toolResults = [...prev.toolResults, ev];
        }
        turn.subagents = { ...state.streamingTurn.subagents, [ev.source]: sub };
      }

      const isAiMessage = ev.type === TraceEventType.AI_MESSAGE;
      if (isAiMessage) {
        turn.structured_response = getStructuredResponseFromAIEvent(ev);
      }
      return {
        streamingTurn: turn,
        isStreaming: !isAiMessage,
      };
    }),
  clearStream: () =>
    set({
      streamingTurn: null,
      isStreaming: false,
      pendingUserMessage: null,
      error: null,
    }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setPendingUserMessage: (msg) => set({ pendingUserMessage: msg }),
  setError: (msg) => set({ error: msg }),
}));
