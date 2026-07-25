import { useCallback, memo, useMemo } from "react";
import { useForm, useFieldArray, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import PillMultiSelect, {
  type PillMultiSelectOption,
} from "@/application/components/shared/PillMultiSelect";
import { SkillPillMultiSelect, MemoryPillMultiSelect } from "./SkillMemorySelects";
import SubAgentEditor from "./SubAgentEditor";
import HITLEditor from "./HITLEditor";
import ResponseFormatEditor from "./ResponseFormatEditor";
import { useMcpRegistry } from "@/application/hooks/mcpServer/useMcpRegistry";
import { useAgents } from "@/application/hooks/agent/useAgents";
import { mcpRegistryApi } from "@/infrastructure/api/mcpServer/mcpRegistryApi";
import { AGENT_CONFIG_FORM_ID as FORM_ID } from "./formConstants";

type SectionValue =
  | "general"
  | "system-prompt"
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
  const currentAgentName = useWatch({ control, name: "name" });
  const { data: existingAgents } = useAgents();

  function handleFormSubmit(data: AgentConfigFormData) {
    const cleaned: AgentConfigFormData = {
      ...data,
      system_prompt: data.system_prompt || undefined,
      system_prompt_file: data.system_prompt_file || undefined,
      response_format: data.response_format ?? undefined,
    };
    onSubmit(cleaned);
  }

  function addFromExistingAgent(agentName: string) {
    const existing = (existingAgents ?? []).find((a) => a.name === agentName);
    if (!existing) return;
    subagentsArray.append({
      name: agentName,
      agent_ref: agentName,
      description: existing.description ?? "",
      instructions: undefined,
      model: undefined,
      tools: [],
      skills: [],
      mcp_servers: [],
      response_format: undefined,
    });
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
            <FormField id="description" label="Description">
              <Input
                id="description"
                {...register("description")}
                placeholder="Describe what this agent does…"
                autoComplete="off"
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
            {(existingAgents ?? []).length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.1em] text-muted">
                  Add from existing agents
                </Label>
                <Select value="" onValueChange={(v) => addFromExistingAgent(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an existing agent…" />
                  </SelectTrigger>
                  <SelectContent>
                    {(existingAgents ?? [])
                      .filter(
                        (agent) =>
                          agent.name !== currentAgentName &&
                          !subagentsArray.fields.some(
                            (s) => (s as unknown as SubAgentConfig).agent_ref === agent.name,
                          ),
                      )
                      .map((agent) => (
                        <SelectItem key={agent.name} value={agent.name}>
                          {agent.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {subagentsArray.fields.map((field, index) => (
              <SubAgentEditor
                key={field.id}
                index={index}
                value={field as unknown as SubAgentConfig}
                onChange={(v) => subagentsArray.update(index, v)}
                onRemove={() => subagentsArray.remove(index)}
              />
            ))}
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

// Isolated MCP servers accordion item. MCP servers are now managed in their
// own screen (MCP Registry page), so this section only lets users pick
// registered servers via toggle pills — exactly like the Skills/Memories
// sections. Selecting a pill reveals the server's config and embeds a full
// McpServerConfig (the agent schema still requires the complete object) into
// the form; deselecting removes the entry by name.
//
// The AccordionItem is memoized so parent form re-renders (from useWatch on
// unrelated fields) do not recompute the registry options.
const McpServersAccordionItem = memo(function McpServersAccordionItem({
  control,
  defaultValue,
}: Readonly<{
  control: Control<AgentConfigFormInput>;
  defaultValue: SectionValue[];
}>) {
  const mcpServersArray = useFieldArray({ control, name: "mcp_servers" });
  const { data: registryServers } = useMcpRegistry();
  const isOpen = defaultValue.includes("mcp-servers");

  const fields = mcpServersArray.fields as unknown as McpServerConfig[];
  const registryNames = useMemo(
    () => new Set((registryServers ?? []).map((s) => s.name)),
    [registryServers],
  );
  // Names currently embedded in the form: registry-selected + any legacy
  // custom entry (name not in the registry). Legacy entries are surfaced as
  // extra active pills so they can be removed — no invisible form data.
  const selectedNames = fields.map((f) => f.name).filter((n) => n.length > 0);

  const options = useMemo<PillMultiSelectOption[]>(() => {
    const fromRegistry: PillMultiSelectOption[] = (registryServers ?? []).map((s) => ({
      value: s.name,
      label: s.name,
      description: s.openapi_url ?? s.url ?? undefined,
    }));
    const legacy: PillMultiSelectOption[] = fields
      .map((f) => f.name)
      .filter((n) => n.length > 0 && !registryNames.has(n))
      .map((n) => ({ value: n, label: `${n} (custom)` }));
    return [...fromRegistry, ...legacy];
  }, [registryServers, fields, registryNames]);

  const handleRegistryChange = useCallback(
    (next: string[]) => {
      const prev = selectedNames;
      // Newly selected names that exist in the registry → reveal + embed.
      next
        .filter((name) => !prev.includes(name) && registryNames.has(name))
        .forEach((name) => {
          void mcpRegistryApi.reveal(name).then((revealed) => {
            mcpServersArray.append({
              name: revealed.name,
              transport: McpTransportType.HTTP,
              command: undefined,
              args: [],
              url: revealed.url,
              headers: revealed.headers,
              env: revealed.env,
              auth_token: revealed.auth_token ?? undefined,
            });
          });
        });
      // Deselected names → remove the embedded entry (registry or legacy).
      prev
        .filter((name) => !next.includes(name))
        .forEach((name) => {
          const idx = fields.findIndex((f) => f.name === name);
          if (idx >= 0) mcpServersArray.remove(idx);
        });
    },
    [selectedNames, registryNames, fields, mcpServersArray],
  );

  return (
    <AccordionItem value="mcp-servers">
      <SectionTrigger value="mcp-servers" />
      <AccordionContent className="space-y-4" data-state={isOpen ? "open" : "closed"}>
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-[0.1em] text-muted">From registry</Label>
          <PillMultiSelect
            options={options}
            selected={selectedNames}
            onChange={handleRegistryChange}
            emptyMessage="No registered servers. Add servers in the MCP Registry page first."
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});
