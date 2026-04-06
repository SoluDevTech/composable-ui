import { useState, type FormEvent, type KeyboardEvent } from "react";
import { cn } from "@/application/lib/utils";
import { useStreamChat } from "@/application/hooks/chat/useStreamChat";
import { useChatStore } from "@/application/stores/useChatStore";

interface ChatInputProps {
  threadId: string;
}

export default function ChatInput({ threadId }: ChatInputProps) {
  const [input, setInput] = useState("");
  const { stream } = useStreamChat(threadId);
  const isStreaming = useChatStore((s) => s.isStreaming);

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    stream({ message: trimmed });
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
        Composable Agents v0.1
      </p>
    </div>
  );
}
