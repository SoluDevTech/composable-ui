import { describe, it, expect } from "vitest";
import {
  agentConfigSchema,
  backendConfigSchema,
  hitlConfigSchema,
  interruptRuleSchema,
  mcpServerConfigSchema,
  subAgentConfigSchema,
} from "@/domain/entities/agent/agentConfigSchema";
import { BackendType } from "@/domain/entities/agent/agentConfig";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";

describe("interruptRuleSchema", () => {
  it("accepts { before: true, after: false }", () => {
    expect(interruptRuleSchema.parse({ before: true, after: false })).toEqual({
      before: true,
      after: false,
    });
  });

  it("accepts empty object", () => {
    expect(interruptRuleSchema.parse({})).toEqual({});
  });

  it("accepts { before: true }", () => {
    expect(interruptRuleSchema.parse({ before: true })).toEqual({
      before: true,
    });
  });
});

describe("hitlConfigSchema", () => {
  it("accepts empty rules", () => {
    expect(hitlConfigSchema.parse({ rules: {} })).toEqual({ rules: {} });
  });

  it("accepts boolean rules", () => {
    expect(hitlConfigSchema.parse({ rules: { create_file: true } })).toEqual({
      rules: { create_file: true },
    });
  });

  it("accepts interrupt rules", () => {
    const result = hitlConfigSchema.parse({
      rules: { delete_file: { before: true, after: false } },
    });
    expect(result.rules.delete_file).toEqual({ before: true, after: false });
  });
});

describe("backendConfigSchema", () => {
  it("accepts store type without root_dir", () => {
    const parsed = backendConfigSchema.parse({ type: BackendType.STORE });
    expect(parsed.type).toBe(BackendType.STORE);
    expect(parsed).not.toHaveProperty("root_dir");
  });

  it("rejects state backend type", () => {
    expect(() => backendConfigSchema.parse({ type: "state" })).toThrow();
  });

  it("accepts store type with checkpoint_backend", () => {
    const parsed = backendConfigSchema.parse({
      type: BackendType.STORE,
      checkpoint_backend: "postgres",
    });
    expect(parsed).toHaveProperty("checkpoint_backend", "postgres");
  });

  it("defaults checkpoint_backend to 'memory' when omitted", () => {
    const parsed = backendConfigSchema.parse({ type: BackendType.STORE });
    expect(parsed).toHaveProperty("checkpoint_backend", "memory");
  });

  it("rejects invalid backend type", () => {
    expect(() => backendConfigSchema.parse({ type: "invalid" })).toThrow();
  });

  it("rejects filesystem backend type", () => {
    // Arrange — filesystem must no longer be a valid backend type
    // Act & Assert — parsing should throw
    expect(() =>
      backendConfigSchema.parse({ type: "filesystem" }),
    ).toThrow();
  });

  it("rejects composite backend type", () => {
    // Arrange — composite must no longer be a valid backend type
    // Act & Assert — parsing should throw
    expect(() =>
      backendConfigSchema.parse({ type: "composite" }),
    ).toThrow();
  });

  it("rejects root_dir field", () => {
    // Arrange — root_dir must no longer be accepted by the schema
    // Act & Assert — parsing with root_dir should throw (strict mode rejects unknown keys)
    expect(() =>
      backendConfigSchema.parse({
        type: BackendType.STORE,
        root_dir: "/data",
      }),
    ).toThrow();
  });

  it("rejects invalid store_backend value", () => {
    // Arrange — store_backend is no longer a valid field, so providing it should throw
    // Act & Assert — an invalid (now unknown) key should throw
    expect(() =>
      backendConfigSchema.parse({
        type: BackendType.STORE,
        store_backend: "redis",
      }),
    ).toThrow();
  });

  it("rejects invalid checkpoint_backend value", () => {
    // Arrange — only "memory" and "postgres" are valid
    // Act & Assert — an invalid value should throw
    expect(() =>
      backendConfigSchema.parse({
        type: BackendType.STORE,
        checkpoint_backend: "redis",
      }),
    ).toThrow();
  });
});

describe("mcpServerConfigSchema", () => {
  it("accepts stdio transport with command", () => {
    const result = mcpServerConfigSchema.parse({
      name: "my-server",
      transport: McpTransportType.STDIO,
      command: "npx",
      args: ["-y", "mcp-server"],
      headers: {},
      env: {},
    });
    expect(result.name).toBe("my-server");
    expect(result.transport).toBe("stdio");
  });

  it("accepts http transport with url", () => {
    const result = mcpServerConfigSchema.parse({
      name: "http-server",
      transport: McpTransportType.HTTP,
      url: "http://localhost:3000/mcp",
      args: [],
      headers: { Authorization: "Bearer token" },
      env: {},
    });
    expect(result.url).toBe("http://localhost:3000/mcp");
  });

  it("rejects missing name", () => {
    expect(() =>
      mcpServerConfigSchema.parse({
        transport: McpTransportType.STDIO,
        args: [],
        headers: {},
        env: {},
      }),
    ).toThrow();
  });
});

