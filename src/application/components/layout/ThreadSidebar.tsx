import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/application/lib/utils";
import { useThreads } from "@/application/hooks/chat/useThreads";
import { useChatStore } from "@/application/stores/useChatStore";
import type { Thread } from "@/domain/entities/chat/thread";

interface ThreadSidebarProps {
  activeThreadId?: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ThreadSidebar({ activeThreadId }: ThreadSidebarProps) {
  const { data: threads, isLoading } = useThreads();
  const setActiveThread = useChatStore((s) => s.setActiveThread);
  const navigate = useNavigate();

  const grouped = useMemo(() => {
    if (!threads) return new Map<string, Thread[]>();
    const map = new Map<string, Thread[]>();
    for (const thread of threads) {
      const list = map.get(thread.agent_name) ?? [];
      list.push(thread);
      map.set(thread.agent_name, list);
    }
    return map;
  }, [threads]);

  function handleThreadClick(threadId: string) {
    setActiveThread(threadId);
    navigate(`/chat/${threadId}`);
  }

  function handleNewConversation() {
    setActiveThread(null);
    navigate("/chat");
  }

  return (
    <aside className="w-64 bg-surface-container-low border-r border-outline-variant/30 flex flex-col overflow-hidden">
      {/* New Conversation */}
      <div className="p-4">
        <button
          type="button"
          onClick={handleNewConversation}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-primary-container text-white font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-base">add</span>
          New Conversation
        </button>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {isLoading && (
          <p className="text-xs text-on-surface-variant px-3 py-2">
            Loading threads...
          </p>
        )}

        {Array.from(grouped.entries()).map(([agentName, agentThreads]) => (
          <div key={agentName} className="mb-4">
            {/* Agent group header */}
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="material-symbols-outlined text-sm text-on-surface-variant">
                hub
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {agentName}
              </span>
            </div>

            {/* Threads */}
            {agentThreads.map((thread) => {
              const isActive = thread.id === activeThreadId;
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => handleThreadClick(thread.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm",
                    isActive
                      ? "bg-slate-200 border-l-4 border-secondary-brand font-medium"
                      : "hover:bg-surface-container-high",
                  )}
                >
                  <span className="block text-on-surface text-xs font-medium truncate">
                    Thread
                  </span>
                  <span className="block text-[11px] text-on-surface-variant mt-0.5">
                    {formatDate(thread.created_at)}
                  </span>
                </button>
              );
            })}
          </div>
        ))}

        {!isLoading && (!threads || threads.length === 0) && (
          <p className="text-xs text-on-surface-variant px-3 py-2 text-center">
            No conversations yet
          </p>
        )}
      </div>
    </aside>
  );
}
