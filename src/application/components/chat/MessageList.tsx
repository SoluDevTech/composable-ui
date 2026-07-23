import { useDeferredValue, useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessagesSquare } from "lucide-react";
import { useThreadHistory } from "@/application/hooks/chat/useThreadHistory";
import { useChatStore } from "@/application/stores/useChatStore";
import { MessageRole, type Message } from "@/domain/entities/chat/message";
import type { TraceEvent, Turn } from "@/domain/entities/chat/traceEvent";
import { TraceEventType } from "@/domain/entities/chat/traceEvent";
import ChatMessage from "@/application/components/chat/ChatMessage";
import ThinkingBlock from "@/application/components/chat/ThinkingBlock";
import ToolCallBadge from "@/application/components/chat/ToolCallBadge";
import ToolResultBlock from "@/application/components/chat/ToolResultBlock";
import SubagentPanel from "@/application/components/chat/SubagentPanel";
import StructuredResponseLive from "@/application/components/chat/StructuredResponseLive";
import { MARKDOWN_PROSE_CLASSES } from "@/application/components/chat/markdownStyles";

interface MessageListProps {
  threadId: string;
  agentName: string;
  agentHasResponseFormat?: boolean;
}

interface SubagentRuntime {
  name: string;
  content: string;
  thinking: string;
  toolCalls: TraceEvent[];
  toolResults: TraceEvent[];
}

function buildStreamingSubagents(events: TraceEvent[]): SubagentRuntime[] {
  const bySource = new Map<string, SubagentRuntime>();
  const order: string[] = [];
  for (const ev of events) {
    if (ev.source === null) continue;
    let entry = bySource.get(ev.source);
    if (!entry) {
      entry = { name: ev.source, content: "", thinking: "", toolCalls: [], toolResults: [] };
      bySource.set(ev.source, entry);
      order.push(ev.source);
    }
    if (ev.type === TraceEventType.THINKING && ev.content) {
      entry.thinking += ev.content;
    } else if (ev.type === TraceEventType.CONTENT && ev.content) {
      entry.content += ev.content;
    } else if (ev.type === TraceEventType.TOOL_CALL) {
      entry.toolCalls.push(ev);
    } else if (ev.type === TraceEventType.TOOL_RESULT) {
      entry.toolResults.push(ev);
    }
  }
  return order.map((name) => bySource.get(name) as SubagentRuntime);
}

function streamingParentTools(events: TraceEvent[]): {
  toolCalls: TraceEvent[];
  toolResults: TraceEvent[];
} {
  const toolCalls: TraceEvent[] = [];
  const toolResults: TraceEvent[] = [];
  for (const ev of events) {
    if (ev.source !== null) continue;
    if (ev.type === TraceEventType.TOOL_CALL) toolCalls.push(ev);
    else if (ev.type === TraceEventType.TOOL_RESULT) toolResults.push(ev);
  }
  return { toolCalls, toolResults };
}

function messagesFromTurns(turns: Turn[]): Array<{ message: Message; events: TraceEvent[] }> {
  const out: Array<{ message: Message; events: TraceEvent[] }> = [];
  for (const turn of turns) {
    if (turn.human_message) {
      out.push({ message: turn.human_message, events: [] });
    }
    if (turn.ai_message) {
      out.push({ message: turn.ai_message, events: turn.events });
    }
  }
  return out;
}

