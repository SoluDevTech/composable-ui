import { useState } from "react";
import { toast } from "sonner";
import { Download, Pencil, Trash2 } from "lucide-react";
import { useAgentConfig } from "@/application/hooks/agent/useAgentConfig";
import { useUpdateAgent } from "@/application/hooks/agent/useUpdateAgent";
import { useDeleteAgent } from "@/application/hooks/agent/useDeleteAgent";
import { serializeAgentConfig, agentConfigToYamlFile } from "@/application/lib/yaml";
import type { AgentConfig } from "@/domain/entities/agent/agentConfig";
import type { AgentConfigFormData } from "@/domain/entities/agent/agentConfigSchema";
import { Badge } from "@/application/components/ui/badge";
import ToolTag from "@/application/components/shared/ToolTag";
import { SkillPillMultiSelect, MemoryPillMultiSelect } from "./SkillMemorySelects";
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
        <div className="shrink-0 border-b border-border bg-surface px-6 pb-4 pt-6 sm:px-8">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="font-display text-lg">{agentName}</DialogTitle>
            <DialogDescription className="text-sm text-muted">
              {mode === "edit"
                ? "Edit the agent configuration below, then save your changes."
                : "View the agent configuration. Use Edit to modify or Export to download YAML."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overscroll-contain overflow-y-auto overflow-x-hidden bg-surface px-6 py-6 sm:px-8">
          {mode === "edit" && config ? (
            <>
              <AgentConfigForm
                mode="edit"
                initialData={config}
                onSubmit={handleEditSubmit}
                onCancel={() => setMode("view")}
                isPending={updateAgent.isPending}
              />
              <div className="mt-4 flex items-center gap-3 border-t border-border-soft pt-4 lg:hidden">
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
                <p className="py-8 text-center font-mono text-sm text-muted" aria-live="polite">
                  Loading configuration…
                </p>
              )}

              {error && (
                <p className="py-8 text-center font-mono text-sm text-danger">
                  Failed to load configuration: {error.message}
                </p>
              )}

              {config && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <SectionLabel>Model</SectionLabel>
                      <p className="break-all font-mono text-sm text-fg">{config.model}</p>
                    </div>
                  </div>

                  {config.description && (
                    <div>
                      <SectionLabel>Description</SectionLabel>
                      <p className="break-all font-mono text-sm text-fg-2">{config.description}</p>
                    </div>
                  )}

                  {config.system_prompt && (
                    <div>
                      <SectionLabel>System Prompt</SectionLabel>
                      <div className="max-h-60 overscroll-contain overflow-y-auto border border-border-soft bg-surface-warm p-3 font-mono text-xs leading-relaxed text-fg-2">
                        {promptExpanded
                          ? config.system_prompt
                          : `${config.system_prompt.slice(0, 280)}…`}
                        {config.system_prompt.length > 280 && (
                          <button
                            type="button"
                            onClick={() => setPromptExpanded((p) => !p)}
                            className="ml-2 font-mono text-xs uppercase tracking-[0.1em] text-accent hover:text-accent-hover focus-visible:outline-none focus-visible:shadow-focus"
                          >
                            {promptExpanded ? "Show less" : "Show more"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <SectionLabel>Backend</SectionLabel>
                    <div className="space-y-1 font-mono text-sm text-fg">
                      <p>
                        checkpoint_backend:{" "}
                        <span className="text-accent">{config.backend.checkpoint_backend}</span>
                      </p>
                    </div>
                  </div>

                  {config.skills.length > 0 && (
                    <div>
                      <SectionLabel>Skills ({config.skills.length})</SectionLabel>
                      <SkillPillMultiSelect selected={config.skills} readOnly />
                    </div>
                  )}

                  {config.memory.length > 0 && (
                    <div>
                      <SectionLabel>Memories ({config.memory.length})</SectionLabel>
                      <MemoryPillMultiSelect selected={config.memory} readOnly />
                    </div>
                  )}

                  {Object.keys(config.hitl.rules).length > 0 && (
                    <div>
                      <SectionLabel>HITL Rules</SectionLabel>
                      <div className="space-y-1 border border-border-soft bg-surface-warm p-3">
                        {Object.entries(config.hitl.rules).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between font-mono text-xs"
                          >
                            <span className="break-all text-fg">{key}</span>
                            <span className="ml-3 shrink-0 text-muted">
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

                  {config.mcp_servers.length > 0 && (
                    <div>
                      <SectionLabel>MCP Servers ({config.mcp_servers.length})</SectionLabel>
                      <div className="space-y-2">
                        {config.mcp_servers.map((server) => (
                          <div
                            key={server.name}
                            className="flex items-center justify-between border border-border-soft bg-surface-warm p-3"
                          >
                            <span className="font-mono text-sm text-fg">{server.name}</span>
                            <ToolTag label={server.transport} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {config.subagents.length > 0 && (
                    <div>
                      <SectionLabel>Subagents ({config.subagents.length})</SectionLabel>
                      <div className="space-y-2">
                        {config.subagents.map((sub) => (
                          <div
                            key={sub.name}
                            className="border border-border-soft bg-surface-warm p-3"
                          >
                            <div className="flex items-center gap-2">
                              <p className="font-mono text-sm text-fg">{sub.name}</p>
                              {sub.agent_ref && (
                                <Badge variant="outline">ref: {sub.agent_ref}</Badge>
                              )}
                            </div>
                            <p className="mt-1 font-mono text-xs text-muted">{sub.description}</p>
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

        {mode === "view" && (
          <div className="shrink-0 border-t border-border bg-surface px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleExportYaml}
                disabled={!config}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Export YAML</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={() => setMode("edit")}
                disabled={!config}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Edit</span>
                <span className="sm:hidden">Edit</span>
              </Button>
              <div className="flex-1" />
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteAgent.isPending}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {confirmDelete ? "Confirm Delete?" : "Delete"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SectionLabel({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <h4 className="mb-2 font-mono text-xs uppercase tracking-[0.1em] text-muted">{children}</h4>
  );
}
