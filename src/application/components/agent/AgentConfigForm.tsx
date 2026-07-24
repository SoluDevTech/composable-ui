import { useCallback, memo } from "react";
import { useForm, useFieldArray, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import type { AgentConfig, SubAgentConfig } from "@/domain/entities/agent/agentConfig";
import { BackendType } from "@/domain/entities/agent/agentConfig";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";
import type { McpServerConfig } from "@/domain/entities/agent/mcpServerConfig";
import {
  agentConfigSchema,
  type AgentConfigFormData,
  type AgentConfigFormInput,
} from "@/domain/entities/agent/agentConfigSchema";
import { Button } from "@/application/components/ui/button";
import { Input } from "@/application/components/ui/input";
import { Label } from "@/application/components/ui/label";
import { Switch } from "@/application/components/ui/switch";
import { Textarea } from "@/application/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/application/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/application/components/ui/select";
import StringListEditor from "./StringListEditor";
import { SkillPillMultiSelect, MemoryPillMultiSelect } from "./SkillMemorySelects";
import McpServerEditor from "./McpServerEditor";
import SubAgentEditor from "./SubAgentEditor";
import HITLEditor from "./HITLEditor";
import ResponseFormatEditor from "./ResponseFormatEditor";
import { AGENT_CONFIG_FORM_ID as FORM_ID } from "./formConstants";

type SectionValue =
  | "general"
  | "system-prompt"
  | "tools"
  | "backend"
  | "hitl"
  | "memory-skills"
  | "mcp-servers"
  | "subagents"
  | "response-format";

const DEFAULT_OPEN_SECTIONS: SectionValue[] = ["general", "system-prompt"];

const SECTION_META: Record<SectionValue, { label: string }> = {
  general: { label: "General" },
  "system-prompt": { label: "System Prompt" },
  tools: { label: "Tools" },
  backend: { label: "Backend" },
  hitl: { label: "HITL" },
  "memory-skills": { label: "Memory & Skills" },
  "mcp-servers": { label: "MCP Servers" },
  subagents: { label: "Subagents" },
  "response-format": { label: "Response Format" },
};

const BACKEND_STORAGE_OPTIONS: { label: string; value: "memory" | "postgres" }[] = [
  { value: "memory", label: "memory" },
  { value: "postgres", label: "postgres" },
];

const EMPTY_MCP_SERVER: McpServerConfig = {
  name: "",
  transport: McpTransportType.STDIO,
  command: undefined,
  args: [],
  url: undefined,
  headers: {},
  env: {},
  auth_token: undefined,
};

const EMPTY_SUBAGENT: SubAgentConfig = {
  name: "",
  description: "",
  instructions: undefined,
  model: undefined,
  tools: [],
  skills: [],
  mcp_servers: [],
  response_format: undefined,
};

const DEFAULT_FORM_VALUES: AgentConfigFormData = {
  name: "",
  model: "",
  system_prompt: "",
  system_prompt_file: "",
  tools: [],
  backend: {
    type: BackendType.STORE,
    checkpoint_backend: "memory",
  },
  hitl: { rules: {} },
  memory: [],
  skills: [],
  subagents: [],
  mcp_servers: [],
  response_format: undefined,
  debug: false,
};

function getDefaultValues(mode: "create" | "edit", initialData?: AgentConfig): AgentConfigFormData {
  if (mode === "edit" && initialData) {
    return {
      ...DEFAULT_FORM_VALUES,
      ...initialData,
      system_prompt: initialData.system_prompt ?? "",
      system_prompt_file: initialData.system_prompt_file ?? "",
      response_format: initialData.response_format ?? undefined,
    };
  }
  return { ...DEFAULT_FORM_VALUES };
}

interface AgentConfigFormProps {
  mode: "create" | "edit";
  initialData?: AgentConfig;
  onSubmit: (data: AgentConfigFormData) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export default function AgentConfigForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isPending = false,
}: Readonly<AgentConfigFormProps>) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<AgentConfigFormInput, unknown, AgentConfigFormData>({
    resolver: zodResolver(agentConfigSchema),
    defaultValues: getDefaultValues(mode, initialData),
  });

  const subagentsArray = useFieldArray({ control, name: "subagents" });

  const checkpointBackend = useWatch({ control, name: "backend.checkpoint_backend" });

  function handleFormSubmit(data: AgentConfigFormData) {
    const cleaned: AgentConfigFormData = {
      ...data,
      system_prompt: data.system_prompt || undefined,
      system_prompt_file: data.system_prompt_file || undefined,
      response_format: data.response_format ?? undefined,
    };
    onSubmit(cleaned);
  }

  function addSubagent() {
    subagentsArray.append({ ...EMPTY_SUBAGENT });
  }

  return (
    <form id={FORM_ID} onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col">
      <Accordion
        type="multiple"
        defaultValue={DEFAULT_OPEN_SECTIONS as never}
        className="space-y-1"
      >
        <AccordionItem value="general">
          <SectionTrigger value="general" />
          <AccordionContent className="space-y-4">
            <FormField id="agent-name" label="Agent Name" error={errors.name?.message}>
              <Input
                id="agent-name"
                {...register("name")}
                disabled={mode === "edit"}
                placeholder="my-agent…"
                autoComplete="off"
                aria-invalid={!!errors.name}
              />
            </FormField>
            <FormField id="model" label="Model" error={errors.model?.message}>
              <Input
                id="model"
                {...register("model")}
                placeholder="openai:anthropic/claude-haiku-4.5:nitro"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={!!errors.model}
              />
            </FormField>
            <div className="flex items-center gap-3">
              <Label htmlFor="debug" className="text-xs uppercase tracking-[0.1em]">
                Debug
              </Label>
              <Switch
                id="debug"
                checked={useWatch({ control, name: "debug" })}
                onCheckedChange={(v) => setValue("debug", v)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="system-prompt">
          <SectionTrigger value="system-prompt" />
          <AccordionContent className="space-y-4">
            <FormField id="system-prompt" label="System Prompt">
              <Textarea
                id="system-prompt"
                {...register("system_prompt")}
                placeholder="You are a helpful assistant…"
                rows={6}
                className="font-mono text-xs"
              />
            </FormField>
            <FormField id="system-prompt-file" label="System Prompt File">
              <Input
                id="system-prompt-file"
                {...register("system_prompt_file")}
                placeholder="/prompts/system.txt (optional)…"
                autoComplete="off"
                spellCheck={false}
              />
            </FormField>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tools">
          <SectionTrigger value="tools" />
          <AccordionContent className="space-y-4">
            <StringListEditor
              label="Tools"
              value={useWatch({ control, name: "tools" })}
              onChange={(tools) => setValue("tools", tools)}
              placeholder="Add tool…"
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="backend">
          <SectionTrigger value="backend" />
          <AccordionContent className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-[0.1em]">Backend Type</Label>
              <p className="mt-1.5 font-mono text-sm text-accent">store</p>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.1em]">Checkpoint Backend</Label>
              <Select
                value={checkpointBackend}
                onValueChange={(v) =>
                  setValue("backend.checkpoint_backend", v as "memory" | "postgres")
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BACKEND_STORAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="hitl">
          <SectionTrigger value="hitl" />
          <AccordionContent className="space-y-4">
            <HITLEditor
              value={useWatch({ control, name: "hitl.rules" })}
              onChange={(rules) => setValue("hitl.rules", rules)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="memory-skills">
          <SectionTrigger value="memory-skills" />
          <AccordionContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.1em] text-muted">Memory</Label>
              <MemoryPillMultiSelect
                selected={useWatch({ control, name: "memory" })}
                onChange={(memory) => setValue("memory", memory)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.1em] text-muted">Skills</Label>
              <SkillPillMultiSelect
                selected={useWatch({ control, name: "skills" })}
                onChange={(skills) => setValue("skills", skills)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <McpServersAccordionItem control={control} defaultValue={DEFAULT_OPEN_SECTIONS} />

        <AccordionItem value="subagents">
          <SectionTrigger value="subagents" />
          <AccordionContent className="space-y-4">
            {subagentsArray.fields.map((field, index) => (
              <SubAgentEditor
                key={field.id}
                index={index}
                value={field as unknown as SubAgentConfig}
                onChange={(v) => subagentsArray.update(index, v)}
                onRemove={() => subagentsArray.remove(index)}
              />
            ))}
            <AddButton onClick={addSubagent} label="Add Subagent" />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="response-format">
          <SectionTrigger value="response-format" />
          <AccordionContent className="space-y-4">
            <ResponseFormatEditor
              value={useWatch({ control, name: "response_format" })}
              onChange={(v) => setValue("response_format", v)}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="h-2" aria-hidden="true" />

      <div className="mt-6 hidden items-center justify-end gap-3 border-t border-border-soft pt-4 lg:flex">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : mode === "create" ? "Create" : "Update"}
        </Button>
      </div>
    </form>
  );
}

