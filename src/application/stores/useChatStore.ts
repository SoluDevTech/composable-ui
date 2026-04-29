import { create } from "zustand";
import type { StreamEvent } from "@/domain/entities/chat/streamEvent";

interface ChatState {
  activeThreadId: string | null;
  streamingContent: string;
  streamingThinking: string;
  structuredResponse: unknown | null;
  isStreaming: boolean;
  pendingUserMessage: string | null;
  useStreaming: boolean;
  error: string | null;
  setActiveThread: (id: string | null) => void;
  appendStreamEvent: (event: StreamEvent) => void;
  clearStream: () => void;
  setStreaming: (streaming: boolean) => void;
  setPendingUserMessage: (msg: string | null) => void;
  setError: (msg: string | null) => void;
  toggleStreaming: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeThreadId: null,
  streamingContent: "",
  streamingThinking: "",
  structuredResponse: null,
  isStreaming: false,
  pendingUserMessage: null,
  useStreaming: true,
  error: null,
  setActiveThread: (id) => set({ activeThreadId: id }),
  appendStreamEvent: (ev: StreamEvent) =>
    set((state) => {
      if (!ev.type || typeof ev.data !== "string") {
        console.warn("[ChatStore] Invalid stream event:", ev);
        return state;
      }
      switch (ev.type) {
        case "thinking":
          return { streamingThinking: state.streamingThinking + ev.data };
        case "content":
          return { streamingContent: state.streamingContent + ev.data };
        case "message":
          try {
            const msg = JSON.parse(ev.data);
            return { structuredResponse: msg.structured_response ?? null };
          } catch (e) {
            console.warn(
              "[ChatStore] Failed to parse message event data:",
              ev.data,
              e,
            );
            return state;
          }
        default:
          return state;
      }
    }),
  clearStream: () =>
    set({
      streamingContent: "",
      streamingThinking: "",
      structuredResponse: null,
      isStreaming: false,
      pendingUserMessage: null,
      error: null,
    }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setPendingUserMessage: (msg) => set({ pendingUserMessage: msg }),
  setError: (msg) => set({ error: msg }),
  toggleStreaming: () =>
    set((state) => ({ useStreaming: !state.useStreaming })),
}));