export default function MessageList({
  threadId,
  agentName,
  agentHasResponseFormat = false,
}: Readonly<MessageListProps>) {
  const { data: threadHistory, isLoading } = useThreadHistory(threadId);
  const streamingTurn = useChatStore((s) => s.streamingTurn);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const pendingUserMessage = useChatStore((s) => s.pendingUserMessage);
  const error = useChatStore((s) => s.error);
  const scrollRef = useRef<HTMLDivElement>(null);

  const entries = useMemo(
    () => (threadHistory ? messagesFromTurns(threadHistory.turns) : []),
    [threadHistory],
  );

  const streamingSubagents = useMemo(
    () => (streamingTurn ? buildStreamingSubagents(streamingTurn.events) : []),
    [streamingTurn],
  );
  const parentTools = useMemo(
    () =>
      streamingTurn
        ? streamingParentTools(streamingTurn.events)
        : { toolCalls: [], toolResults: [] },
    [streamingTurn],
  );

  const deferredParentContent = useDeferredValue(streamingTurn?.parentContent ?? "");
  const deferredParentThinking = useDeferredValue(streamingTurn?.parentThinking ?? "");

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (isNearBottom) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [entries, streamingTurn, pendingUserMessage, error]);

  if (isLoading) {
    return (
      <div
        className="flex flex-1 items-center justify-center gap-2 bg-bg p-6"
        aria-busy="true"
        aria-live="polite"
      >
        <span
          className="spin inline-block h-4 w-4 border-2 border-accent border-t-transparent"
          aria-hidden="true"
        />
        <span className="font-mono text-xs text-muted">Loading messages…</span>
      </div>
    );
  }

  const hasMessages = entries.length > 0;

  if (!hasMessages && !isStreaming && !error && !pendingUserMessage) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center gap-4 bg-bg p-8"
        data-od-id="chat-empty-state"
      >
        <MessagesSquare className="h-12 w-12 text-muted" aria-hidden="true" />
        <p className="font-body text-sm text-muted">Send a message to start the conversation</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex flex-1 flex-col gap-5 overflow-y-auto bg-bg p-4 md:p-6">
      {entries.map((entry, idx) => (
        <ChatMessage
          key={`${entry.message.timestamp}-${idx}`}
          message={entry.message}
          agentName={agentName}
          threadId={threadId}
          events={entry.events}
        />
      ))}

      {pendingUserMessage && (
        <ChatMessage
          message={{
            role: MessageRole.HUMAN,
            content: pendingUserMessage,
            timestamp: new Date().toISOString(),
            tool_calls: null,
            status: null,
            structured_response: null,
            thinking: null,
            turn_id: null,
          }}
          agentName={agentName}
          threadId={threadId}
        />
      )}

      {isStreaming && streamingTurn && (
        <div className="animate-chat-msg-enter flex gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-accent font-display text-xs uppercase text-accent-on"
            aria-hidden="true"
          >
            {agentName.charAt(0).toUpperCase()}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-fg">{agentName}</span>
            </div>
            <div className="border border-border bg-surface p-4 text-sm text-fg">
              {deferredParentContent && (
                <div className={`mb-3 ${MARKDOWN_PROSE_CLASSES}`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{deferredParentContent}</ReactMarkdown>
                </div>
              )}
              <ThinkingBlock text={deferredParentThinking} source={null} />

              {parentTools.toolCalls.map((call) => (
                <ToolCallBadge
                  key={call.id}
                  name={call.name ?? "unknown"}
                  args={call.content}
                  source={null}
                />
              ))}
              {parentTools.toolResults.map((result) => (
                <ToolResultBlock
                  key={result.id}
                  name={result.name}
                  content={result.content}
                  source={null}
                />
              ))}

              {streamingSubagents.map((sub) => (
                <SubagentPanel
                  key={sub.name}
                  name={sub.name}
                  content={sub.content}
                  thinking={sub.thinking}
                  toolCalls={sub.toolCalls}
                  toolResults={sub.toolResults}
                />
              ))}

              <StructuredResponseLive
                result={streamingTurn.structured_response}
                hasResponseFormat={agentHasResponseFormat}
              />

              <div
                className="mt-2 flex items-center gap-2 font-mono text-xs text-muted"
                aria-live="polite"
              >
                <span
                  className="spin inline-block h-3 w-3 border-2 border-accent border-t-transparent"
                  aria-hidden="true"
                />
                <span>{streamingTurn.parentContent ? "Processing…" : "Thinking…"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && !isStreaming && (
        <div className="animate-chat-msg-enter flex gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-danger bg-danger/10 font-display text-xs uppercase text-danger"
            aria-hidden="true"
          >
            !
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-fg">{agentName}</span>
            </div>
            <div className="border border-danger bg-bg p-3 text-sm">
              <p className="font-mono text-xs uppercase tracking-[0.1em] text-danger">
                Something went wrong
              </p>
              <p className="mt-1 font-mono text-xs text-danger/80">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
