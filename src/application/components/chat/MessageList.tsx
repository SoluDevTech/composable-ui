import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMessages } from "@/application/hooks/chat/useMessages";
import { useChatStore } from "@/application/stores/useChatStore";
import { MessageRole } from "@/domain/entities/chat/message";
import ChatMessage from "@/application/components/chat/ChatMessage";
import ThinkingBlock from "@/application/components/chat/ThinkingBlock";
import StructuredResponseCard from "@/application/components/chat/StructuredResponseCard";

interface MessageListProps {
  threadId: string;
  agentName: string;
}

export default function MessageList({
  threadId,
  agentName,
}: Readonly<MessageListProps>) {
  const { data: messages, isLoading } = useMessages(threadId);
  const {
    streamingContent,
    streamingThinking,
    structuredResponse,
    isStreaming,
    pendingUserMessage,
  } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [
    messages,
    streamingContent,
    streamingThinking,
    pendingUserMessage,
    isStreaming,
  ]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-on-surface-variant text-sm">Loading messages...</p>
      </div>
    );
  }

  const hasMessages = (messages?.length ?? 0) > 0;

  if (!hasMessages && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-outline-variant/40 mb-4 block">
            chat_bubble_outline
          </span>
          <p className="text-on-surface-variant text-sm font-headline">
            Send a message to start the conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-6 py-8 md:px-12 lg:px-24 xl:px-48"
    >
      <div className="space-y-6">
        {messages?.map((msg, idx) => (
          <ChatMessage
            key={`${msg.timestamp}-${idx}`}
            message={msg}
            agentName={agentName}
            threadId={threadId}
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
            }}
            agentName={agentName}
            threadId={threadId}
          />
        )}

        {isStreaming && (
          <div className="flex gap-3 max-w-4xl">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center shrink-0 mt-1">
              <span className="material-symbols-outlined text-white text-sm">
                hub
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-headline font-bold text-sm text-on-surface">
                  {agentName}
                </span>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl rounded-tl-none ambient-shadow border border-outline-variant/15">
                {streamingContent && (
                  <div className="prose prose-sm max-w-none break-words overflow-wrap-anywhere prose-p:text-on-surface prose-p:leading-relaxed prose-code:text-xs prose-code:bg-surface-container-low prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-surface-container prose-pre:rounded-xl prose-pre:overflow-x-auto mb-4">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {streamingContent}
                    </ReactMarkdown>
                  </div>
                )}
                <ThinkingBlock text={streamingThinking} />
                <StructuredResponseCard data={structuredResponse} />
                <div className="flex items-center gap-2 text-on-surface-variant text-xs mt-2">
                  <span className="material-symbols-outlined animate-spin text-secondary-brand text-base">
                    progress_activity
                  </span>
                  <span>
                    {streamingContent ? "Processing..." : "Thinking..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
