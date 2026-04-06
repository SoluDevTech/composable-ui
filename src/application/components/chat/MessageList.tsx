import { useEffect, useRef } from "react";
import { useMessages } from "@/application/hooks/chat/useMessages";
import { useChatStore } from "@/application/stores/useChatStore";
import { MessageRole } from "@/domain/entities/chat/message";
import ChatMessage from "@/application/components/chat/ChatMessage";

interface MessageListProps {
  threadId: string;
  agentName: string;
}

export default function MessageList({ threadId, agentName }: MessageListProps) {
  const { data: messages, isLoading } = useMessages(threadId);
  const { streamingContent, isStreaming, pendingUserMessage } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change or streaming content updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-on-surface-variant text-sm">Loading messages...</p>
      </div>
    );
  }

  const hasMessages = messages && messages.length > 0;

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

        {/* Pending user message (optimistic) */}
        {pendingUserMessage && (
          <ChatMessage
            message={{
              role: MessageRole.HUMAN,
              content: pendingUserMessage,
              timestamp: new Date().toISOString(),
              tool_calls: null,
              status: null,
              structured_response: null,
            }}
            agentName={agentName}
            threadId={threadId}
          />
        )}

        {/* Streaming or typing indicator */}
        {isStreaming && (
          <ChatMessage
            message={{
              role: MessageRole.AI,
              content: streamingContent || "...",
              timestamp: new Date().toISOString(),
              tool_calls: null,
              status: null,
              structured_response: null,
            }}
            agentName={agentName}
            threadId={threadId}
          />
        )}
      </div>
    </div>
  );
}