function SectionTrigger({ value }: Readonly<{ value: SectionValue }>) {
  const meta = SECTION_META[value];
  return (
    <AccordionTrigger className="font-mono text-xs uppercase tracking-[0.1em] text-muted hover:text-accent data-[state=open]:text-accent">
      {meta.label}
    </AccordionTrigger>
  );
}

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}

function FormField({ id, label, error, children }: Readonly<FormFieldProps>) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div>
      <Label htmlFor={id} className="mb-2 block text-xs uppercase tracking-[0.1em]">
        {label}
      </Label>
      <div aria-invalid={!!error} aria-describedby={errorId}>
        {children}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 font-mono text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

interface AddButtonProps {
  onClick: () => void;
  label: string;
}

function AddButton({ onClick, label }: Readonly<AddButtonProps>) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick} className="w-full">
      <Plus className="h-4 w-4" aria-hidden="true" />
      {label}
    </Button>
  );
}

// Isolated MCP servers accordion item: owns its useFieldArray AND the
// AccordionItem so the parent form's re-renders (triggered by useWatch on
// unrelated fields) do NOT remount the McpServerEditor instances and steal
// input focus. The whole AccordionItem is memoized so it only re-renders when
// the MCP servers array itself changes.
const McpServersAccordionItem = memo(function McpServersAccordionItem({
  control,
  defaultValue,
}: Readonly<{
  control: Control<AgentConfigFormInput>;
  defaultValue: SectionValue[];
}>) {
  const mcpServersArray = useFieldArray({ control, name: "mcp_servers" });
  const isOpen = defaultValue.includes("mcp-servers");
  const addMcpServer = useCallback(
    () => mcpServersArray.append({ ...EMPTY_MCP_SERVER }),
    [mcpServersArray],
  );
  const updateMcpServer = useCallback(
    (index: number, v: McpServerConfig) => mcpServersArray.update(index, v),
    [mcpServersArray],
  );
  const removeMcpServer = useCallback(
    (index: number) => mcpServersArray.remove(index),
    [mcpServersArray],
  );
  return (
    <AccordionItem value="mcp-servers">
      <SectionTrigger value="mcp-servers" />
      <AccordionContent className="space-y-4" data-state={isOpen ? "open" : "closed"}>
        {mcpServersArray.fields.map((field, index) => (
          <McpServerEditor
            key={field.id}
            value={field as unknown as McpServerConfig}
            onChange={(v) => updateMcpServer(index, v)}
            onRemove={() => removeMcpServer(index)}
          />
        ))}
        <AddButton onClick={addMcpServer} label="Add MCP Server" />
      </AccordionContent>
    </AccordionItem>
  );
});
