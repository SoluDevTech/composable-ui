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
import { Separator } from "@/application/components/ui/separator";
import StringListEditor from "./StringListEditor";
import McpServerEditor from "./McpServerEditor";
import SubAgentEditor from "./SubAgentEditor";
import HITLEditor from "./HITLEditor";
import ResponseFormatEditor from "./ResponseFormatEditor";

// ─── Constants ──────────────────────────────────────────────────────────────

const ACCORDION_SECTIONS = [
  "general",
  "system-prompt",
  "tools-middleware",
  "backend",
  "hitl",
  "memory-skills",
  "mcp-servers",
  "subagents",
  "response-format",
] as const;

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

function getDefaultValues(
  mode: "create" | "edit",
  initialData?: AgentConfig,
): AgentConfigFormData {
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

function buildAccordionTriggerClass(active?: boolean): string {
  return cn(
    "text-xs font-bold font-headline uppercase tracking-widest hover:no-underline",
    active
      ? "text-secondary-brand"
      : "text-on-surface-variant",
  );
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

  function renderSubmitLabel(): string {
    if (isPending) return "Saving...";
    return mode === "create" ? "Create" : "Update";
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col max-h-[70vh]"
    >
      <div className="flex-1 overflow-y-auto pr-4">
        <div className="space-y-2">
          <Accordion type="multiple" defaultValue={[...ACCORDION_SECTIONS]}>
            {/* General */}
            <AccordionItem value="general">
              <AccordionTrigger className={buildAccordionTriggerClass()}>
                General
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <FormField
                  id="agent-name"
                  label="Agent Name"
                  error={errors.name?.message}
                >
                  <Input
                    id="agent-name"
                    {...register("name")}
                    disabled={mode === "edit"}
                    placeholder="my-agent"
                    aria-invalid={!!errors.name}
                  />
                </FormField>
                <FormField
                  id="model"
                  label="Model"
                  error={errors.model?.message}
                >
                  <Input
                    id="model"
                    {...register("model")}
                    placeholder="openai:anthropic/claude-haiku-4.5:nitro"
                    aria-invalid={!!errors.model}
                  />
                </FormField>
                <div className="flex items-center gap-3">
                  <Label htmlFor="debug" className="text-on-surface">
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
              <AccordionTrigger className={buildAccordionTriggerClass()}>
                System Prompt
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <FormField id="system-prompt" label="System Prompt">
                  <Textarea
                    id="system-prompt"
                    {...register("system_prompt")}
                    placeholder="You are a helpful assistant..."
                    rows={6}
                  />
                </FormField>
                <FormField
                  id="system-prompt-file"
                  label="System Prompt File"
                >
                  <Input
                    id="system-prompt-file"
                    {...register("system_prompt_file")}
                    placeholder="/prompts/system.txt (optional)"
                  />
                </FormField>
              </AccordionContent>
            </AccordionItem>

            {/* Tools & Middleware */}
            <AccordionItem value="tools-middleware">
              <AccordionTrigger className={buildAccordionTriggerClass()}>
                Tools &amp; Middleware
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <StringListEditor
                  label="Tools"
                  value={watch("tools")}
                  onChange={(tools) => setValue("tools", tools)}
                  placeholder="Add tool..."
                />
                <div>
                  <Label className="text-on-surface">Middleware</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {MIDDLEWARE_OPTIONS.map((opt) => {
                      const isActive = middlewareValues.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            toggleMiddleware(opt.value, !isActive)
                          }
                          aria-pressed={isActive}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-bold font-headline uppercase tracking-widest border transition-colors",
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
              <AccordionTrigger className={buildAccordionTriggerClass()}>
                Backend
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div>
                  <Label className="text-on-surface">Type</Label>
                  <Select
                    value={backendType}
                    onValueChange={(v) =>
                      setValue("backend.type", v as BackendType)
                    }
                  >
                    <SelectTrigger className="mt-1">
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
                  <FormField
                    id="backend-root-dir"
                    label="Root Directory"
                  >
                    <Input
                      id="backend-root-dir"
                      {...register("backend.root_dir")}
                      placeholder="/data/agents"
                    />
                  </FormField>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* HITL */}
            <AccordionItem value="hitl">
              <AccordionTrigger className={buildAccordionTriggerClass()}>
                HITL
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <HITLEditor
                  value={watch("hitl.rules")}
                  onChange={(rules) => setValue("hitl.rules", rules)}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Memory & Skills */}
            <AccordionItem value="memory-skills">
              <AccordionTrigger className={buildAccordionTriggerClass()}>
                Memory &amp; Skills
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <StringListEditor
                  label="Memory"
                  value={watch("memory")}
                  onChange={(memory) => setValue("memory", memory)}
                  placeholder="Add memory path..."
                />
                <StringListEditor
                  label="Skills"
                  value={watch("skills")}
                  onChange={(skills) => setValue("skills", skills)}
                  placeholder="Add skill..."
                />
              </AccordionContent>
            </AccordionItem>

            {/* MCP Servers */}
            <AccordionItem value="mcp-servers">
              <AccordionTrigger className={buildAccordionTriggerClass()}>
                MCP Servers
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
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
              <AccordionTrigger className={buildAccordionTriggerClass()}>
                Subagents
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
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
              <AccordionTrigger className={buildAccordionTriggerClass()}>
                Response Format
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <ResponseFormatEditor
                  value={watch("response_format")}
                  onChange={(v) => setValue("response_format", v)}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {renderSubmitLabel()}
        </Button>
      </div>
    </form>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────

function showRootDir(type: BackendType): boolean {
  return type === BackendType.FILESYSTEM || type === BackendType.COMPOSITE;
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
      <Label htmlFor={id} className="text-on-surface">
        {label}
      </Label>
      <div aria-invalid={!!error} aria-describedby={errorId}>
        {children}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-destructive text-xs mt-1">
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
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className="w-full"
    >
      <span className="material-symbols-outlined text-sm mr-1">add</span>
      {label}
    </Button>
  );
}
