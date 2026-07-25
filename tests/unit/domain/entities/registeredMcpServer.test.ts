import { describe, it, expect } from "vitest";
import type {
  RegisteredMcpServer,
  McpServerInput,
} from "@/domain/entities/mcpServer/registeredMcpServer";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";

describe("RegisteredMcpServer entity", () => {
  it("exposes the full set of registry fields on a masked entry", () => {
    // A masked entry (as returned by GET /api/v1/mcp/servers) — secrets
    // stripped to null / empty.
    const masked: RegisteredMcpServer = {
      name: "weather",
      transport: McpTransportType.HTTP,
      url: "https://example.com/mcp",
      headers: {},
      env: {},
      auth_token: null,
      tool_count: 5,
      created_at: "2026-04-06T10:00:00Z",
      updated_at: "2026-04-06T10:00:00Z",
      source_type: "external",
      openapi_url: null,
    };

    expect(masked.name).toBe("weather");
    expect(masked.transport).toBe(McpTransportType.HTTP);
    expect(masked.url).toBe("https://example.com/mcp");
    expect(masked.headers).toEqual({});
    expect(masked.env).toEqual({});
    expect(masked.auth_token).toBeNull();
    expect(masked.tool_count).toBe(5);
    expect(typeof masked.created_at).toBe("string");
    expect(typeof masked.updated_at).toBe("string");
  });

  it("supports a revealed entry where secrets are present in plaintext", () => {
    // A revealed entry (as returned by GET /api/v1/mcp/servers/{name}/reveal)
    // has the auth_token, headers and env populated in plaintext.
    const revealed: RegisteredMcpServer = {
      name: "weather",
      transport: McpTransportType.HTTP,
      url: "https://example.com/mcp",
      headers: { Authorization: "Bearer secret-token" },
      env: { LOG_LEVEL: "debug" },
      auth_token: "secret-token",
      tool_count: 5,
      created_at: "2026-04-06T10:00:00Z",
      updated_at: "2026-04-06T10:00:00Z",
      source_type: "external",
      openapi_url: null,
    };

    expect(revealed.auth_token).toBe("secret-token");
    expect(revealed.headers.Authorization).toBe("Bearer secret-token");
    expect(revealed.env.LOG_LEVEL).toBe("debug");
  });

  it("always carries transport as a McpTransportType", () => {
    const stdioEntry: RegisteredMcpServer = {
      name: "fs",
      transport: McpTransportType.STDIO,
      url: "",
      headers: {},
      env: {},
      auth_token: null,
      tool_count: 0,
      created_at: "2026-04-06T10:00:00Z",
      updated_at: "2026-04-06T10:00:00Z",
      source_type: "external",
      openapi_url: null,
    };

    expect(stdioEntry.transport).toBe(McpTransportType.STDIO);
  });

  it("supports source_type 'openapi' with an openapi_url pointing at the spec", () => {
    const openapiEntry: RegisteredMcpServer = {
      name: "petstore",
      transport: McpTransportType.HTTP,
      url: "",
      headers: {},
      env: {},
      auth_token: null,
      tool_count: 3,
      created_at: "2026-04-06T10:00:00Z",
      updated_at: "2026-04-06T10:00:00Z",
      source_type: "openapi",
      openapi_url: "https://example.com/openapi.json",
    };

    expect(openapiEntry.source_type).toBe("openapi");
    expect(openapiEntry.openapi_url).toBe("https://example.com/openapi.json");
  });

  it("defaults source_type to 'external' for an external MCP server entry", () => {
    const externalEntry: RegisteredMcpServer = {
      name: "weather",
      transport: McpTransportType.HTTP,
      url: "https://example.com/mcp",
      headers: {},
      env: {},
      auth_token: null,
      tool_count: 5,
      created_at: "2026-04-06T10:00:00Z",
      updated_at: "2026-04-06T10:00:00Z",
      source_type: "external",
      openapi_url: null,
    };

    expect(externalEntry.source_type).toBe("external");
    expect(externalEntry.openapi_url).toBeNull();
  });

  it("accepts McpServerInput with source_type and openapi_url for openapi servers", () => {
    const openapiInput: McpServerInput = {
      name: "petstore",
      url: null,
      headers: {},
      env: {},
      auth_token: null,
      source_type: "openapi",
      openapi_url: "https://example.com/openapi.json",
    };

    expect(openapiInput.source_type).toBe("openapi");
    expect(openapiInput.openapi_url).toBe("https://example.com/openapi.json");
    expect(openapiInput.url).toBeNull();
    expect(openapiInput.auth_token).toBeNull();
  });

  it("accepts McpServerInput with source_type 'external' and null openapi_url", () => {
    const externalInput: McpServerInput = {
      name: "weather",
      url: "https://example.com/mcp",
      headers: {},
      env: {},
      auth_token: "tok",
      source_type: "external",
      openapi_url: null,
    };

    expect(externalInput.source_type).toBe("external");
    expect(externalInput.openapi_url).toBeNull();
  });
});
