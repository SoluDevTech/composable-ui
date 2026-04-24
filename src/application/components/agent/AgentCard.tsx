import type { AgentConfigMetadata } from "@/domain/entities/agent/agentConfigMetadata";
import StatusBadge from "@/application/components/shared/StatusBadge";

interface AgentCardProps {
  agent: AgentConfigMetadata;
  onConfigure: (name: string) => void;
}

const AGENT_ICONS: Record<string, string> = {
  a: "smart_toy",
  b: "psychology",
  c: "code",
  d: "data_object",
  e: "engineering",
  f: "functions",
  g: "generating_tokens",
  h: "hub",
  i: "integration_instructions",
  j: "join",
  k: "key",
  l: "lightbulb",
  m: "model_training",
  n: "neurology",
  o: "offline_bolt",
  p: "precision_manufacturing",
  q: "query_stats",
  r: "robot_2",
  s: "schema",
  t: "terminal",
  u: "upgrade",
  v: "verified",
  w: "workspaces",
  x: "extension",
  y: "yield",
  z: "zoom_in",
};

function getAgentIcon(name: string): string {
  const firstLetter = name.charAt(0).toLowerCase();
  return AGENT_ICONS[firstLetter] ?? "smart_toy";
}

export default function AgentCard({
  agent,
  onConfigure,
}: Readonly<AgentCardProps>) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 ambient-shadow hover:translate-y-[-2px] transition-transform duration-300">
      {/* Header: icon + status */}
      <div className="flex items-center justify-between mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-2xl">
            {getAgentIcon(agent.name)}
          </span>
        </div>
        <StatusBadge status={agent.is_builtin ? "Active" : "Standby"} />
      </div>

      {/* Name */}
      <h3 className="font-headline text-2xl font-bold text-on-surface mb-2">
        {agent.name}
      </h3>

      {/* Model */}
      <p className="text-sm text-on-surface-variant mb-8">{agent.model}</p>

      {/* Configure link */}
      <button
        type="button"
        onClick={() => onConfigure(agent.name)}
        className="flex items-center gap-2 text-secondary-brand font-headline text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
      >
        Configure{" "}
        <span className="material-symbols-outlined text-base">
          arrow_forward
        </span>
      </button>
    </div>
  );
}
