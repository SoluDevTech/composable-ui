import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

// ─── Constants ──────────────────────────────────────────────────────────────

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

// Only essential sections are open by default, others can be revealed on demand.
const DEFAULT_OPEN_SECTIONS: SectionValue[] = ["general", "system-prompt"];

const SECTION_META: Record<SectionValue, { label: string; icon: string }> = {
  general: { label: "General", icon: "tune" },
  "system-prompt": { label: "System Prompt", icon: "description" },
  "tools-middleware": { label: "Tools & Middleware", icon: "build" },
  backend: { label: "Backend", icon: "storage" },
  hitl: { label: "HITL", icon: "verified_user" },
  "memory-skills": { label: "Memory & Skills", icon: "psychology" },
  "mcp-servers": { label: "MCP Servers", icon: "hub" },
  subagents: { label: "Subagents", icon: "group" },
  "response-format": { label: "Response Format", icon: "data_object" },
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

// ─── Helpers ────────────────────────────────────────────────────────────────

function cn(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

function buildAccordionTriggerClass(): string {
  return cn(
    "text-xs font-bold font-headline uppercase tracking-widest",
    "text-on-surface hover:text-secondary-brand",
    "data-[state=open]:text-secondary-brand",
  );
}

function showRootDir(type: BackendType): boolean {
  return type === BackendType.FILESYSTEM || type === BackendType.COMPOSITE;
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface AgentConfigFormProps {
  mode: "create" | "edit";
  initialData?: AgentConfig;
  onSubmit: (data: AgentConfigFormData) => void;
  onCancel: () => void;
  isPending?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────

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
    watch,
    formState: { errors },
  } = useForm<AgentConfigFormData>({
    resolver: zodResolver(agentConfigSchema),
    defaultValues: getDefaultValues(mode, initialData),
  });

  const mcpServersArray = useFieldArray({ control, name: "mcp_servers" });
  const subagentsArray = useFieldArray({ control, name: "subagents" });

  // eslint-disable-next-line react-hooks/incompatible-library
  const backendType = watch("backend.type");
  const middlewareValues = watch("middleware");

  function handleFormSubmit(data: AgentConfigFormData) {
    const cleaned: AgentConfigFormData = {
      ...data,
      system_prompt: data.system_prompt || undefined,
      system_prompt_file: data.system_prompt_file || undefined,
      response_format: data.response_format ?? undefined,
    };
    onSubmit(cleaned);
  }

  function addMcpServer() {
    mcpServersArray.append({ ...EMPTY_MCP_SERVER });
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
    <form
      id={FORM_ID}
      onSubmit={handleSubmit(handleFormSubmit)}
      // The parent dialog handles the footer; this form is purely the scrollable body.
      className="flex flex-col"
    >
      <Accordion
        type="multiple"
        defaultValue={DEFAULT_OPEN_SECTIONS as never}
        className="space-y-1"
      >
        {/* General */}
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
              <Label htmlFor="debug" className="text-on-surface text-sm">
                Debug
              </Label>
              <Switch
                id="debug"
                checked={watch("debug")}
                onCheckedChange={(v) => setValue("debug", v)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* System Prompt */}
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

        {/* Tools & Middleware */}
        <AccordionItem value="tools-middleware">
          <SectionTrigger value="tools-middleware" />
          <AccordionContent className="space-y-4">
            <StringListEditor
              label="Tools"
              value={watch("tools")}
              onChange={(tools) => setValue("tools", tools)}
              placeholder="Add tool…"
            />
            <div>
              <Label className="text-on-surface text-sm">Middleware</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {MIDDLEWARE_OPTIONS.map((opt) => {
                  const isActive = middlewareValues.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleMiddleware(opt.value, !isActive)}
                      aria-pressed={isActive}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-bold font-headline uppercase tracking-widest border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-brand focus-visible:ring-inset",
                        isActive
                          ? "bg-secondary-brand text-white border-secondary-brand"
                          : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high",
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

        {/* Backend */}
        <AccordionItem value="backend">
          <SectionTrigger value="backend" />
          <AccordionContent className="space-y-4">
            <div>
              <Label className="text-on-surface text-sm">Type</Label>
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

        {/* HITL */}
        <AccordionItem value="hitl">
          <SectionTrigger value="hitl" />
          <AccordionContent className="space-y-4">
            <HITLEditor
              value={watch("hitl.rules")}
              onChange={(rules) => setValue("hitl.rules", rules)}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Memory & Skills */}
        <AccordionItem value="memory-skills">
          <SectionTrigger value="memory-skills" />
          <AccordionContent className="space-y-4">
            <StringListEditor
              label="Memory"
              value={watch("memory")}
              onChange={(memory) => setValue("memory", memory)}
              placeholder="Add memory path…"
            />
            <StringListEditor
              label="Skills"
              value={watch("skills")}
              onChange={(skills) => setValue("skills", skills)}
              placeholder="Add skill…"
            />
          </AccordionContent>
        </AccordionItem>

        {/* MCP Servers */}
        <AccordionItem value="mcp-servers">
          <SectionTrigger value="mcp-servers" />
          <AccordionContent className="space-y-4">
            {mcpServersArray.fields.map((field, index) => (
              <McpServerEditor
                key={field.id}
                value={field as unknown as McpServerConfig}
                onChange={(v) => mcpServersArray.update(index, v)}
                onRemove={() => mcpServersArray.remove(index)}
              />
            ))}
            <AddButton onClick={addMcpServer} label="Add MCP Server" />
          </AccordionContent>
        </AccordionItem>

        {/* Subagents */}
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

        {/* Response Format */}
        <AccordionItem value="response-format">
          <SectionTrigger value="response-format" />
          <AccordionContent className="space-y-4">
            <ResponseFormatEditor
              value={watch("response_format")}
              onChange={(v) => setValue("response_format", v)}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Hidden section separator that adds breathing room below last fold */}
      <div className="h-2" aria-hidden="true" />

      {/* Local Cancel + Submit (hidden on mobile where dialog footer is used)
          Kept for embedded usage in AgentConfigViewer where no dialog footer exists. */}
      <div className="hidden lg:flex items-center justify-end gap-3 mt-6 pt-4 border-t border-outline-variant/30">
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

// ─── Small helpers ─────────────────────────────────────────────────────────

function SectionTrigger({ value }: Readonly<{ value: SectionValue }>) {
  const meta = SECTION_META[value];
  return (
    <AccordionTrigger className={buildAccordionTriggerClass()}>
      <span className="flex items-center gap-2">
        <span className="material-symbols-outlined text-sm text-secondary-brand" aria-hidden="true">
          {meta.icon}
        </span>
        {meta.label}
      </span>
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
      <Label
        htmlFor={id}
        className="text-[10px] font-bold font-headline uppercase tracking-widest text-on-surface-variant mb-2 block"
      >
        {label}
      </Label>
      <div aria-invalid={!!error} aria-describedby={errorId}>
        {children}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-destructive text-xs mt-1.5">
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
      <span className="material-symbols-outlined text-sm mr-1" aria-hidden="true">
        add
      </span>
      {label}
    </Button>
  );
}
