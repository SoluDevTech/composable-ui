import { useState } from "react";
import { Plus } from "lucide-react";
import AppShell from "@/application/components/layout/AppShell";
import AgentGrid from "@/application/components/agent/AgentGrid";
import CreateAgentDialog from "@/application/components/agent/CreateAgentDialog";
import AgentConfigViewer from "@/application/components/agent/AgentConfigViewer";
import { useAgents } from "@/application/hooks/agent/useAgents";
import { Badge } from "@/application/components/ui/badge";
import { Button } from "@/application/components/ui/button";

export default function AgentsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewerAgent, setViewerAgent] = useState<string | null>(null);
  const { data: agents } = useAgents();

  const total = agents?.length ?? 0;

  return (
    <AppShell>
      <div
        className="agents-view flex flex-1 flex-col gap-6 overflow-y-auto bg-bg p-4 md:p-8"
        data-od-id="agents-view"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="max-w-md font-body text-sm text-muted">
            Configure and manage your AI agent fleet. Each agent operates with its own tools and
            orchestration rules.
          </p>
          <div className="flex items-center gap-3">
            <Badge variant="default" data-od-id="agent-count">
              {total} agents
            </Badge>
            <Button
              type="button"
              variant="default"
              onClick={() => setCreateDialogOpen(true)}
              data-od-id="create-agent"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create Agent
            </Button>
          </div>
        </div>

        <AgentGrid
          onCreateNew={() => setCreateDialogOpen(true)}
          onConfigure={(name) => setViewerAgent(name)}
        />
      </div>

      <CreateAgentDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      {viewerAgent && (
        <AgentConfigViewer
          agentName={viewerAgent}
          open
          onOpenChange={(open) => {
            if (!open) setViewerAgent(null);
          }}
        />
      )}
    </AppShell>
  );
}