describe("subAgentConfigSchema", () => {
  it("accepts minimal subagent", () => {
    const result = subAgentConfigSchema.parse({
      name: "researcher",
      description: "Research agent",
      tools: [],
      skills: [],
      mcp_servers: [],
    });
    expect(result.name).toBe("researcher");
  });

  it("accepts full subagent", () => {
    const result = subAgentConfigSchema.parse({
      name: "researcher",
      description: "Research agent",
      instructions: "Do research",
      model: "openai:gpt-4o",
      tools: ["search"],
      skills: ["web-search"],
      mcp_servers: [],
      response_format: { type: "json" },
    });
    expect(result.tools).toEqual(["search"]);
  });

  it("rejects missing description", () => {
    expect(() =>
      subAgentConfigSchema.parse({
        name: "researcher",
        tools: [],
        skills: [],
        mcp_servers: [],
      }),
    ).toThrow();
  });
});

describe("agentConfigSchema", () => {
  const baseConfig = {
    name: "test-agent",
    model: "openai:gpt-4o",
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

  it("accepts minimal valid config without middleware", () => {
    // Arrange — omit middleware entirely
    // Act
    const result = agentConfigSchema.parse(baseConfig);
    // Assert
    expect(result.name).toBe("test-agent");
    expect(result).not.toHaveProperty("middleware");
  });

  it("rejects middleware field", () => {
    // Arrange — middleware must no longer be a valid field
    const configWithMiddleware = {
      ...baseConfig,
      middleware: [],
    };
    // Act & Assert — strict schema should reject unknown key "middleware"
    expect(() => agentConfigSchema.parse(configWithMiddleware)).toThrow();
  });

  it("rejects middleware field with values", () => {
    // Arrange — even with valid-looking values, middleware must be rejected
    const configWithMiddleware = {
      ...baseConfig,
      middleware: ["todo_list"],
    };
    // Act & Assert
    expect(() => agentConfigSchema.parse(configWithMiddleware)).toThrow();
  });

  it("rejects filesystem backend type", () => {
    // Arrange
    const configWithFilesystem = {
      ...baseConfig,
      backend: { type: "filesystem", root_dir: "/data" },
    };
    // Act & Assert
    expect(() => agentConfigSchema.parse(configWithFilesystem)).toThrow();
  });

  it("rejects composite backend type", () => {
    // Arrange
    const configWithComposite = {
      ...baseConfig,
      backend: { type: "composite", root_dir: "/data" },
    };
    // Act & Assert
    expect(() => agentConfigSchema.parse(configWithComposite)).toThrow();
  });

  it("rejects root_dir in backend", () => {
    // Arrange
    const configWithRootDir = {
      ...baseConfig,
      backend: {
        type: BackendType.STORE,
        checkpoint_backend: "memory",
        root_dir: "/data",
      },
    };
    // Act & Assert — root_dir must no longer be accepted
    expect(() => agentConfigSchema.parse(configWithRootDir)).toThrow();
  });

  it("accepts checkpoint_backend set to postgres", () => {
    // Arrange
    const configWithPostgres = {
      ...baseConfig,
      backend: {
        type: BackendType.STORE,
        checkpoint_backend: "postgres",
      },
    };
    // Act
    const result = agentConfigSchema.parse(configWithPostgres);
    // Assert
    expect(result.backend).toHaveProperty("checkpoint_backend", "postgres");
  });

  it("rejects store_backend field (removed)", () => {
    // Arrange — store_backend is no longer a valid field
    const configWithStoreBackend = {
      ...baseConfig,
      backend: {
        type: BackendType.STORE,
        store_backend: "memory",
        checkpoint_backend: "memory",
      },
    };
    // Act & Assert — strict schema should reject unknown key "store_backend"
    expect(() => agentConfigSchema.parse(configWithStoreBackend)).toThrow();
  });

  it("rejects invalid checkpoint_backend value", () => {
    // Arrange
    const configWithInvalidCheckpoint = {
      ...baseConfig,
      backend: {
        type: BackendType.STORE,
        checkpoint_backend: "redis",
      },
    };
    // Act & Assert
    expect(() => agentConfigSchema.parse(configWithInvalidCheckpoint)).toThrow();
  });

  it("rejects missing required fields", () => {
    expect(() => agentConfigSchema.parse({})).toThrow();
  });

  it("rejects whitespace-only name", () => {
    expect(() =>
      agentConfigSchema.parse({
        ...baseConfig,
        name: "   ",
      }),
    ).toThrow();
  });

  it("rejects name over 100 characters", () => {
    expect(() =>
      agentConfigSchema.parse({
        ...baseConfig,
        name: "a".repeat(101),
      }),
    ).toThrow();
  });

  it("rejects name with special characters", () => {
    expect(() =>
      agentConfigSchema.parse({
        ...baseConfig,
        name: "my agent!",
      }),
    ).toThrow();
  });

  it("accepts optional system_prompt_file", () => {
    const result = agentConfigSchema.parse({
      ...baseConfig,
      system_prompt_file: "/prompts/system.txt",
    });
    expect(result.system_prompt_file).toBe("/prompts/system.txt");
  });
});