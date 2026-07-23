import { useCallback, memo } from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  type Control,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import type { AgentConfig, SubAgentConfig } from "@/domain/entities/agent/agentConfig";
import { BackendType, MiddlewareType } from "@/domain/entities/agent/agentConfig";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";
import type { McpServerConfig } from "@/domain/entities/agent/mcpServerConfig";
import {
  agentConfigSchema,
  type AgentConfigFormData,
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
import McpServerEditor from "./McpServerEditor";
import SubAgentEditor from "./SubAgentEditor";
import HITLEditor from "./HITLEditor";
import ResponseFormatEditor from "./ResponseFormatEditor";
import { AGENT_CONFIG_FORM_ID as FORM_ID } from "./formConstants";
import { cn } from "@/application/lib/utils";

type SectionValue =
  | "general"
  | "system-prompt"
  | "tools-middleware"
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
  "tools-middleware": { label: "Tools & Middleware" },
  backend: { label: "Backend" },
  hitl: { label: "HITL" },
  "memory-skills": { label: "Memory & Skills" },
  "mcp-servers": { label: "MCP Servers" },
  subagents: { label: "Subagents" },
  "response-format": { label: "Response Format" },
};

const MIDDLEWARE_OPTIONS: { label: string; value: MiddlewareType }[] = [
  { value: MiddlewareType.TODO_LIST, label: "todo_list" },
  { value: MiddlewareType.FILESYSTEM, label: "filesystem" },
  { value: MiddlewareType.SUB_AGENT, label: "sub_agent" },
];

const BACKEND_OPTIONS: { label: string; value: BackendType }[] = [
  { value: BackendType.STATE, label: "state" },
  { value: BackendType.STORE, label: "store" },
  { value: BackendType.FILESYSTEM, label: "filesystem" },
  { value: BackendType.COMPOSITE, label: "composite" },
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
  middleware: [],
  backend: { type: BackendType.STATE },
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

function showRootDir(type: BackendType): boolean {
  return type === BackendType.FILESYSTEM || type === BackendType.COMPOSITE;
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
    getValues,
    formState: { errors },
  } = useForm<AgentConfigFormData>({
    resolver: zodResolver(agentConfigSchema),
    defaultValues: getDefaultValues(mode, initialData),
  });

  const subagentsArray = useFieldArray({ control, name: "subagents" });

  // eslint-disable-next-line react-hooks/incompatible-library
  const backendType = useWatch({ control, name: "backend.type" });
  const middlewareValues = useWatch({ control, name: "middleware" });

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

  function toggleMiddleware(mw: MiddlewareType, isChecked: boolean) {
    const current = getValues("middleware");
    if (isChecked) {
      setValue("middleware", [...current, mw]);
    } else {
      setValue(
        "middleware",
        current.filter((m) => m !== mw),
      );
    }
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

        <AccordionItem value="tools-middleware">
          <SectionTrigger value="tools-middleware" />
          <AccordionContent className="space-y-4">
            <StringListEditor
              label="Tools"
              value={useWatch({ control, name: "tools" })}
              onChange={(tools) => setValue("tools", tools)}
              placeholder="Add tool…"
            />
            <div>
              <Label className="text-xs uppercase tracking-[0.1em]">Middleware</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {MIDDLEWARE_OPTIONS.map((opt) => {
                  const isActive = middlewareValues.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleMiddleware(opt.value, !isActive)}
                      aria-pressed={isActive}
                      className={cn(
                        "inline-flex h-8 items-center gap-2 border px-3 font-mono text-xs uppercase tracking-[0.1em] transition-[background-color,border-color,color] duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus",
                        isActive
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-transparent text-muted hover:bg-surface-warm hover:text-fg",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="backend">
          <SectionTrigger value="backend" />
          <AccordionContent className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-[0.1em]">Type</Label>
              <Select
                value={backendType}
                onValueChange={(v) => setValue("backend.type", v as BackendType)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BACKEND_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {showRootDir(backendType) && (
              <FormField id="backend-root-dir" label="Root Directory">
                <Input
                  id="backend-root-dir"
                  {...register("backend.root_dir")}
                  placeholder="/data/agents"
                  autoComplete="off"
                  spellCheck={false}
                />
              </FormField>
            )}
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
            <StringListEditor
              label="Memory"
              value={useWatch({ control, name: "memory" })}
              onChange={(memory) => setValue("memory", memory)}
              placeholder="Add memory path…"
            />
            <StringListEditor
              label="Skills"
              value={useWatch({ control, name: "skills" })}
              onChange={(skills) => setValue("skills", skills)}
              placeholder="Add skill…"
            />
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
  control: Control<AgentConfigFormData>;
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
