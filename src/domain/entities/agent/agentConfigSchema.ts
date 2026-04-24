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
  type: z.nativeEnum(BackendType),
  root_dir: z.string().optional(),
});

export const mcpServerConfigSchema = z.object({
  name: z.string().min(1),
  transport: z.enum([McpTransportType.STDIO, McpTransportType.HTTP]),
  command: z.string().optional(),
  args: z.array(z.string()),
  url: z.string().optional(),
  headers: z.record(z.string(), z.string()),
  env: z.record(z.string(), z.string()),
  auth_token: z.string().optional(),
});

export const subAgentConfigSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  instructions: z.string().optional(),
  model: z.string().optional(),
  tools: z.array(z.string()),
  skills: z.array(z.string()),
  mcp_servers: z.array(mcpServerConfigSchema),
  response_format: z.record(z.string(), z.unknown()).optional(),
});

export const agentConfigSchema = z.object({
  name: z.string().min(1),
  model: z.string().min(1),
  system_prompt: z.string().optional(),
  system_prompt_file: z.string().optional(),
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
  response_format: z.record(z.string(), z.unknown()).optional(),
  debug: z.boolean(),
});

export type AgentConfigFormData = z.infer<typeof agentConfigSchema>;
