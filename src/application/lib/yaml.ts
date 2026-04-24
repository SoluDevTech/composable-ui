import yaml from "js-yaml";
import type { AgentConfig } from "@/domain/entities/agent/agentConfig";
import { agentConfigSchema } from "@/domain/entities/agent/agentConfigSchema";

export function serializeAgentConfig(config: AgentConfig): string {
  const clean: Record<string, unknown> = {};

  clean.name = config.name;
  clean.model = config.model;

  if (config.system_prompt) {
    clean.system_prompt = config.system_prompt;
  }
  if (config.system_prompt_file) {
    clean.system_prompt_file = config.system_prompt_file;
  }

  clean.tools = config.tools;
  clean.middleware = config.middleware;
  clean.backend = config.backend;
  clean.hitl = config.hitl;
  clean.memory = config.memory;
  clean.skills = config.skills;

  if (config.subagents.length > 0) {
    clean.subagents = config.subagents.map((sub) => {
      const s: Record<string, unknown> = {
        name: sub.name,
        description: sub.description,
      };
      if (sub.instructions) s.instructions = sub.instructions;
      if (sub.model) s.model = sub.model;
      s.tools = sub.tools;
      s.skills = sub.skills;
      s.mcp_servers = sub.mcp_servers;
      if (sub.response_format && Object.keys(sub.response_format).length > 0) {
        s.response_format = sub.response_format;
      }
      return s;
    });
  } else {
    clean.subagents = [];
  }

  if (config.mcp_servers.length > 0) {
    clean.mcp_servers = config.mcp_servers.map((server) => {
      const s: Record<string, unknown> = {
        name: server.name,
        transport: server.transport,
        args: server.args,
        headers: server.headers,
        env: server.env,
      };
      if (server.command) s.command = server.command;
      if (server.url) s.url = server.url;
      if (server.auth_token) s.auth_token = server.auth_token;
      return s;
    });
  } else {
    clean.mcp_servers = [];
  }

  if (
    config.response_format &&
    Object.keys(config.response_format).length > 0
  ) {
    clean.response_format = config.response_format;
  }

  clean.debug = config.debug;

  return yaml.dump(clean, {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });
}

export function parseAgentConfig(yamlString: string): AgentConfig {
  let raw: unknown;
  try {
    raw = yaml.load(yamlString);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    throw new Error(`Failed to parse YAML: ${message}`, { cause: e });
  }
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Invalid YAML: expected an object");
  }
  return agentConfigSchema.parse(raw);
}

export function agentConfigToYamlFile(
  config: AgentConfig,
  filename?: string,
): File {
  const yamlContent = serializeAgentConfig(config);
  const safeName = config.name.replace(/[^a-z0-9_-]/gi, "_");
  const name = filename ?? `${safeName}.yaml`;
  return new File([yamlContent], name, {
    type: "application/x-yaml",
  });
}
