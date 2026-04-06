import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/application/lib/utils";
import {
  MessageRole,
  MessageStatus,
  type Message,
} from "@/domain/entities/chat/message";
import StatusBadge from "@/application/components/shared/StatusBadge";
import HITLReviewPanel from "@/application/components/chat/HITLReviewPanel";

interface ChatMessageProps {
  message: Message;
  agentName: string;
  threadId?: string;
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatMessage({
  message,
  agentName,
  threadId,
}: ChatMessageProps) {
  const isHuman = message.role === MessageRole.HUMAN;
  const isAi = message.role === MessageRole.AI;
  const isAwaitingHitl = message.status === MessageStatus.AWAITING_HITL;

  if (isHuman) {
    return (
      <div className="flex justify-end">
        <div className="max-w-4xl">
          <div className="bg-surface-container-highest p-6 rounded-xl rounded-tr-none">
            <p className="text-on-surface text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-2 text-right">
            {formatTimestamp(message.timestamp)}
          </p>
        </div>
      </div>
    );
  }

  if (isAi) {
    return (
      <div className="flex gap-3 max-w-4xl">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center shrink-0 mt-1">
          <span className="material-symbols-outlined text-white text-sm">
            hub
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Agent name + status */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-headline font-bold text-sm text-on-surface">
              {agentName}
            </span>
            {message.status && <StatusBadge status={message.status} />}
          </div>

          {/* Content bubble */}
          <div className="bg-surface-container-lowest p-6 rounded-xl rounded-tl-none ambient-shadow border border-outline-variant/15 overflow-hidden">
            <div
              className={cn(
                "prose prose-sm max-w-none break-words overflow-wrap-anywhere",
                "prose-headings:font-headline prose-headings:text-on-surface",
                "prose-p:text-on-surface prose-p:leading-relaxed",
                "prose-code:text-xs prose-code:bg-surface-container-low prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:break-all",
                "prose-pre:bg-surface-container prose-pre:rounded-xl prose-pre:overflow-x-auto",
                "prose-a:text-secondary-brand prose-a:no-underline hover:prose-a:underline",
              )}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* HITL Review Panel */}
          {isAwaitingHitl &&
            message.tool_calls &&
            message.tool_calls.length > 0 &&
            threadId && (
              <HITLReviewPanel
                toolCalls={message.tool_calls}
                threadId={threadId}
              />
            )}

          {/* Timestamp */}
          <p className="text-[11px] text-on-surface-variant mt-2">
            {formatTimestamp(message.timestamp)}
          </p>
        </div>
      </div>
    );
  }

  // System / Tool messages: compact, centered
  return (
    <div className="flex justify-center">
      <div className="px-4 py-2 rounded-full bg-surface-container-low text-xs text-on-surface-variant">
        {message.content}
      </div>
    </div>
  );
}
