import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/application/lib/utils";
import { useThreads } from "@/application/hooks/chat/useThreads";
import { useAgents } from "@/application/hooks/agent/useAgents";
import { useCreateThread } from "@/application/hooks/chat/useCreateThread";
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

export default function ThreadSidebar({
  activeThreadId,
}: Readonly<ThreadSidebarProps>) {
  const { data: threads, isLoading } = useThreads();
  const { data: agents, isLoading: agentsLoading } = useAgents();
  const createThread = useCreateThread();
  const setActiveThread = useChatStore((s) => s.setActiveThread);
  const navigate = useNavigate();
  const [showAgentDialog, setShowAgentDialog] = useState(false);

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
    setShowAgentDialog(true);
  }

  function handleSelectAgent(agentName: string) {
    createThread.mutate(agentName, {
      onSuccess: (thread) => {
        setActiveThread(thread.id);
        navigate(`/chat/${thread.id}`);
        setShowAgentDialog(false);
      },
    });
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
          <span className="material-symbols-outlined text-base">add</span> New
          Conversation
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

      {/* Agent selection dialog */}
      {showAgentDialog && (
        <div
          className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center"
          onClick={() => setShowAgentDialog(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowAgentDialog(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="agent-dialog-title"
        >
          <dialog
            open
            role="none"
            className="m-0 p-0 w-80 max-h-96 border-none bg-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="bg-white rounded-xl p-6 w-full overflow-y-auto shadow-xl"
              role="document"
            >
              <h3
                id="agent-dialog-title"
                className="font-headline text-lg font-bold mb-4"
              >
                Choose an Agent
              </h3>
              {agentsLoading ? (
                <p className="text-sm text-on-surface-variant">
                  Loading agents...
                </p>
              ) : (
                <div className="space-y-2">
                  {agents?.map((agent) => (
                    <button
                      key={agent.name}
                      type="button"
                      onClick={() => handleSelectAgent(agent.name)}
                      disabled={createThread.isPending}
                      className="w-full text-left p-3 rounded-lg hover:bg-surface-container-low transition-colors"
                    >
                      <span className="block font-medium text-sm">
                        {agent.name}
                      </span>
                      <span className="block text-xs text-on-surface-variant">
                        {agent.model}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </dialog>
        </div>
      )}
    </aside>
  );
}
