import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/application/lib/utils";
import { useThreads } from "@/application/hooks/chat/useThreads";
import { useAgents } from "@/application/hooks/agent/useAgents";
import { useCreateThread } from "@/application/hooks/chat/useCreateThread";
import { useChatStore } from "@/application/stores/useChatStore";
import type { Thread } from "@/domain/entities/chat/thread";
import { Button } from "@/application/components/ui/button";
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
  return `Thread · ${thread.id.slice(0, 8)}`;
}

export default function ThreadSidebar({ activeThreadId }: Readonly<ThreadSidebarProps>) {
  const { data: threads, isLoading } = useThreads();
  const { data: agents, isLoading: agentsLoading } = useAgents();
  const createThread = useCreateThread();
  const setActiveThread = useChatStore((s) => s.setActiveThread);
  const navigate = useNavigate();
  const [showAgentDialog, setShowAgentDialog] = useState(false);

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
      data-od-id="thread-sidebar"
      className="flex w-[260px] flex-col overflow-hidden border-r border-border bg-surface"
      aria-label="Conversation threads"
    >
      <div className="border-b border-border p-4">
        <Button variant="default" className="w-full" onClick={handleNewConversation}>
          New Conversation
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain pb-4">
        {isLoading && (
          <p className="px-4 py-2 font-mono text-xs text-muted" aria-live="polite">
            Loading threads…
          </p>
        )}

        {Array.from(grouped.entries()).map(([agentName, agentThreads]) => (
          <div key={agentName} className="mb-4">
            <div className="flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-muted">
              {agentName}
            </div>
            <ul>
              {agentThreads.map((thread) => {
                const isActive = thread.id === activeThreadId;
                return (
                  <li key={thread.id}>
                    <button
                      type="button"
                      onClick={() => handleThreadClick(thread.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex w-full flex-col gap-1 border-l-[3px] border-l-transparent px-4 py-2 text-left transition-[background-color,border-color,color] duration-fast ease-standard hover:bg-surface-warm hover:text-fg focus-visible:outline-none focus-visible:shadow-focus",
                        isActive && "border-l-accent bg-surface-warm text-accent",
                      )}
                    >
                      <span className="truncate text-sm font-semibold text-fg">
                        {getThreadPreview(thread)}
                      </span>
                      <span className="truncate font-mono text-xs text-muted">
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
          <p className="px-4 py-2 text-center font-mono text-xs text-muted">No conversations yet</p>
        )}
      </div>

      <Dialog open={showAgentDialog} onOpenChange={(v) => setShowAgentDialog(v)}>
        <DialogContent className="max-w-sm w-full">
          <DialogHeader>
            <DialogTitle className="font-display text-base uppercase tracking-[0.06em]">
              Choose an Agent
            </DialogTitle>
            <DialogDescription className="sr-only">
              Select an agent to start a new conversation thread
            </DialogDescription>
          </DialogHeader>
          {agentsLoading ? (
            <p className="font-mono text-xs text-muted" aria-live="polite">
              Loading agents…
            </p>
          ) : (
            <div className="max-h-[60vh] space-y-2 overflow-y-auto overscroll-contain">
              {agents?.length === 0 && (
                <p className="py-4 text-center font-mono text-xs text-muted">No agents available</p>
              )}
              {agents?.map((agent) => (
                <button
                  key={agent.name}
                  type="button"
                  onClick={() => handleSelectAgent(agent.name)}
                  disabled={createThread.isPending}
                  className="w-full rounded-none border border-border bg-surface-warm p-3 text-left transition-[background-color,border-color,color] duration-fast ease-standard hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-50"
                >
                  <span className="block text-sm font-semibold text-fg">{agent.name}</span>
                  <span className="block font-mono text-xs text-muted">{agent.model}</span>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </aside>
  );
}
