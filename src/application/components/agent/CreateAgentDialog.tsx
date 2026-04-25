import { useState, useRef } from "react";
import { toast } from "sonner";
import { useCreateAgent } from "@/application/hooks/agent/useCreateAgent";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/application/components/ui/tabs";
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

export default function CreateAgentDialog({
  open,
  onOpenChange,
}: Readonly<CreateAgentDialogProps>) {
  const [tab, setTab] = useState("form");
  const [name, setName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createAgent = useCreateAgent();

  function handleClose() {
    setTab("form");
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
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  }

  function handleYamlSubmit(e: { preventDefault: () => void }) {
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
          setName("");
          if (fileInputRef.current) fileInputRef.current.value = "";
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl font-bold text-on-surface">
            Create Agent
          </DialogTitle>
          <DialogDescription className="sr-only">
            Create a new agent via form or YAML upload
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="form" className="flex-1">
              Form
            </TabsTrigger>
            <TabsTrigger value="yaml" className="flex-1">
              Upload YAML
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="mt-4">
            <AgentConfigForm
              mode="create"
              onSubmit={handleFormSubmit}
              onCancel={handleClose}
              isPending={createAgent.isPending}
            />
          </TabsContent>

          <TabsContent value="yaml" className="mt-4">
            <form onSubmit={handleYamlSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="agent-name"
                  className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2"
                >
                  Agent Name
                </label>
                <input
                  id="agent-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="my-agent"
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary-brand/40 transition-shadow"
                />
              </div>

              <div>
                <label
                  htmlFor="agent-yaml"
                  className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2"
                >
                  YAML Configuration
                </label>
                <input
                  id="agent-yaml"
                  ref={fileInputRef}
                  type="file"
                  accept=".yaml,.yml"
                  className="w-full text-sm text-on-surface-variant file:mr-4 file:px-4 file:py-2 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-surface-container file:text-on-surface-variant hover:file:bg-surface-container-high file:transition-colors file:cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 rounded-full border border-outline-variant/30 text-on-surface-variant font-headline text-xs font-bold uppercase tracking-widest hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAgent.isPending}
                  className="flex-1 px-6 py-3 rounded-full bg-primary-container text-white font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {createAgent.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
