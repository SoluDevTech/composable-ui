import { useState } from "react";
import { toast } from "sonner";
import { useAgentConfig } from "@/application/hooks/agent/useAgentConfig";
import { useUpdateAgent } from "@/application/hooks/agent/useUpdateAgent";
import { useDeleteAgent } from "@/application/hooks/agent/useDeleteAgent";
import { serializeAgentConfig, agentConfigToYamlFile } from "@/application/lib/yaml";
import type { AgentConfig } from "@/domain/entities/agent/agentConfig";
import type { AgentConfigFormData } from "@/domain/entities/agent/agentConfigSchema";
import StatusBadge from "@/application/components/shared/StatusBadge";
import ToolTag from "@/application/components/shared/ToolTag";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/application/components/ui/dialog";
import { Button } from "@/application/components/ui/button";
import { ScrollArea } from "@/application/components/ui/scroll-area";
import AgentConfigForm from "./AgentConfigForm";
import { AGENT_CONFIG_FORM_ID } from "./formConstants";

interface AgentConfigViewerProps {
  readonly agentName: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export default function AgentConfigViewer({
  agentName,
  open,
  onOpenChange,
}: Readonly<AgentConfigViewerProps>) {
  const { data: config, isLoading, error } = useAgentConfig(open ? agentName : null);
  const updateAgent = useUpdateAgent();
  const deleteAgent = useDeleteAgent();
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mode, setMode] = useState<"view" | "edit">("view");

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

  function handleEditSubmit(data: AgentConfigFormData) {
    const configToUpdate: AgentConfig = {
      ...data,
      system_prompt: data.system_prompt || undefined,
      system_prompt_file: data.system_prompt_file || undefined,
      response_format: data.response_format || undefined,
    };

    const file = agentConfigToYamlFile(configToUpdate, `${agentName}.yaml`);
    updateAgent.mutate(
      { name: agentName, yamlFile: file },
      {
        onSuccess: () => {
          toast.success("Agent updated successfully");
          setMode("view");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  }

  function handleExportYaml() {
    if (!config) return;
    const yamlContent = serializeAgentConfig(config);
    const blob = new Blob([yamlContent], { type: "application/x-yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agentName}.yaml`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  function handleClose() {
    setMode("view");
    setConfirmDelete(false);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden p-0 sm:p-0">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-outline-variant/30 shrink-0">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-2xl">{agentName}</DialogTitle>
            <DialogDescription>
              {mode === "edit"
                ? "Edit the agent configuration below, then save your changes."
                : "View the agent configuration. Use Edit to modify or Export to download YAML."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 overscroll-contain">
          {mode === "edit" && config ? (
            // When editing, the form uses its own (hidden lg:flex) footer for Submit/Cancel.
            // Otherwise we rely on the dialog footer below (mobile view).
            <>
              <AgentConfigForm
                mode="edit"
                initialData={config}
                onSubmit={handleEditSubmit}
                onCancel={() => setMode("view")}
                isPending={updateAgent.isPending}
              />
              {/* Mobile submit footer is rendered by the standalone footer below */}
              <div className="lg:hidden flex items-center gap-3 mt-4 pt-4 border-t border-outline-variant/30">
                <Button
                  type="submit"
                  form={AGENT_CONFIG_FORM_ID}
                  disabled={updateAgent.isPending}
                  className="flex-1"
                >
                  {updateAgent.isPending ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </>
          ) : (
            <ScrollArea className="max-h-[70vh]">
              {isLoading && (
                <p className="text-on-surface-variant text-sm py-8 text-center" aria-live="polite">
                  Loading configuration…
                </p>
              )}

              {error && (
                <p className="text-destructive text-sm py-8 text-center">
                  Failed to load configuration: {error.message}
                </p>
              )}

              {config && (
                <div className="space-y-6">
                  {/* Model & Debug */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <SectionLabel>Model</SectionLabel>
                      <p className="text-on-surface text-sm font-mono break-all">{config.model}</p>
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
                      <div className="bg-surface-container-low rounded-xl p-4 text-xs text-on-surface font-mono leading-relaxed max-h-60 overflow-y-auto overscroll-contain">
                        {promptExpanded
                          ? config.system_prompt
                          : `${config.system_prompt.slice(0, 280)}…`}
                        {config.system_prompt.length > 280 && (
                          <button
                            type="button"
                            onClick={() => setPromptExpanded((p) => !p)}
                            className="ml-2 text-secondary-brand font-bold font-headline text-[10px] uppercase tracking-widest hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-brand focus-visible:ring-offset-2 rounded"
                          >
                            {promptExpanded ? "Show less" : "Show more"}
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
                      <SectionLabel>Middleware ({config.middleware.length})</SectionLabel>
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
                          <span className="font-mono">{config.backend.root_dir}</span>
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
                          <div key={key} className="flex items-center justify-between text-xs">
                            <span className="font-mono text-on-surface break-all">{key}</span>
                            <span className="text-on-surface-variant ml-3 shrink-0">
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
                      <SectionLabel>MCP Servers ({config.mcp_servers.length})</SectionLabel>
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
                      <SectionLabel>Subagents ({config.subagents.length})</SectionLabel>
                      <div className="space-y-2">
                        {config.subagents.map((sub) => (
                          <div key={sub.name} className="bg-surface-container-low rounded-xl p-3">
                            <p className="text-sm font-medium text-on-surface">{sub.name}</p>
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
            </ScrollArea>
          )}
        </div>

        {/* Footer — view mode actions */}
        {mode === "view" && (
          <div className="shrink-0 px-6 sm:px-8 py-4 border-t border-outline-variant/30 bg-surface-container-lowest">
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={handleExportYaml} disabled={!config}>
                <span className="material-symbols-outlined text-sm mr-1" aria-hidden="true">
                  download
                </span>
                <span className="hidden sm:inline">Export YAML</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <Button type="button" onClick={() => setMode("edit")} disabled={!config}>
                <span className="material-symbols-outlined text-sm mr-1" aria-hidden="true">
                  edit
                </span>
                <span className="hidden sm:inline">Edit</span>
                <span className="sm:hidden">Edit</span>
              </Button>
              <div className="flex-1" />
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteAgent.isPending}
                className="px-6 py-2.5 h-10 rounded-full bg-destructive text-white font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 inline-flex items-center gap-2"
              >
                {confirmDelete ? "Confirm Delete?" : "Delete"}
              </button>
            </div>
          </div>
        )}

        {/* Edit mode footer is rendered by AgentConfigForm itself (desktop)
            and the inline mobile button above when editing. */}
      </DialogContent>
    </Dialog>
  );
}

function SectionLabel({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <h4 className="text-[10px] font-bold font-headline uppercase tracking-widest text-on-surface-variant mb-2">
      {children}
    </h4>
  );
}
