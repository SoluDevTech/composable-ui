import { Plus } from "lucide-react";
import { useAgents } from "@/application/hooks/agent/useAgents";
import AgentCard from "@/application/components/agent/AgentCard";

interface AgentGridProps {
  onCreateNew: () => void;
  onConfigure: (name: string) => void;
}

export default function AgentGrid({ onCreateNew, onConfigure }: Readonly<AgentGridProps>) {
  const { data: agents, isLoading, error } = useAgents();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24" data-od-id="agent-grid">
        <span
          className="spin mr-3 inline-block h-4 w-4 border-2 border-border border-t-accent"
          aria-hidden="true"
        />
        <p className="font-mono text-sm text-muted">Loading agents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24" data-od-id="agent-grid">
        <p className="font-mono text-sm text-danger">Failed to load agents: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" data-od-id="agent-grid">
      {agents?.map((agent) => (
        <div key={agent.name} className="min-w-0">
          <AgentCard agent={agent} onConfigure={onConfigure} />
        </div>
      ))}

      <button
        type="button"
        onClick={onCreateNew}
        data-od-id="agent-card-new"
        className="group flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-border bg-surface/50 text-muted transition-[border-color,color] duration-base ease-standard hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:shadow-focus"
      >
        <span
          className="flex h-12 w-12 items-center justify-center border border-border bg-surface text-muted transition-colors group-hover:border-accent group-hover:text-accent"
          aria-hidden="true"
        >
          <Plus className="h-6 w-6" />
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.1em]">New Agent Template</span>
      </button>
    </div>
  );
}
