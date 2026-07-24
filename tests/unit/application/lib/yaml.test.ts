import { describe, it, expect } from "vitest";
import {
  serializeAgentConfig,
  parseAgentConfig,
  agentConfigToYamlFile,
} from "@/application/lib/yaml";
import type { AgentConfig } from "@/domain/entities/agent/agentConfig";
import { BackendType } from "@/domain/entities/agent/agentConfig";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";

const fullConfig: AgentConfig = {
  name: "test-agent",
  model: "openai:gpt-4o",
  system_prompt: "You are a helpful assistant",
  tools: ["search", "calculator"],
  backend: {
    type: BackendType.STORE,
    checkpoint_backend: "memory",
  },
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

const postgresBackendConfig: AgentConfig = {
  name: "postgres-agent",
  model: "openai:gpt-4o",
  tools: [],
  backend: {
    type: BackendType.STORE,
    checkpoint_backend: "postgres",
  },
  hitl: { rules: {} },
  memory: [],
  skills: [],
  subagents: [],
  mcp_servers: [],
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
      backend: {
        type: BackendType.STORE,
        checkpoint_backend: "memory",
      },
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

  it("does NOT include a middleware key in serialized YAML", () => {
    // Act
    const yaml = serializeAgentConfig(fullConfig);

    // Assert — the serialized YAML must not contain a middleware key
    expect(yaml).not.toMatch(/^middleware:/m);
    expect(yaml).not.toContain("middleware:");
  });

  it("does NOT include root_dir in serialized YAML", () => {
    // Act
    const yaml = serializeAgentConfig(fullConfig);

    // Assert — root_dir must not appear in the serialized output
    expect(yaml).not.toContain("root_dir");
  });

  it("includes checkpoint_backend when set to postgres", () => {
    // Arrange — postgresBackendConfig sets checkpoint_backend to "postgres"

    // Act
    const yaml = serializeAgentConfig(postgresBackendConfig);

    // Assert
    expect(yaml).toContain("checkpoint_backend: postgres");
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
backend:
  type: store
  checkpoint_backend: memory
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
backend:
  type: store
  checkpoint_backend: memory
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
    expect(config.backend.type).toBe(BackendType.STORE);
    expect(config.backend).toHaveProperty("checkpoint_backend", "memory");
    expect(config.backend).not.toHaveProperty("root_dir");
    expect(config.hitl.rules.delete_file).toEqual({
      before: true,
      after: false,
    });
    expect(config.subagents).toHaveLength(1);
    expect(config.mcp_servers[0].url).toBe("http://localhost:8080/mcp");
  });

  it("rejects YAML containing a middleware key", () => {
    // Arrange — middleware must no longer be a valid field
    const yaml = `
name: bad-agent
model: gpt-4
tools: []
middleware:
  - todo_list
backend:
  type: store
  checkpoint_backend: memory
hitl:
  rules: {}
memory: []
skills: []
subagents: []
mcp_servers: []
debug: false
`;
    // Act & Assert
    expect(() => parseAgentConfig(yaml)).toThrow();
  });

  it("rejects YAML with filesystem backend type", () => {
    const yaml = `
name: fs-agent
model: gpt-4
tools: []
backend:
  type: filesystem
  root_dir: /data
hitl:
  rules: {}
memory: []
skills: []
subagents: []
mcp_servers: []
debug: false
`;
    expect(() => parseAgentConfig(yaml)).toThrow();
  });

  it("rejects YAML with composite backend type", () => {
    const yaml = `
name: comp-agent
model: gpt-4
tools: []
backend:
  type: composite
  root_dir: /data
hitl:
  rules: {}
memory: []
skills: []
subagents: []
mcp_servers: []
debug: false
`;
    expect(() => parseAgentConfig(yaml)).toThrow();
  });

  it("rejects YAML with root_dir in backend", () => {
    const yaml = `
name: root-agent
model: gpt-4
tools: []
backend:
  type: store
  checkpoint_backend: memory
  root_dir: /data
hitl:
  rules: {}
memory: []
skills: []
subagents: []
mcp_servers: []
debug: false
`;
    expect(() => parseAgentConfig(yaml)).toThrow();
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