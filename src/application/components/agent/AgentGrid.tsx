import { useAgents } from "@/application/hooks/agent/useAgents";
import AgentCard from "@/application/components/agent/AgentCard";

interface AgentGridProps {
  onCreateNew: () => void;
  onConfigure: (name: string) => void;
}

export default function AgentGrid({
  onCreateNew,
  onConfigure,
}: AgentGridProps) {
  const { data: agents, isLoading, error } = useAgents();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-on-surface-variant font-headline text-sm tracking-wide">
          Loading agents...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-red-600 font-headline text-sm">
          Failed to load agents: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {agents?.map((agent) => (
        <AgentCard key={agent.name} agent={agent} onConfigure={onConfigure} />
      ))}

      {/* New Agent template card */}
      <button
        type="button"
        onClick={onCreateNew}
        className="rounded-xl border-2 border-dashed border-outline-variant/50 p-8 flex flex-col items-center justify-center gap-4 min-h-[220px] hover:border-secondary-brand hover:bg-surface-container-low transition-colors duration-300 group"
      >
        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center group-hover:bg-secondary-brand/10 transition-colors">
          <span className="material-symbols-outlined text-2xl text-outline group-hover:text-secondary-brand transition-colors">
            add
          </span>
        </div>
        <span className="font-headline text-sm font-bold uppercase tracking-widest text-outline group-hover:text-secondary-brand transition-colors">
          New Agent Template
        </span>
      </button>
    </div>
  );
}
