import { z } from "zod";
import { BackendType, MiddlewareType } from "./agentConfig";
import { McpTransportType } from "./mcpServerConfig";

export const interruptRuleSchema = z.object({
  before: z.boolean().optional(),
  after: z.boolean().optional(),
});

export const hitlConfigSchema = z.object({
  rules: z.record(z.string(), z.union([z.boolean(), interruptRuleSchema])),
});

export const backendConfigSchema = z.object({
  type: z.enum([BackendType.STATE, BackendType.STORE, BackendType.FILESYSTEM, BackendType.COMPOSITE]),
  root_dir: z.string().nullable().optional(),
});

export const mcpServerConfigSchema = z.object({
  name: z.string().min(1, "MCP server name is required"),
  transport: z.enum([McpTransportType.STDIO, McpTransportType.HTTP]),
  command: z.string().nullable().optional(),
  args: z.array(z.string()),
  url: z.string().nullable().optional(),
  headers: z.record(z.string(), z.string()),
  env: z.record(z.string(), z.string()),
  auth_token: z.string().nullable().optional(),
});

export const subAgentConfigSchema = z.object({
  name: z.string().min(1, "Subagent name is required"),
  description: z.string().min(1, "Subagent description is required"),
  instructions: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  tools: z.array(z.string()),
  skills: z.array(z.string()),
  mcp_servers: z.array(mcpServerConfigSchema),
  response_format: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const agentConfigSchema = z.object({
  name: z.string().min(1, "Agent name is required").max(100, "Agent name must be 100 characters or less").regex(/^[a-zA-Z0-9._-]+$/, "Agent name must contain only alphanumeric characters, dots, hyphens, and underscores"),
  model: z.string().min(1, "Model is required"),
  system_prompt: z.string().nullable().optional(),
  system_prompt_file: z.string().nullable().optional(),
  tools: z.array(z.string()),
  middleware: z
    .enum([
      MiddlewareType.TODO_LIST,
      MiddlewareType.FILESYSTEM,
      MiddlewareType.SUB_AGENT,
    ])
    .array(),
  backend: backendConfigSchema,
  hitl: hitlConfigSchema,
  memory: z.array(z.string()),
  skills: z.array(z.string()),
  subagents: z.array(subAgentConfigSchema),
  mcp_servers: z.array(mcpServerConfigSchema),
  response_format: z.record(z.string(), z.unknown()).nullable().optional(),
  debug: z.boolean(),
});

export type AgentConfigFormData = z.infer<typeof agentConfigSchema>;
