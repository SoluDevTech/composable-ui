import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/application/lib/utils";
import { useStreamChat } from "@/application/hooks/chat/useStreamChat";
import { useSendMessage } from "@/application/hooks/chat/useSendMessage";
import { useChatStore } from "@/application/stores/useChatStore";

interface ChatInputProps {
  threadId: string;
}

export default function ChatInput({ threadId }: ChatInputProps) {
  const [input, setInput] = useState("");
  const { stream } = useStreamChat(threadId);
  const sendMessage = useSendMessage(threadId);
  const queryClient = useQueryClient();
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamingMode = useChatStore((s) => s.useStreaming);
  const toggleStreaming = useChatStore((s) => s.toggleStreaming);

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    if (streamingMode) {
      stream({ message: trimmed });
    } else {
      useChatStore.getState().setPendingUserMessage(trimmed);
      useChatStore.getState().setStreaming(true);
      sendMessage.mutate(
        { message: trimmed },
        {
          onSuccess: () => {
            useChatStore.getState().setPendingUserMessage(null);
            useChatStore.getState().setStreaming(false);
            queryClient.invalidateQueries({
              queryKey: ["messages", threadId],
            });
          },
          onError: () => {
            useChatStore.getState().setPendingUserMessage(null);
            useChatStore.getState().setStreaming(false);
          },
        },
      );
    }
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="p-6 md:p-8 lg:px-24 xl:px-48">
      <form onSubmit={handleSubmit}>
        <div className="glass-panel rounded-full border border-outline-variant/30 ambient-shadow flex items-center gap-3 px-6 py-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Orchestrate your next move..."
            disabled={isStreaming}
            rows={1}
            className={cn(
              "flex-1 bg-transparent text-on-surface text-sm resize-none outline-none placeholder:text-outline",
              "disabled:opacity-50",
            )}
          />
          <button
            type="button"
            onClick={toggleStreaming}
            title={streamingMode ? "Streaming mode" : "Standard mode"}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors text-xs",
              streamingMode
                ? "bg-secondary-brand/10 text-secondary-brand"
                : "bg-surface-container text-outline",
            )}
          >
            <span className="material-symbols-outlined text-base">
              {streamingMode ? "stream" : "chat"}
            </span>
          </button>
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200",
              input.trim() && !isStreaming
                ? "bg-secondary-brand text-white hover:opacity-90"
                : "bg-surface-container text-outline",
            )}
          >
            <span className="material-symbols-outlined text-lg">
              {isStreaming ? "stop" : "send"}
            </span>
          </button>
        </div>
      </form>
      <p className="text-center text-[11px] text-outline mt-3 font-headline tracking-wide">
        Composables v0.1
      </p>
    </div>
  );
}
