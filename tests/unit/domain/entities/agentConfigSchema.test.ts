import { describe, it, expect } from "vitest";
import {
  agentConfigSchema,
  backendConfigSchema,
  hitlConfigSchema,
  interruptRuleSchema,
  mcpServerConfigSchema,
  subAgentConfigSchema,
} from "@/domain/entities/agent/agentConfigSchema";
import {
  BackendType,
  MiddlewareType,
} from "@/domain/entities/agent/agentConfig";
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
  it("accepts state type without root_dir", () => {
    expect(backendConfigSchema.parse({ type: BackendType.STATE })).toEqual({
      type: BackendType.STATE,
    });
  });

  it("accepts filesystem type with root_dir", () => {
    expect(
      backendConfigSchema.parse({
        type: BackendType.FILESYSTEM,
        root_dir: "/data",
      }),
    ).toEqual({ type: BackendType.FILESYSTEM, root_dir: "/data" });
  });

  it("rejects invalid backend type", () => {
    expect(() => backendConfigSchema.parse({ type: "invalid" })).toThrow();
  });

  it("accepts null root_dir", () => {
    const result = backendConfigSchema.parse({
      type: BackendType.STATE,
      root_dir: null,
    });
    expect(result.root_dir).toBeNull();
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
  it("accepts minimal valid config", () => {
    const result = agentConfigSchema.parse({
      name: "test-agent",
      model: "openai:gpt-4o",
      tools: [],
      middleware: [],
      backend: { type: BackendType.STATE },
      hitl: { rules: {} },
      memory: [],
      skills: [],
      subagents: [],
      mcp_servers: [],
      debug: false,
    });
    expect(result.name).toBe("test-agent");
  });

  it("accepts full valid config", () => {
    const config = {
      name: "full-agent",
      model: "openai:claude-haiku-4.5",
      system_prompt: "You are helpful",
      tools: ["search", "calculator"],
      middleware: [MiddlewareType.TODO_LIST, MiddlewareType.FILESYSTEM],
      backend: { type: BackendType.FILESYSTEM, root_dir: "/data" },
      hitl: {
        rules: {
          create_file: true,
          delete_file: { before: true, after: false },
        },
      },
      memory: ["/mem/1"],
      skills: ["web-search"],
      subagents: [
        {
          name: "sub",
          description: "Sub agent",
          tools: [],
          skills: [],
          mcp_servers: [],
        },
      ],
      mcp_servers: [
        {
          name: "mcp",
          transport: McpTransportType.STDIO,
          command: "npx",
          args: ["mcp"],
          headers: {},
          env: {},
        },
      ],
      debug: true,
    };
    const result = agentConfigSchema.parse(config);
    expect(result.name).toBe("full-agent");
    expect(result.debug).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(() => agentConfigSchema.parse({})).toThrow();
  });

  it("rejects whitespace-only name", () => {
    expect(() =>
      agentConfigSchema.parse({
        name: "   ",
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
      }),
    ).toThrow();
  });

  it("rejects name over 100 characters", () => {
    expect(() =>
      agentConfigSchema.parse({
        name: "a".repeat(101),
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
      }),
    ).toThrow();
  });

  it("rejects name with special characters", () => {
    expect(() =>
      agentConfigSchema.parse({
        name: "my agent!",
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
      }),
    ).toThrow();
  });

  it("rejects invalid middleware value", () => {
    expect(() =>
      agentConfigSchema.parse({
        name: "bad",
        model: "gpt-4",
        tools: [],
        middleware: ["invalid"],
        backend: { type: BackendType.STATE },
        hitl: { rules: {} },
        memory: [],
        skills: [],
        subagents: [],
        mcp_servers: [],
        debug: false,
      }),
    ).toThrow();
  });

  it("accepts optional system_prompt_file", () => {
    const result = agentConfigSchema.parse({
      name: "agent",
      model: "gpt-4",
      system_prompt_file: "/prompts/system.txt",
      tools: [],
      middleware: [],
      backend: { type: BackendType.STATE },
      hitl: { rules: {} },
      memory: [],
      skills: [],
      subagents: [],
      mcp_servers: [],
      debug: false,
    });
    expect(result.system_prompt_file).toBe("/prompts/system.txt");
  });
});
