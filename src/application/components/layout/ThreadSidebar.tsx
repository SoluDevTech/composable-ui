import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/application/lib/utils";
import { useThreads } from "@/application/hooks/chat/useThreads";
import { useAgents } from "@/application/hooks/agent/useAgents";
import { useCreateThread } from "@/application/hooks/chat/useCreateThread";
import { useChatStore } from "@/application/stores/useChatStore";
import type { Thread } from "@/domain/entities/chat/thread";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/application/components/ui/dialog";

interface ThreadSidebarProps {
  activeThreadId?: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getThreadPreview(thread: Thread): string {
  // Prefer first agent message content if available in the future; for now show a short id-based preview.
  return `Thread · ${thread.id.slice(0, 8)}`;
}

export default function ThreadSidebar({ activeThreadId }: Readonly<ThreadSidebarProps>) {
  const { data: threads, isLoading } = useThreads();
  const { data: agents, isLoading: agentsLoading } = useAgents();
  const createThread = useCreateThread();
  const setActiveThread = useChatStore((s) => s.setActiveThread);
  const navigate = useNavigate();
  const [showAgentDialog, setShowAgentDialog] = useState(false);

  // Close agent dialog when escape is pressed (Dialog handles it, but ensure state sync).
  useEffect(() => {
    if (!showAgentDialog) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowAgentDialog(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showAgentDialog]);

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
      onError: () => setShowAgentDialog(false),
    });
  }

  return (
    <aside
      className="w-64 bg-surface-container-low border-r border-outline-variant/30 flex flex-col overflow-hidden shrink-0"
      aria-label="Conversation threads"
    >
      {/* New Conversation */}
      <div className="p-4">
        <button
          type="button"
          onClick={handleNewConversation}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-primary-container text-white font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-brand focus-visible:ring-offset-2"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            add
          </span>
          New Conversation
        </button>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 overscroll-contain">
        {isLoading && (
          <p className="text-xs text-on-surface-variant px-3 py-2" aria-live="polite">
            Loading threads…
          </p>
        )}

        {Array.from(grouped.entries()).map(([agentName, agentThreads]) => (
          <div key={agentName} className="mb-4">
            {/* Agent group header */}
            <div className="flex items-center gap-2 px-3 py-2">
              <span
                className="material-symbols-outlined text-sm text-on-surface-variant"
                aria-hidden="true"
              >
                hub
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {agentName}
              </span>
            </div>

            {/* Threads */}
            <ul className="space-y-1">
              {agentThreads.map((thread) => {
                const isActive = thread.id === activeThreadId;
                return (
                  <li key={thread.id}>
                    <button
                      type="button"
                      onClick={() => handleThreadClick(thread.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-brand focus-visible:ring-inset",
                        isActive
                          ? "bg-surface-container-high border-l-4 border-secondary-brand font-medium"
                          : "hover:bg-surface-container-high/60",
                      )}
                    >
                      <span className="block text-on-surface text-xs font-medium truncate">
                        {getThreadPreview(thread)}
                      </span>
                      <span className="block text-[11px] text-on-surface-variant mt-0.5">
                        {formatDate(thread.created_at)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {!isLoading && (!threads || threads.length === 0) && (
          <p className="text-xs text-on-surface-variant px-3 py-2 text-center">
            No conversations yet
          </p>
        )}
      </div>

      {/* Agent selection dialog */}
      <Dialog open={showAgentDialog} onOpenChange={(v) => setShowAgentDialog(v)}>
        <DialogContent className="max-w-sm w-full">
          <DialogHeader>
            <DialogTitle className="font-headline text-lg font-bold">Choose an Agent</DialogTitle>
            <DialogDescription className="sr-only">
              Select an agent to start a new conversation thread
            </DialogDescription>
          </DialogHeader>
          {agentsLoading ? (
            <p className="text-sm text-on-surface-variant" aria-live="polite">
              Loading agents…
            </p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto overscroll-contain">
              {agents?.length === 0 && (
                <p className="text-sm text-on-surface-variant py-4 text-center">
                  No agents available
                </p>
              )}
              {agents?.map((agent) => (
                <button
                  key={agent.name}
                  type="button"
                  onClick={() => handleSelectAgent(agent.name)}
                  disabled={createThread.isPending}
                  className="w-full text-left p-3 rounded-lg hover:bg-surface-container-low transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-brand focus-visible:ring-offset-2 disabled:opacity-50"
                >
                  <span className="block font-medium text-sm">{agent.name}</span>
                  <span className="block text-xs text-on-surface-variant">{agent.model}</span>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </aside>
  );
}
