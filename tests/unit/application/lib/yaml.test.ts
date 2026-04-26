import { describe, it, expect } from "vitest";
import {
  serializeAgentConfig,
  parseAgentConfig,
  agentConfigToYamlFile,
} from "@/application/lib/yaml";
import type { AgentConfig } from "@/domain/entities/agent/agentConfig";
import {
  BackendType,
  MiddlewareType,
} from "@/domain/entities/agent/agentConfig";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";

const fullConfig: AgentConfig = {
  name: "test-agent",
  model: "openai:gpt-4o",
  system_prompt: "You are a helpful assistant",
  tools: ["search", "calculator"],
  middleware: [MiddlewareType.TODO_LIST],
  backend: { type: BackendType.STATE },
  hitl: { rules: { create_file: true } },
  memory: ["/mem/shared"],
  skills: ["web-search"],
  subagents: [
    {
      name: "researcher",
      description: "Research sub-agent",
      tools: ["search"],
      skills: [],
      mcp_servers: [],
    },
  ],
  mcp_servers: [
    {
      name: "fs-server",
      transport: McpTransportType.STDIO,
      command: "npx",
      args: ["-y", "@mcp/filesystem"],
      headers: {},
      env: {},
    },
  ],
  debug: false,
};

describe("serializeAgentConfig", () => {
  it("serializes a full config to YAML string", () => {
    const yaml = serializeAgentConfig(fullConfig);
    expect(yaml).toContain("name: test-agent");
    expect(yaml).toContain("model: openai:gpt-4o");
    expect(yaml).toContain("system_prompt:");
    expect(yaml).toContain("tools:");
  });

  it("serializes empty arrays", () => {
    const minimalConfig: AgentConfig = {
      name: "minimal",
      model: "gpt-4",
      tools: [],
      middleware: [],
      backend: { type: BackendType.STATE },
      hitl: { rules: {} },
      memory: [],
      skills: [],
      subagents: [],
      mcp_servers: [],
      debug: false,
    };
    const yaml = serializeAgentConfig(minimalConfig);
    expect(yaml).toContain("name: minimal");
  });

  it("serializes nested structures correctly", () => {
    const yaml = serializeAgentConfig(fullConfig);
    expect(yaml).toContain("name: fs-server");
    expect(yaml).toContain("transport: stdio");
    expect(yaml).toContain("name: researcher");
  });
});

describe("parseAgentConfig", () => {
  it("parses valid YAML into AgentConfig", () => {
    const yaml = `
name: parsed-agent
model: openai:gpt-4o
system_prompt: You are helpful
tools:
  - search
  - calculator
middleware:
  - todo_list
backend:
  type: state
hitl:
  rules:
    create_file: true
memory: []
skills: []
subagents: []
mcp_servers: []
debug: true
`;
    const config = parseAgentConfig(yaml);
    expect(config.name).toBe("parsed-agent");
    expect(config.model).toBe("openai:gpt-4o");
    expect(config.tools).toEqual(["search", "calculator"]);
    expect(config.debug).toBe(true);
  });

  it("parses YAML with nested structures", () => {
    const yaml = `
name: nested-agent
model: gpt-4
tools: []
middleware: []
backend:
  type: filesystem
  root_dir: /data
hitl:
  rules:
    delete_file:
      before: true
      after: false
memory: []
skills: []
subagents:
  - name: sub-1
    description: Sub agent 1
    tools: []
    skills: []
    mcp_servers: []
mcp_servers:
  - name: http-mcp
    transport: http
    url: http://localhost:8080/mcp
    args: []
    headers:
      Authorization: Bearer token
    env: {}
debug: false
`;
    const config = parseAgentConfig(yaml);
    expect(config.backend.type).toBe(BackendType.FILESYSTEM);
    expect(config.backend.root_dir).toBe("/data");
    expect(config.hitl.rules.delete_file).toEqual({
      before: true,
      after: false,
    });
    expect(config.subagents).toHaveLength(1);
    expect(config.mcp_servers[0].url).toBe("http://localhost:8080/mcp");
  });

  it("throws on invalid YAML", () => {
    expect(() => parseAgentConfig("not: valid: yaml: :::")).toThrow();
  });

  it("throws on valid YAML but invalid schema", () => {
    const yaml = `
name: missing-fields
`;
    expect(() => parseAgentConfig(yaml)).toThrow();
  });
});

describe("agentConfigToYamlFile", () => {
  it("creates a File with the YAML content", () => {
    const file = agentConfigToYamlFile(fullConfig);
    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe("test-agent.yaml");
    expect(file.type).toBe("application/x-yaml");
  });

  it("uses custom filename when provided", () => {
    const file = agentConfigToYamlFile(fullConfig, "custom.yaml");
    expect(file.name).toBe("custom.yaml");
  });

  it("file content can be read back as valid YAML", () => {
    const yamlContent = serializeAgentConfig(fullConfig);
    const file = agentConfigToYamlFile(fullConfig);
    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe("test-agent.yaml");
    expect(file.type).toBe("application/x-yaml");
    const parsed = parseAgentConfig(yamlContent);
    expect(parsed.name).toBe(fullConfig.name);
    expect(parsed.model).toBe(fullConfig.model);
  });
});
