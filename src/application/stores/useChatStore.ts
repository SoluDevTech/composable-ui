import { create } from "zustand";

interface ChatState {
  activeThreadId: string | null;
  streamingContent: string;
  isStreaming: boolean;
  pendingUserMessage: string | null;
  useStreaming: boolean;
  setActiveThread: (id: string | null) => void;
  appendStreamChunk: (chunk: string) => void;
  clearStream: () => void;
  setStreaming: (streaming: boolean) => void;
  setPendingUserMessage: (msg: string | null) => void;
  toggleStreaming: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeThreadId: null,
  streamingContent: "",
  isStreaming: false,
  pendingUserMessage: null,
  useStreaming: false,
  setActiveThread: (id) => set({ activeThreadId: id }),
  appendStreamChunk: (chunk) =>
    set((state) => ({ streamingContent: state.streamingContent + chunk })),
  clearStream: () =>
    set({ streamingContent: "", isStreaming: false, pendingUserMessage: null }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setPendingUserMessage: (msg) => set({ pendingUserMessage: msg }),
  toggleStreaming: () =>
    set((state) => ({ useStreaming: !state.useStreaming })),
}));
