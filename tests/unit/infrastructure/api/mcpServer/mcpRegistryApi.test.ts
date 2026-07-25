import { vi, describe, it, expect, beforeEach } from "vitest";
import { mcpRegistryApi } from "@/infrastructure/api/mcpServer/mcpRegistryApi";
import { mcpApiClient } from "@/infrastructure/api/mcpAxiosInstance";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";

vi.mock("@/infrastructure/api/mcpAxiosInstance", () => ({
  mcpApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const maskedEntry = {
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

const createInput = {
  name: "weather",
  url: "https://example.com/mcp",
  headers: { Authorization: "Bearer tok" },
  env: { LOG_LEVEL: "debug" },
  auth_token: "tok",
  source_type: "external" as const,
  openapi_url: null,
};

const openapiInput = {
  name: "petstore",
  url: null,
  headers: { Authorization: "Bearer spec" },
  env: {},
  auth_token: null,
  source_type: "openapi" as const,
  openapi_url: "https://example.com/openapi.json",
};

const openapiEntry = {
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

describe("mcpRegistryApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("fetches servers from GET /api/v1/mcp/servers", async () => {
      vi.mocked(mcpApiClient.get).mockResolvedValue({ data: [maskedEntry] });

      const result = await mcpRegistryApi.list();

      expect(mcpApiClient.get).toHaveBeenCalledWith("/api/v1/mcp/servers");
      expect(result).toEqual([maskedEntry]);
    });
  });

  describe("get", () => {
    it("fetches a masked server from GET /api/v1/mcp/servers/{name}", async () => {
      vi.mocked(mcpApiClient.get).mockResolvedValue({ data: maskedEntry });

      const result = await mcpRegistryApi.get("weather");

      expect(mcpApiClient.get).toHaveBeenCalledWith("/api/v1/mcp/servers/weather");
      expect(result).toEqual(maskedEntry);
    });

    it("encodes server name with special characters", async () => {
      vi.mocked(mcpApiClient.get).mockResolvedValue({ data: {} });

      await mcpRegistryApi.get("my server");

      expect(mcpApiClient.get).toHaveBeenCalledWith("/api/v1/mcp/servers/my%20server");
    });
  });

  describe("reveal", () => {
    it("fetches the full (plaintext) server from GET /api/v1/mcp/servers/{name}/reveal", async () => {
      const revealed = {
        ...maskedEntry,
        auth_token: "secret",
        headers: { Authorization: "Bearer secret" },
      };
      vi.mocked(mcpApiClient.get).mockResolvedValue({ data: revealed });

      const result = await mcpRegistryApi.reveal("weather");

      expect(mcpApiClient.get).toHaveBeenCalledWith("/api/v1/mcp/servers/weather/reveal");
      expect(result).toEqual(revealed);
    });
  });

  describe("create", () => {
    it("posts the input to POST /api/v1/mcp/servers and returns the masked entry", async () => {
      vi.mocked(mcpApiClient.post).mockResolvedValue({ data: maskedEntry });

      const result = await mcpRegistryApi.create(createInput);

      expect(mcpApiClient.post).toHaveBeenCalledWith("/api/v1/mcp/servers", createInput);
      expect(result).toEqual(maskedEntry);
    });

    it("sends source_type and openapi_url in the body when creating an openapi server", async () => {
      vi.mocked(mcpApiClient.post).mockResolvedValue({ data: openapiEntry });

      const result = await mcpRegistryApi.create(openapiInput);

      expect(mcpApiClient.post).toHaveBeenCalledWith("/api/v1/mcp/servers", openapiInput);
      expect(result).toEqual(openapiEntry);
      expect(result.source_type).toBe("openapi");
      expect(result.openapi_url).toBe("https://example.com/openapi.json");
    });
  });

  describe("update", () => {
    it("puts the input to PUT /api/v1/mcp/servers/{name} and returns the masked entry", async () => {
      vi.mocked(mcpApiClient.put).mockResolvedValue({ data: maskedEntry });

      const result = await mcpRegistryApi.update("weather", createInput);

      expect(mcpApiClient.put).toHaveBeenCalledWith("/api/v1/mcp/servers/weather", createInput);
      expect(result).toEqual(maskedEntry);
    });

    it("encodes server name with special characters", async () => {
      vi.mocked(mcpApiClient.put).mockResolvedValue({ data: {} });

      await mcpRegistryApi.update("my server", createInput);

      expect(mcpApiClient.put).toHaveBeenCalledWith("/api/v1/mcp/servers/my%20server", createInput);
    });
  });

  describe("delete", () => {
    it("sends DELETE to /api/v1/mcp/servers/{name}", async () => {
      vi.mocked(mcpApiClient.delete).mockResolvedValue({});

      await mcpRegistryApi.delete("weather");

      expect(mcpApiClient.delete).toHaveBeenCalledWith("/api/v1/mcp/servers/weather");
    });
  });

  describe("validate", () => {
    it("posts the input to POST /api/v1/mcp/servers/validate and returns the tool count", async () => {
      vi.mocked(mcpApiClient.post).mockResolvedValue({ data: { tool_count: 12 } });

      const result = await mcpRegistryApi.validate(createInput);

      expect(mcpApiClient.post).toHaveBeenCalledWith("/api/v1/mcp/servers/validate", createInput);
      expect(result).toEqual({ tool_count: 12 });
    });

    it("sends source_type and openapi_url when validating an openapi server", async () => {
      vi.mocked(mcpApiClient.post).mockResolvedValue({ data: { tool_count: 8 } });

      const result = await mcpRegistryApi.validate(openapiInput);

      expect(mcpApiClient.post).toHaveBeenCalledWith("/api/v1/mcp/servers/validate", openapiInput);
      expect(result).toEqual({ tool_count: 8 });
    });
  });

  describe("error propagation", () => {
    it("rejects with the axios interceptor Error when the backend returns 422", async () => {
      // The mcpAxiosInstance response interceptor converts the backend `detail`
      // into an Error instance — the API layer must let that propagate.
      vi.mocked(mcpApiClient.post).mockRejectedValue(new Error("Server unreachable"));

      await expect(mcpRegistryApi.create(createInput)).rejects.toThrow("Server unreachable");
      await expect(mcpRegistryApi.validate(createInput)).rejects.toThrow("Server unreachable");
    });

    it("rejects with the backend detail on a 409 conflict", async () => {
      vi.mocked(mcpApiClient.post).mockRejectedValue(new Error("Server already exists"));

      await expect(mcpRegistryApi.create(createInput)).rejects.toThrow("Server already exists");
    });

    it("rejects with the backend detail on a 404 (delete)", async () => {
      vi.mocked(mcpApiClient.delete).mockRejectedValue(new Error("Not found"));

      await expect(mcpRegistryApi.delete("missing")).rejects.toThrow("Not found");
    });
  });
});
