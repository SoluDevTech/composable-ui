import { useState } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AgentConfig } from "@/domain/entities/agent/agentConfig";
import {
  BackendType,
  MiddlewareType,
} from "@/domain/entities/agent/agentConfig";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";
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
import { ScrollArea } from "@/application/components/ui/scroll-area";
import { Separator } from "@/application/components/ui/separator";
import StringListEditor from "./StringListEditor";
import McpServerEditor from "./McpServerEditor";
import SubAgentEditor from "./SubAgentEditor";

interface AgentConfigFormProps {
  mode: "create" | "edit";
  initialData?: AgentConfig;
  onSubmit: (data: AgentConfigFormData) => void;
  onCancel: () => void;
  isPending?: boolean;
}

const MIDDLEWARE_OPTIONS = [
  { value: MiddlewareType.TODO_LIST, label: "todo_list" },
  { value: MiddlewareType.FILESYSTEM, label: "filesystem" },
  { value: MiddlewareType.SUB_AGENT, label: "sub_agent" },
];

const BACKEND_OPTIONS = [
  { value: BackendType.STATE, label: "state" },
  { value: BackendType.STORE, label: "store" },
  { value: BackendType.FILESYSTEM, label: "filesystem" },
  { value: BackendType.COMPOSITE, label: "composite" },
];

