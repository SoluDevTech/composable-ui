import { useState, useRef, type KeyboardEvent } from "react";
import { Send, Square } from "lucide-react";
import { Button } from "@/application/components/ui/button";
import { cn } from "@/application/lib/utils";
import { useStreamChat } from "@/application/hooks/chat/useStreamChat";
import { useChatStore } from "@/application/stores/useChatStore";

interface ChatInputProps {
  threadId: string;
}

export default function ChatInput({ threadId }: Readonly<ChatInputProps>) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { stream } = useStreamChat(threadId);
  const isStreaming = useChatStore((s) => s.isStreaming);

  function handleSubmit(e?: { preventDefault: () => void }) {
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

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  const canSend = input.trim().length > 0 && !isStreaming;

  return (
    <div className="shrink-0 border-t border-border bg-surface p-4" data-od-id="chat-input">
      <form onSubmit={handleSubmit}>
        <div className="flex items-end gap-2 border border-border bg-surface-warm p-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Orchestrate your next move..."
            disabled={isStreaming}
            rows={1}
            aria-label="Chat message input"
            className="flex-1 resize-none border-0 bg-transparent px-1 py-1 text-sm text-fg placeholder:text-muted focus:outline-none focus-visible:shadow-none disabled:opacity-50"
          />
          <div className="flex items-center gap-1">
            <Button
              type="submit"
              variant="default"
              size="icon"
              disabled={!canSend}
              aria-label="Send"
              className={cn(isStreaming && "btn-pulse")}
            >
              {isStreaming ? (
                <Square className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </form>
      <p className="mt-2 text-center font-mono text-xs text-muted">
        <span>Composables v0.1</span>
        <span aria-hidden="true"> · Enter to send · Shift+Enter for newline</span>
      </p>
    </div>
  );
}
