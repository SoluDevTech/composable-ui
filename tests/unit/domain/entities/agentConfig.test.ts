import { describe, it, expect } from "vitest";
import { BackendType } from "@/domain/entities/agent/agentConfig";
import { backendConfigSchema, agentConfigSchema } from "@/domain/entities/agent/agentConfigSchema";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";

describe("BackendType", () => {
  it("has the correct value for STORE", () => {
    expect(BackendType.STORE).toBe("store");
  });

  it("does NOT have a FILESYSTEM member", () => {
    // After the change, BackendType.FILESYSTEM must not exist.
    expect(
      (BackendType as unknown as Record<string, string | undefined>).FILESYSTEM,
    ).toBeUndefined();
  });

  it("does NOT have a COMPOSITE member", () => {
    // After the change, BackendType.COMPOSITE must not exist.
    expect(
      (BackendType as unknown as Record<string, string | undefined>).COMPOSITE,
    ).toBeUndefined();
  });

  it("only has STORE member", () => {
    const allValues = Object.values(BackendType);
    expect(allValues).toEqual(["store"]);
    expect(allValues).toHaveLength(1);
  });
});

describe("MiddlewareType", () => {
  it("is NOT exported from agentConfig", async () => {
    // After the change, MiddlewareType must be removed from the module exports.
    const mod = await import("@/domain/entities/agent/agentConfig");
    expect((mod as Record<string, unknown>).MiddlewareType).toBeUndefined();
  });
});

describe("BackendConfig defaults (via schema)", () => {
  it("checkpoint_backend defaults to 'memory' when omitted", () => {
    // Arrange — omit checkpoint_backend
    const parsed = backendConfigSchema.parse({ type: BackendType.STORE });
    // Assert — the parsed config should include checkpoint_backend = "memory"
    expect(parsed).toHaveProperty("checkpoint_backend", "memory");
  });

  it("rejects root_dir in parsed output", () => {
    // Arrange — provide root_dir (should be rejected by the strict schema)
    // Act & Assert — parsing with root_dir should throw
    expect(() =>
      backendConfigSchema.parse({
        type: BackendType.STORE,
        root_dir: "/data",
      }),
    ).toThrow();
  });

  it("accepts checkpoint_backend set to 'postgres'", () => {
    const parsed = backendConfigSchema.parse({
      type: BackendType.STORE,
      checkpoint_backend: "postgres",
    });
    expect(parsed).toHaveProperty("checkpoint_backend", "postgres");
  });
});

describe("AgentConfig has no middleware field (via schema)", () => {
  it("accepts a config WITHOUT middleware", () => {
    // Arrange — a valid config that omits middleware entirely
    const config = {
      name: "no-middleware-agent",
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

    // Act & Assert — parsing should succeed (middleware is no longer required)
    const parsed = agentConfigSchema.parse(config);
    expect(parsed).not.toHaveProperty("middleware");
  });

  it("does NOT include middleware in parsed output", () => {
    // Arrange
    const config = {
      name: "clean-agent",
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

    // Act
    const parsed = agentConfigSchema.parse(config);

    // Assert — middleware must not be present in the parsed result
    expect(parsed).not.toHaveProperty("middleware");
  });
});

describe("McpTransportType", () => {
  it("has the correct values", () => {
    expect(McpTransportType.STDIO).toBe("stdio");
    expect(McpTransportType.HTTP).toBe("http");
  });
});