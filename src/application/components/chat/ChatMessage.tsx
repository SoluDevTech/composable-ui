import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageRole, MessageStatus, type Message } from "@/domain/entities/chat/message";
import type { TraceEvent } from "@/domain/entities/chat/traceEvent";
import { TraceEventType } from "@/domain/entities/chat/traceEvent";
import StatusBadge from "@/application/components/shared/StatusBadge";
import HITLReviewPanel from "@/application/components/chat/HITLReviewPanel";
import ThinkingBlock from "@/application/components/chat/ThinkingBlock";
import ToolCallBadge from "@/application/components/chat/ToolCallBadge";
import ToolResultBlock from "@/application/components/chat/ToolResultBlock";
import SubagentPanel from "@/application/components/chat/SubagentPanel";
import StructuredResponseCard from "@/application/components/chat/StructuredResponseCard";
import { MARKDOWN_PROSE_CLASSES } from "@/application/components/chat/markdownStyles";

interface ChatMessageProps {
  message: Message;
  agentName: string;
  threadId?: string;
  events?: TraceEvent[];
}

interface SubagentTimeline {
  name: string;
  content: string;
  thinking: string;
  toolCalls: TraceEvent[];
  toolResults: TraceEvent[];
}

function buildSubagentTimelines(events: TraceEvent[]): SubagentTimeline[] {
  const bySource = new Map<string, SubagentTimeline>();
  const order: string[] = [];
  for (const ev of events) {
    if (ev.source === null) continue;
    let entry = bySource.get(ev.source);
    if (!entry) {
      entry = {
        name: ev.source,
        content: "",
        thinking: "",
        toolCalls: [],
        toolResults: [],
      };
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
  return order.map((name) => bySource.get(name) as SubagentTimeline);
}

function parentThinking(events: TraceEvent[]): string {
  return events
    .filter((e) => e.source === null && e.type === TraceEventType.THINKING && e.content)
    .map((e) => e.content as string)
    .join("");
}

function parentToolEvents(events: TraceEvent[]): {
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

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function ChatMessageImpl({ message, agentName, threadId, events }: Readonly<ChatMessageProps>) {
  const isHuman = message.role === MessageRole.HUMAN;
  const isAi = message.role === MessageRole.AI;
  const isAwaitingHitl = message.status === MessageStatus.AWAITING_HITL;
  const avatarLetter = agentName.charAt(0).toUpperCase();

  const subagentTimelines = useMemo(() => (events ? buildSubagentTimelines(events) : []), [events]);
  const parentThinkingText = useMemo(() => (events ? parentThinking(events) : ""), [events]);
  const parentTools = useMemo(
    () => (events ? parentToolEvents(events) : { toolCalls: [], toolResults: [] }),
    [events],
  );

  if (isHuman) {
    return (
      <div className="animate-chat-msg-enter flex flex-row-reverse gap-3 self-end">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-surface-warm font-display text-xs uppercase text-fg"
          aria-hidden="true"
        >
          Y
        </div>
        <article className="flex min-w-0 max-w-[80%] flex-col items-end gap-1">
          <div className="flex flex-row-reverse flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-fg">You</span>
            <time className="font-mono text-xs text-muted" dateTime={message.timestamp}>
              {formatTimestamp(message.timestamp)}
            </time>
          </div>
          <div className="chat-msg-bubble border border-border-soft bg-surface-warm p-4 text-sm text-fg">
            <p className="whitespace-pre-wrap break-words leading-loose">{message.content}</p>
          </div>
        </article>
      </div>
    );
  }

  if (isAi) {
    const hasTimeline = (events?.length ?? 0) > 0;
    return (
      <div className="animate-chat-msg-enter flex gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-accent font-display text-xs uppercase text-accent-on"
          aria-hidden="true"
        >
          {avatarLetter}
        </div>

        <article className="flex min-w-0 max-w-[80%] flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-fg">{agentName}</span>
            {message.status && <StatusBadge status={message.status} />}
            <time className="font-mono text-xs text-muted" dateTime={message.timestamp}>
              {formatTimestamp(message.timestamp)}
            </time>
          </div>

          <div className="chat-msg-bubble border border-border border-l-2 bg-surface p-4 text-sm text-fg">
            <div className={MARKDOWN_PROSE_CLASSES}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>

            <ThinkingBlock key={message.timestamp} text={message.thinking} />
            <StructuredResponseCard data={message.structured_response} />

            {hasTimeline && (
              <div className="mt-2 flex flex-col gap-2" data-od-id="message-timeline">
                <ThinkingBlock text={parentThinkingText} source={null} />

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

                {subagentTimelines.map((sub) => (
                  <SubagentPanel
                    key={sub.name}
                    name={sub.name}
                    content={sub.content}
                    thinking={sub.thinking}
                    toolCalls={sub.toolCalls}
                    toolResults={sub.toolResults}
                  />
                ))}
              </div>
            )}
          </div>

          {isAwaitingHitl && message.tool_calls?.length && threadId && (
            <HITLReviewPanel toolCalls={message.tool_calls} threadId={threadId} />
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <span className="mx-auto inline-block border border-border bg-surface-warm px-3 py-1 font-mono text-xs uppercase tracking-[0.1em] text-muted">
        {message.content}
      </span>
    </div>
  );
}

const ChatMessage = memo(ChatMessageImpl, (prev, next) => {
  return (
    prev.agentName === next.agentName &&
    prev.threadId === next.threadId &&
    prev.message === next.message &&
    prev.events === next.events
  );
});

export default ChatMessage;