function getDefaultValues(
  mode: "create" | "edit",
  initialData?: AgentConfig,
): AgentConfigFormData {
  if (mode === "edit" && initialData) {
    return {
      name: initialData.name,
      model: initialData.model,
      system_prompt: initialData.system_prompt ?? "",
      system_prompt_file: initialData.system_prompt_file ?? "",
      tools: initialData.tools,
      middleware: initialData.middleware,
      backend: initialData.backend,
      hitl: initialData.hitl,
      memory: initialData.memory,
      skills: initialData.skills,
      subagents: initialData.subagents,
      mcp_servers: initialData.mcp_servers,
      response_format: initialData.response_format ?? undefined,
      debug: initialData.debug,
    };
  }
  return {
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
}

export default function AgentConfigForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isPending = false,
}: Readonly<AgentConfigFormProps>) {
  const form = useForm<AgentConfigFormData>({
    resolver: zodResolver(agentConfigSchema),
    defaultValues: getDefaultValues(mode, initialData),
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = form;

  const mcpServersArray = useFieldArray({ control, name: "mcp_servers" });
  const subagentsArray = useFieldArray({ control, name: "subagents" });

  const debugValue = watch("debug");
  const backendType = watch("backend.type");

  const handleFormSubmit: SubmitHandler<AgentConfigFormData> = (data) => {
    const cleaned: AgentConfigFormData = {
      ...data,
      system_prompt: data.system_prompt || undefined,
      system_prompt_file: data.system_prompt_file || undefined,
    };
    onSubmit(cleaned);
  };

  function addMcpServer() {
    mcpServersArray.append({
      name: "",
      transport: McpTransportType.STDIO,
      command: "",
      args: [],
      url: "",
      headers: {},
      env: {},
      auth_token: "",
    });
  }

  function addSubagent() {
    subagentsArray.append({
      name: "",
      description: "",
      instructions: "",
      model: "",
      tools: [],
      skills: [],
      mcp_servers: [],
    });
  }

  function toggleMiddleware(mw: MiddlewareType, isChecked: boolean) {
    const current = getValues("middleware") as MiddlewareType[];
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
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col h-full"
    >
      <ScrollArea className="max-h-[70vh] pr-4">
        <div className="space-y-2">
          <Accordion
            type="multiple"
            defaultValue={[
              "general",
              "system-prompt",
              "tools-middleware",
              "backend",
              "hitl",
              "memory-skills",
              "mcp-servers",
              "subagents",
              "response-format",
            ]}
          >
            {/* General */}
            <AccordionItem value="general">
              <AccordionTrigger className="text-xs font-bold font-headline uppercase tracking-widest text-on-surface-variant hover:no-underline">
                General
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="agent-name" className="text-on-surface">
                    Agent Name
                  </Label>
                  <Input
                    id="agent-name"
                    {...register("name")}
                    disabled={mode === "edit"}
                    placeholder="my-agent"
                    aria-invalid={!!errors.name}
                    aria-describedby={
                      errors.name ? "agent-name-error" : undefined
                    }
                  />
                  {errors.name && (
                    <p
                      id="agent-name-error"
                      role="alert"
                      className="text-destructive text-xs mt-1"
                    >
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="model" className="text-on-surface">
                    Model
                  </Label>
                  <Input
                    id="model"
                    {...register("model")}
                    placeholder="openai:anthropic/claude-haiku-4.5:nitro"
                    aria-invalid={!!errors.model}
                    aria-describedby={errors.model ? "model-error" : undefined}
                  />
                  {errors.model && (
                    <p
                      id="model-error"
                      role="alert"
                      className="text-destructive text-xs mt-1"
                    >
                      {errors.model.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor="debug" className="text-on-surface">
                    Debug
                  </Label>
                  <Switch
                    id="debug"
                    checked={debugValue}
                    onCheckedChange={(v) => setValue("debug", v)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* System Prompt */}
            <AccordionItem value="system-prompt">
              <AccordionTrigger className="text-xs font-bold font-headline uppercase tracking-widest text-on-surface-variant hover:no-underline">
                System Prompt
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="system-prompt" className="text-on-surface">
                    System Prompt
                  </Label>
                  <Textarea
                    id="system-prompt"
                    {...register("system_prompt")}
                    placeholder="You are a helpful assistant..."
                    rows={6}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="system-prompt-file"
                    className="text-on-surface"
                  >
                    System Prompt File
                  </Label>
                  <Input
                    id="system-prompt-file"
                    {...register("system_prompt_file")}
                    placeholder="/prompts/system.txt (optional)"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Tools & Middleware */}
            <AccordionItem value="tools-middleware">
              <AccordionTrigger className="text-xs font-bold font-headline uppercase tracking-widest text-on-surface-variant hover:no-underline">
                Tools & Middleware
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <StringListEditor
                  label="Tools"
                  value={watch("tools") as string[]}
                  onChange={(tools) => setValue("tools", tools)}
                  placeholder="Add tool..."
                />
                <div>
                  <Label className="text-on-surface">Middleware</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {MIDDLEWARE_OPTIONS.map((opt) => {
                      const isActive = (
                        watch("middleware") as MiddlewareType[]
                      ).includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleMiddleware(opt.value, !isActive)}
                          aria-pressed={isActive}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold font-headline uppercase tracking-widest border transition-colors ${
                            isActive
                              ? "bg-secondary-brand text-white border-secondary-brand"
                              : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high"
                          }`}
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
              <AccordionTrigger className="text-xs font-bold font-headline uppercase tracking-widest text-on-surface-variant hover:no-underline">
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
                {(backendType === BackendType.FILESYSTEM ||
                  backendType === BackendType.COMPOSITE) && (
                  <div>
                    <Label
                      htmlFor="backend-root-dir"
                      className="text-on-surface"
                    >
                      Root Directory
                    </Label>
                    <Input
                      id="backend-root-dir"
                      {...register("backend.root_dir")}
                      placeholder="/data/agents"
                    />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* HITL */}
            <AccordionItem value="hitl">
              <AccordionTrigger className="text-xs font-bold font-headline uppercase tracking-widest text-on-surface-variant hover:no-underline">
                HITL
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <HITLEditor
                  value={
                    watch("hitl.rules") as Record<
                      string,
                      boolean | { before?: boolean; after?: boolean }
                    >
                  }
                  onChange={(rules) => setValue("hitl.rules", rules)}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Memory & Skills */}
            <AccordionItem value="memory-skills">
              <AccordionTrigger className="text-xs font-bold font-headline uppercase tracking-widest text-on-surface-variant hover:no-underline">
                Memory & Skills
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <StringListEditor
                  label="Memory"
                  value={watch("memory") as string[]}
                  onChange={(memory) => setValue("memory", memory)}
                  placeholder="Add memory path..."
                />
                <StringListEditor
                  label="Skills"
                  value={watch("skills") as string[]}
                  onChange={(skills) => setValue("skills", skills)}
                  placeholder="Add skill..."
                />
              </AccordionContent>
            </AccordionItem>

            {/* MCP Servers */}
            <AccordionItem value="mcp-servers">
              <AccordionTrigger className="text-xs font-bold font-headline uppercase tracking-widest text-on-surface-variant hover:no-underline">
                MCP Servers
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                {mcpServersArray.fields.map((field, index) => (
                  <McpServerEditor
                    key={field.id}
                    value={
                      field as unknown as import("@/domain/entities/agent/mcpServerConfig").McpServerConfig
                    }
                    onChange={(v) => mcpServersArray.update(index, v)}
                    onRemove={() => mcpServersArray.remove(index)}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMcpServer}
                  className="w-full"
                >
                  <span className="material-symbols-outlined text-sm mr-1">
                    add
                  </span>
                  Add MCP Server
                </Button>
              </AccordionContent>
            </AccordionItem>

            {/* Subagents */}
            <AccordionItem value="subagents">
              <AccordionTrigger className="text-xs font-bold font-headline uppercase tracking-widest text-on-surface-variant hover:no-underline">
                Subagents
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                {subagentsArray.fields.map((field, index) => (
                  <SubAgentEditor
                    key={field.id}
                    index={index}
                    value={
                      field as unknown as import("@/domain/entities/agent/agentConfig").SubAgentConfig
                    }
                    onChange={(v) => subagentsArray.update(index, v)}
                    onRemove={() => subagentsArray.remove(index)}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSubagent}
                  className="w-full"
                >
                  <span className="material-symbols-outlined text-sm mr-1">
                    add
                  </span>
                  Add Subagent
                </Button>
              </AccordionContent>
            </AccordionItem>

            {/* Response Format */}
            <AccordionItem value="response-format">
              <AccordionTrigger className="text-xs font-bold font-headline uppercase tracking-widest text-on-surface-variant hover:no-underline">
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
      </ScrollArea>

      <Separator className="my-4" />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : mode === "create" ? "Create" : "Update"}
        </Button>
      </div>
    </form>
  );
}

interface HITLEditorProps {
  value: Record<string, boolean | { before?: boolean; after?: boolean }>;
  onChange: (
    value: Record<string, boolean | { before?: boolean; after?: boolean }>,
  ) => void;
}

interface ResponseFormatEditorProps {
  value: Record<string, unknown> | undefined;
  onChange: (value: Record<string, unknown> | undefined) => void;
}

function ResponseFormatEditor({
  value,
  onChange,
}: Readonly<ResponseFormatEditorProps>) {
  const [text, setText] = useState(() =>
    value ? JSON.stringify(value, null, 2) : "",
  );
  const [parseError, setParseError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setText(val);
    if (!val.trim()) {
      onChange(undefined);
      setParseError(null);
      return;
    }
    try {
      onChange(JSON.parse(val));
      setParseError(null);
    } catch {
      setParseError("Invalid JSON");
    }
  }

  return (
    <div>
      <Label htmlFor="response-format" className="text-on-surface">
        JSON Schema
      </Label>
      <Textarea
        id="response-format"
        placeholder='{"type": "object", "properties": {...}}'
        rows={6}
        value={text}
        onChange={handleChange}
        className="font-mono text-xs"
        aria-invalid={!!parseError}
        aria-describedby={parseError ? "response-format-error" : undefined}
      />
      {parseError && (
        <p
          id="response-format-error"
          role="alert"
          className="text-destructive text-xs mt-1"
        >
          {parseError}
        </p>
      )}
    </div>
  );
}

function HITLEditor({ value, onChange }: Readonly<HITLEditorProps>) {
  const [ruleName, setRuleName] = useState("");
  const entries = Object.entries(value);

  function addRule() {
    const trimmed = ruleName.trim();
    if (!trimmed) return;
    onChange({ ...value, [trimmed]: true });
    setRuleName("");
  }

  function removeRule(key: string) {
    const next = { ...value };
    delete next[key];
    onChange(next);
  }

  function updateRule(
    key: string,
    val: boolean | { before?: boolean; after?: boolean },
  ) {
    onChange({ ...value, [key]: val });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={ruleName}
          onChange={(e) => setRuleName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addRule();
            }
          }}
          placeholder="Rule name (e.g. create_file)"
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={addRule}>
          Add
        </Button>
      </div>
      {entries.map(([key, val]) => (
        <div
          key={key}
          className="flex items-center gap-3 bg-surface-container-low rounded-lg px-3 py-2"
        >
          <span className="font-mono text-xs text-on-surface">{key}</span>
          <div className="flex-1" />
          {typeof val === "boolean" ? (
            <div className="flex items-center gap-2">
              <Label className="text-xs text-on-surface-variant">Enabled</Label>
              <Switch
                checked={val}
                onCheckedChange={(v) => updateRule(key, v)}
              />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Label className="text-xs text-on-surface-variant">
                  Before
                </Label>
                <Switch
                  checked={val.before ?? false}
                  onCheckedChange={(v) =>
                    updateRule(key, { ...val, before: v })
                  }
                />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-on-surface-variant">After</Label>
                <Switch
                  checked={val.after ?? false}
                  onCheckedChange={(v) => updateRule(key, { ...val, after: v })}
                />
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => removeRule(key)}
            className="rounded-full hover:bg-destructive/20 p-0.5"
            aria-label={`Remove ${key}`}
          >
            <span className="material-symbols-outlined text-xs">close</span>
          </button>
        </div>
      ))}
      {entries.length === 0 && (
        <p className="text-xs text-on-surface-variant italic">
          No HITL rules configured
        </p>
      )}
    </div>
  );
}
