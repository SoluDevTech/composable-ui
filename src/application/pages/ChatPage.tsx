import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/application/components/layout/MainLayout";
import MessageList from "@/application/components/chat/MessageList";
import ChatInput from "@/application/components/chat/ChatInput";
import { useChatStore } from "@/application/stores/useChatStore";
import { useThreads } from "@/application/hooks/chat/useThreads";

export default function ChatPage() {
  const { threadId } = useParams<{ threadId?: string }>();
  const setActiveThread = useChatStore((s) => s.setActiveThread);
  const { data: threads } = useThreads();

  useEffect(() => {
    setActiveThread(threadId ?? null);
  }, [threadId, setActiveThread]);

  const agentName = useMemo(() => {
    if (!threadId || !threads) return "Agent";
    const thread = threads.find((t) => t.id === threadId);
    return thread?.agent_name ?? "Agent";
  }, [threadId, threads]);

  return (
    <MainLayout showSidebar activeThreadId={threadId}>
      {threadId ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          <MessageList threadId={threadId} agentName={agentName} />
          <ChatInput threadId={threadId} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-8xl text-outline-variant/30 mb-6 block">
              forum
            </span>
            <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">
              Orchestration Console
            </h2>
            <p className="text-on-surface-variant text-sm max-w-sm mx-auto">
              Select a thread from the sidebar or start a new conversation to
              begin orchestrating your agents.
            </p>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
