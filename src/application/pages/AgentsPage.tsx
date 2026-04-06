import { useState } from "react";
import MainLayout from "@/application/components/layout/MainLayout";
import AgentGrid from "@/application/components/agent/AgentGrid";
import CreateAgentDialog from "@/application/components/agent/CreateAgentDialog";
import AgentConfigViewer from "@/application/components/agent/AgentConfigViewer";

export default function AgentsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewerAgent, setViewerAgent] = useState<string | null>(null);

  return (
    <MainLayout showSidebar={false}>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1440px] mx-auto px-8 py-12">
          {/* Header */}
          <div className="flex items-start justify-between mb-12">
            <div>
              <h1 className="font-headline text-5xl font-bold text-on-surface mb-3">
                Active Agents
              </h1>
              <p className="text-on-surface-variant text-sm max-w-md">
                Configure and manage your AI agent fleet. Each agent operates
                with its own tools, middleware, and orchestration rules.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreateDialogOpen(true)}
              className="flex items-center gap-3 bg-primary-container text-white rounded-full px-8 py-4 font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shrink-0"
            >
              <span className="material-symbols-outlined text-lg">
                add_circle
              </span>
              {" "}Create Agent (YAML)
            </button>
          </div>

          {/* Grid */}
          <AgentGrid
            onCreateNew={() => setCreateDialogOpen(true)}
            onConfigure={(name) => setViewerAgent(name)}
          />
        </div>
      </div>

      {/* Dialogs */}
      <CreateAgentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      {viewerAgent && (
        <AgentConfigViewer
          agentName={viewerAgent}
          open
          onOpenChange={(open) => {
            if (!open) setViewerAgent(null);
          }}
        />
      )}
    </MainLayout>
  );
}
