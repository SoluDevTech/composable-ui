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
  setActiveThread: (id: string | null) => void;
  appendStreamChunk: (chunk: string) => void;
  appendStreamThinking: (chunk: string) => void;
  setStructuredResponse: (data: unknown | null) => void;
  appendStreamEvent: (event: StreamEvent) => void;
  clearStream: () => void;
  setStreaming: (streaming: boolean) => void;
  setPendingUserMessage: (msg: string | null) => void;
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
  setActiveThread: (id) => set({ activeThreadId: id }),
  appendStreamChunk: (chunk) =>
    set((state) => ({ streamingContent: state.streamingContent + chunk })),
  appendStreamThinking: (chunk) =>
    set((state) => ({ streamingThinking: state.streamingThinking + chunk })),
  setStructuredResponse: (data) => set({ structuredResponse: data }),
  appendStreamEvent: (ev: StreamEvent) =>
    set((state) => {
      switch (ev.type) {
        case "thinking":
          return { streamingThinking: state.streamingThinking + ev.data };
        case "content":
          return { streamingContent: state.streamingContent + ev.data };
        case "message":
          try {
            const msg = JSON.parse(ev.data);
            return { structuredResponse: msg.structured_response ?? null };
          } catch {
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
    }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setPendingUserMessage: (msg) => set({ pendingUserMessage: msg }),
  toggleStreaming: () =>
    set((state) => ({ useStreaming: !state.useStreaming })),
}));
