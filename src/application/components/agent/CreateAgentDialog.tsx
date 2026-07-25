import { useState, useRef } from "react";
import { FileUp } from "lucide-react";
import { toast } from "sonner";
import { useCreateAgent } from "@/application/hooks/agent/useCreateAgent";
import SegmentedToggle from "@/application/components/shared/SegmentedToggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/application/components/ui/dialog";
import { Button } from "@/application/components/ui/button";
import { Input } from "@/application/components/ui/input";
import { Label } from "@/application/components/ui/label";
import AgentConfigForm from "./AgentConfigForm";
import type { AgentConfigFormData } from "@/domain/entities/agent/agentConfigSchema";
import type { AgentConfig } from "@/domain/entities/agent/agentConfig";
import { agentConfigToYamlFile } from "@/application/lib/yaml";
import { AGENT_CONFIG_FORM_ID, AGENT_YAML_FORM_ID } from "./formConstants";

interface CreateAgentDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

type CreateMode = "form" | "yaml";

const MODE_OPTIONS = [
  { value: "form" as const, label: "Form" },
  { value: "yaml" as const, label: "Upload YAML" },
];

export default function CreateAgentDialog({
  open,
  onOpenChange,
}: Readonly<CreateAgentDialogProps>) {
  const [mode, setMode] = useState<CreateMode>("form");
  const [name, setName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createAgent = useCreateAgent();

  function handleClose() {
    setMode("form");
    setName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onOpenChange(false);
  }

  function handleFormSubmit(data: AgentConfigFormData) {
    const config: AgentConfig = {
      ...data,
      system_prompt: data.system_prompt || undefined,
      system_prompt_file: data.system_prompt_file || undefined,
      response_format: data.response_format || undefined,
    };

    const file = agentConfigToYamlFile(config, `${config.name}.yaml`);
    createAgent.mutate(
      { name: config.name, yamlFile: file },
      {
        onSuccess: () => {
          toast.success("Agent created successfully");
          handleClose();
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  }

  function handleYamlSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!name.trim()) {
      toast.error("Agent name is required");
      return;
    }
    if (!file) {
      toast.error("YAML configuration file is required");
      return;
    }
    createAgent.mutate(
      { name: name.trim(), yamlFile: file },
      {
        onSuccess: () => {
          toast.success("Agent created successfully");
          handleClose();
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
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
          <DialogHeader className="space-y-2">
            <DialogTitle className="font-display text-lg">Create Agent</DialogTitle>
            <DialogDescription className="text-sm text-muted">
              Configure a new agent via form, or upload an existing YAML configuration.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <SegmentedToggle
              value={mode}
              options={MODE_OPTIONS}
              onChange={(v) => setMode(v as CreateMode)}
              pattern="toggle"
              ariaLabel="Creation mode"
              itemClassName="px-6 py-1.5 text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overscroll-contain overflow-y-auto overflow-x-hidden bg-surface px-6 py-6 sm:px-8">
          {mode === "form" ? (
            <AgentConfigForm
              mode="create"
              onSubmit={handleFormSubmit}
              onCancel={handleClose}
              isPending={createAgent.isPending}
            />
          ) : (
            <form id={AGENT_YAML_FORM_ID} onSubmit={handleYamlSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="agent-name"
                  className="mb-2 block text-xs uppercase tracking-[0.1em]"
                >
                  Agent Name
                </Label>
                <Input
                  id="agent-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="my-agent…"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <div>
                <Label
                  htmlFor="agent-yaml"
                  className="mb-2 block text-xs uppercase tracking-[0.1em]"
                >
                  YAML Configuration
                </Label>
                <div className="flex flex-col items-center gap-2 border-2 border-dashed border-border bg-surface-warm/50 p-6 text-center transition-[border-color] duration-fast ease-standard hover:border-accent">
                  <FileUp className="h-8 w-8 text-muted" aria-hidden="true" />
                  <span className="font-mono text-xs text-muted">.yml · .yaml</span>
                  <input
                    id="agent-yaml"
                    ref={fileInputRef}
                    type="file"
                    accept=".yaml,.yml"
                    className="mt-2 block w-full text-sm text-muted file:mr-4 file:border-0 file:bg-surface-warm file:px-3 file:py-1.5 file:font-mono file:text-xs file:uppercase file:tracking-[0.1em] file:text-fg hover:file:bg-surface-warm/80"
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3 border-t border-border bg-surface px-6 py-4 sm:px-8">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <div className="flex-1" />
          {mode === "form" ? (
            <Button type="submit" form={AGENT_CONFIG_FORM_ID} disabled={createAgent.isPending}>
              {createAgent.isPending ? "Creating…" : "Create Agent"}
            </Button>
          ) : (
            <Button type="submit" form={AGENT_YAML_FORM_ID} disabled={createAgent.isPending}>
              {createAgent.isPending ? "Creating…" : "Create Agent"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
