import { Bot, Settings, Trash2 } from "lucide-react";
import type { AgentConfigMetadata } from "@/domain/entities/agent/agentConfigMetadata";
import { Button } from "@/application/components/ui/button";

interface AgentCardProps {
  readonly agent: AgentConfigMetadata;
  readonly onConfigure: (name: string) => void;
  readonly onDelete?: (name: string) => void;
}

export default function AgentCard({ agent, onConfigure, onDelete }: Readonly<AgentCardProps>) {
  return (
    <div
      data-od-id={`agent-card-${agent.name}`}
      className="group relative flex flex-col gap-3 border border-border bg-surface p-4 block-shadow-raised transition-[border-color,box-shadow,transform] duration-base ease-standard hover:-translate-y-0.5 hover:border-accent"
    >
      <div className="flex items-center justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center border border-border bg-surface-warm font-display text-lg text-accent"
          aria-hidden="true"
        >
          <Bot className="h-6 w-6" />
        </div>
      </div>

      <h3 className="min-w-0 truncate font-display text-lg uppercase tracking-[0.06em] text-fg">
        {agent.name}
      </h3>
      <p className="font-mono text-xs text-muted">{agent.model}</p>

      <div className="mt-auto flex items-center gap-2 border-t border-border-soft pt-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onConfigure(agent.name)}
          data-od-id={`agent-configure-${agent.name}`}
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          Configure
        </Button>
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(agent.name)}
            aria-label={`Delete ${agent.name}`}
            className="ml-auto h-8 w-8"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
