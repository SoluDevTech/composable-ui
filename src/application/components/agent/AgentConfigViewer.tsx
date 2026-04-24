import { useState } from "react";
import { toast } from "sonner";
import { useAgentConfig } from "@/application/hooks/agent/useAgentConfig";
import { useUpdateAgent } from "@/application/hooks/agent/useUpdateAgent";
import { useDeleteAgent } from "@/application/hooks/agent/useDeleteAgent";
import { serializeAgentConfig } from "@/application/lib/yaml";
import type { AgentConfig } from "@/domain/entities/agent/agentConfig";
import type { AgentConfigFormData } from "@/domain/entities/agent/agentConfigSchema";
import { agentConfigToYamlFile } from "@/application/lib/yaml";
import StatusBadge from "@/application/components/shared/StatusBadge";
import ToolTag from "@/application/components/shared/ToolTag";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/application/components/ui/dialog";
import { Button } from "@/application/components/ui/button";
import { ScrollArea } from "@/application/components/ui/scroll-area";
import { Separator } from "@/application/components/ui/separator";
import AgentConfigForm from "./AgentConfigForm";

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
  const {
    data: config,
    isLoading,
    error,
  } = useAgentConfig(open ? agentName : null);
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
    document.body.removeChild(a);
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
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl font-bold text-on-surface">
            {agentName}
          </DialogTitle>
        </DialogHeader>

        {mode === "edit" && config ? (
          <AgentConfigForm
            mode="edit"
            initialData={config}
            onSubmit={handleEditSubmit}
            onCancel={() => setMode("view")}
            isPending={updateAgent.isPending}
          />
        ) : (
          <ScrollArea className="max-h-[70vh]">
            {isLoading && (
              <p className="text-on-surface-variant text-sm py-8 text-center">
                Loading configuration...
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
                    Type:{" "}
                    <span className="font-mono">{config.backend.type}</span>
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
                          <span className="font-mono text-on-surface">
                            {key}
                          </span>
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
          </ScrollArea>
        )}

        {/* Actions */}
        <Separator />
        <div className="flex items-center gap-3">
          {mode === "view" && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleExportYaml}
                disabled={!config}
                className="px-6 py-3 rounded-full font-headline text-xs font-bold uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-sm mr-1">
                  download
                </span>
                Export YAML
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setMode("edit");
                  setConfirmDelete(false);
                }}
                disabled={!config}
                className="px-6 py-3 rounded-full bg-primary-container text-white font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm mr-1">
                  edit
                </span>
                Edit
              </Button>
              <div className="flex-1" />
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteAgent.isPending}
                className="px-6 py-3 rounded-full bg-red-600 text-white font-headline text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {confirmDelete ? "Confirm Delete?" : "Delete"}
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionLabel({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
      {children}
    </h4>
  );
}
