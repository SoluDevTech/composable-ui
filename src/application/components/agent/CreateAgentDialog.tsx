import { useState, useRef } from "react";
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
import AgentConfigForm from "./AgentConfigForm";
import type { AgentConfigFormData } from "@/domain/entities/agent/agentConfigSchema";
import type { AgentConfig } from "@/domain/entities/agent/agentConfig";
import { agentConfigToYamlFile } from "@/application/lib/yaml";

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
        {/* Header — description visible for hierarchy */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-outline-variant/30 shrink-0">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl">Create Agent</DialogTitle>
            <DialogDescription>
              Configure a new agent via form, or upload an existing YAML
              configuration.
            </DialogDescription>
          </DialogHeader>

          {/* Mode toggle */}
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

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 overscroll-contain">
          {mode === "form" ? (
            <AgentConfigForm
              mode="create"
              onSubmit={handleFormSubmit}
              onCancel={handleClose}
              isPending={createAgent.isPending}
            />
          ) : (
            <form
              id="agent-yaml-form"
              onSubmit={handleYamlSubmit}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="agent-name"
                  className="block text-[10px] font-bold font-headline uppercase tracking-widest text-on-surface-variant mb-2"
                >
                  Agent Name
                </label>
                <input
                  id="agent-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="my-agent…"
                  autoComplete="off"
                  spellCheck={false}
                  className="flex h-10 w-full rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface placeholder:text-outline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-brand/50 focus-visible:border-secondary-brand/60 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="agent-yaml"
                  className="block text-[10px] font-bold font-headline uppercase tracking-widest text-on-surface-variant mb-2"
                >
                  YAML Configuration
                </label>
                <input
                  id="agent-yaml"
                  ref={fileInputRef}
                  type="file"
                  accept=".yaml,.yml"
                  className="w-full text-sm text-on-surface-variant file:mr-4 file:px-4 file:py-2 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-surface-container file:text-on-surface-variant hover:file:bg-surface-container-high file:transition-colors file:cursor-pointer file:font-headline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-brand/50 rounded-lg"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer — sticky at bottom */}
        <div className="shrink-0 px-6 sm:px-8 py-4 border-t border-outline-variant/30 bg-surface-container-lowest flex items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 sm:flex-initial px-6 py-3 rounded-full border border-outline-variant/60 text-on-surface-variant font-headline text-xs font-bold uppercase tracking-widest hover:bg-surface-container transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-brand focus-visible:ring-offset-2"
          >
            Cancel
          </button>
          {mode === "form" ? (
            // The form triggers its own submit; we use a form attribute to bind.
            <button
              type="submit"
              form="agent-config-form"
              disabled={createAgent.isPending}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-full bg-primary-container text-white font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-brand focus-visible:ring-offset-2"
            >
              {createAgent.isPending ? "Creating…" : "Create Agent"}
            </button>
          ) : (
            <button
              type="submit"
              form="agent-yaml-form"
              disabled={createAgent.isPending}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-full bg-primary-container text-white font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-brand focus-visible:ring-offset-2"
            >
              {createAgent.isPending ? "Creating…" : "Create Agent"}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}