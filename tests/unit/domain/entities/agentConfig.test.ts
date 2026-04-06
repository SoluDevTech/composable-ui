import { describe, it, expect } from "vitest";
import {
  MiddlewareType,
  BackendType,
} from "@/domain/entities/agent/agentConfig";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";

describe("MiddlewareType", () => {
  it("has the correct values", () => {
    expect(MiddlewareType.TODO_LIST).toBe("todo_list");
    expect(MiddlewareType.FILESYSTEM).toBe("filesystem");
    expect(MiddlewareType.SUB_AGENT).toBe("sub_agent");
  });
});

describe("BackendType", () => {
  it("has the correct values", () => {
    expect(BackendType.STATE).toBe("state");
    expect(BackendType.STORE).toBe("store");
    expect(BackendType.FILESYSTEM).toBe("filesystem");
    expect(BackendType.COMPOSITE).toBe("composite");
  });
});

describe("McpTransportType", () => {
  it("has the correct values", () => {
    expect(McpTransportType.STDIO).toBe("stdio");
    expect(McpTransportType.HTTP).toBe("http");
  });
});
