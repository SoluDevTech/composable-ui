import { create } from "zustand";

interface ChatState {
  activeThreadId: string | null;
  streamingContent: string;
  isStreaming: boolean;
  setActiveThread: (id: string | null) => void;
  appendStreamChunk: (chunk: string) => void;
  clearStream: () => void;
  setStreaming: (streaming: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeThreadId: null,
  streamingContent: "",
  isStreaming: false,
  setActiveThread: (id) => set({ activeThreadId: id }),
  appendStreamChunk: (chunk) =>
    set((state) => ({ streamingContent: state.streamingContent + chunk })),
  clearStream: () => set({ streamingContent: "", isStreaming: false }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
}));
