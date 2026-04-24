import { useState } from "react";
import { toast } from "sonner";
import { useAgentConfig } from "@/application/hooks/agent/useAgentConfig";
import { useDeleteAgent } from "@/application/hooks/agent/useDeleteAgent";
import StatusBadge from "@/application/components/shared/StatusBadge";
import ToolTag from "@/application/components/shared/ToolTag";

interface AgentConfigViewerProps {
  agentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AgentConfigViewer({
  agentName,
  open,
  onOpenChange,
}: Readonly<AgentConfigViewerProps>) {
  const { data: config, isLoading } = useAgentConfig(open ? agentName : null);
  const deleteAgent = useDeleteAgent();
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!open) return null;

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    deleteAgent.mutate(agentName, {
      onSuccess: () => {
        toast.success(`Agent "${agentName}" deleted`);
        onOpenChange(false);
        setConfirmDelete(false);
      },
      onError: (error) => {
        toast.error(error.message);
        setConfirmDelete(false);
      },
    });
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-[10vh] bg-black/30 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === "Escape") onOpenChange(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-viewer-title"
    >
      <div
        role="document"
        className="w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-surface-container-lowest rounded-2xl p-8 w-full max-h-[80vh] overflow-y-auto ambient-shadow">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2
              id="agent-viewer-title"
              className="font-headline text-2xl font-bold text-on-surface"
            >
              {agentName}
            </h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">
                close
              </span>
            </button>
          </div>

          {isLoading && (
            <p className="text-on-surface-variant text-sm py-8 text-center">
              Loading configuration...
            </p>
          )}

          {config && (
            <div className="space-y-6">
              {/* Model & Debug */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <SectionLabel>Model</SectionLabel>
                  <p className="text-on-surface text-sm">{config.model}</p>
                </div>
                <div>
                  <SectionLabel>Debug</SectionLabel>
                  <StatusBadge status={config.debug ? "Active" : "Off"} />
                </div>
              </div>

              {/* System Prompt */}
              {config.system_prompt && (
                <div>
                  <SectionLabel>System Prompt</SectionLabel>
                  <div className="bg-surface-container-low rounded-xl p-4 text-xs text-on-surface font-mono leading-relaxed">
                    {promptExpanded
                      ? config.system_prompt
                      : config.system_prompt.slice(0, 200)}
                    {config.system_prompt.length > 200 && (
                      <button
                        type="button"
                        onClick={() => setPromptExpanded(!promptExpanded)}
                        className="ml-1 text-secondary-brand font-bold"
                      >
                        {promptExpanded ? "Show less" : "...Show more"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Tools */}
              {config.tools.length > 0 && (
                <div>
                  <SectionLabel>Tools ({config.tools.length})</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {config.tools.map((tool) => (
                      <ToolTag key={tool} label={tool} />
                    ))}
                  </div>
                </div>
              )}

              {/* Middleware */}
              {config.middleware.length > 0 && (
                <div>
                  <SectionLabel>
                    Middleware ({config.middleware.length})
                  </SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {config.middleware.map((mw) => (
                      <ToolTag key={mw} label={mw} />
                    ))}
                  </div>
                </div>
              )}

              {/* Backend */}
              <div>
                <SectionLabel>Backend</SectionLabel>
                <p className="text-on-surface text-sm">
                  Type: <span className="font-mono">{config.backend.type}</span>
                  {config.backend.root_dir && (
                    <>
                      {" "}
                      &middot; Root:{" "}
                      <span className="font-mono">
                        {config.backend.root_dir}
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* HITL Rules */}
              {Object.keys(config.hitl.rules).length > 0 && (
                <div>
                  <SectionLabel>HITL Rules</SectionLabel>
                  <div className="bg-surface-container-low rounded-xl p-4 space-y-1">
                    {Object.entries(config.hitl.rules).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="font-mono text-on-surface">{key}</span>
                        <span className="text-on-surface-variant">
                          {(() => {
                            if (typeof value === "boolean")
                              return value ? "Enabled" : "Disabled";
                            return JSON.stringify(value);
                          })()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MCP Servers */}
              {config.mcp_servers.length > 0 && (
                <div>
                  <SectionLabel>
                    MCP Servers ({config.mcp_servers.length})
                  </SectionLabel>
                  <div className="space-y-2">
                    {config.mcp_servers.map((server) => (
                      <div
                        key={server.name}
                        className="bg-surface-container-low rounded-xl p-3 flex items-center justify-between"
                      >
                        <span className="text-sm font-medium text-on-surface">
                          {server.name}
                        </span>
                        <ToolTag label={server.transport} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subagents */}
              {config.subagents.length > 0 && (
                <div>
                  <SectionLabel>
                    Subagents ({config.subagents.length})
                  </SectionLabel>
                  <div className="space-y-2">
                    {config.subagents.map((sub) => (
                      <div
                        key={sub.name}
                        className="bg-surface-container-low rounded-xl p-3"
                      >
                        <p className="text-sm font-medium text-on-surface">
                          {sub.name}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-1">
                          {sub.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteAgent.isPending}
              className="px-6 py-3 rounded-full bg-red-600 text-white font-headline text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {confirmDelete ? "Confirm Delete?" : "Delete"}
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                setConfirmDelete(false);
              }}
              className="px-6 py-3 rounded-full border border-outline-variant/30 text-on-surface-variant font-headline text-xs font-bold uppercase tracking-widest hover:bg-surface-container transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
      {children}
    </h4>
  );
}
