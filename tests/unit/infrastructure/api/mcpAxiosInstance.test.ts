import { vi, describe, it, expect, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock configRepository so we can control what getConfig() returns per test.
// vi.resetModules() in beforeEach forces a fresh mcpAxiosInstance module
// (and thus a fresh cachedMcpBaseURL) for every test.
// ---------------------------------------------------------------------------

let mockConfig: Record<string, string> = {
  apiBaseUrl: "http://localhost:8000",
  wsBaseUrl: "ws://localhost:8000",
  ragApiBaseUrl: "",
  mcpApiBaseUrl: "",
};

vi.mock("@/infrastructure/config/configRepositoryInstance", () => ({
  configRepository: {
    getConfig: vi.fn(async () => mockConfig),
  },
}));

/**
 * Dynamically imports a fresh mcpAxiosInstance module + the (re-mocked)
 * configRepository so each test starts with an empty URL cache.
 */
async function loadMcpApiClient() {
  vi.resetModules();
  const { mcpApiClient } = await import("@/infrastructure/api/mcpAxiosInstance");
  const { configRepository } = await import("@/infrastructure/config/configRepositoryInstance");
  return { mcpApiClient, configRepository };
}

/** A minimal axios adapter that resolves with a 200 empty-body response. */
function okAdapter() {
  return vi.fn().mockResolvedValue({
    data: {},
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
    request: {},
  });
}

describe("mcpAxiosInstance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig = {
      apiBaseUrl: "http://localhost:8000",
      wsBaseUrl: "ws://localhost:8000",
      ragApiBaseUrl: "",
      mcpApiBaseUrl: "",
    };
  });

  describe("mcpApiClient export", () => {
    it("is an axios instance with get/post/put/delete and interceptors", async () => {
      const { mcpApiClient } = await loadMcpApiClient();

      expect(typeof mcpApiClient.get).toBe("function");
      expect(typeof mcpApiClient.post).toBe("function");
      expect(typeof mcpApiClient.put).toBe("function");
      expect(typeof mcpApiClient.delete).toBe("function");
      expect(mcpApiClient.interceptors).toBeDefined();
      expect(mcpApiClient.interceptors.request).toBeDefined();
      expect(mcpApiClient.interceptors.response).toBeDefined();
    });
  });

  describe("request interceptor — baseURL resolution", () => {
    it("sets baseURL from appConfig.mcpApiBaseUrl when it is non-empty", async () => {
      mockConfig.mcpApiBaseUrl = "http://localhost:8020";
      const { mcpApiClient } = await loadMcpApiClient();
      const adapter = okAdapter();
      mcpApiClient.defaults.adapter = adapter;

      await mcpApiClient.get("/api/v1/mcp/servers");

      const calledConfig = adapter.mock.calls[0][0];
      expect(calledConfig.baseURL).toBe("http://localhost:8020");
    });

    it("falls back to ragApiBaseUrl when mcpApiBaseUrl is empty", async () => {
      mockConfig.mcpApiBaseUrl = "";
      mockConfig.ragApiBaseUrl = "http://localhost:8010";
      const { mcpApiClient } = await loadMcpApiClient();
      const adapter = okAdapter();
      mcpApiClient.defaults.adapter = adapter;

      await mcpApiClient.get("/api/v1/mcp/servers");

      const calledConfig = adapter.mock.calls[0][0];
      expect(calledConfig.baseURL).toBe("http://localhost:8010");
    });

    it("falls back to apiBaseUrl when both mcpApiBaseUrl and ragApiBaseUrl are empty", async () => {
      mockConfig.mcpApiBaseUrl = "";
      mockConfig.ragApiBaseUrl = "";
      mockConfig.apiBaseUrl = "http://localhost:8000";
      const { mcpApiClient } = await loadMcpApiClient();
      const adapter = okAdapter();
      mcpApiClient.defaults.adapter = adapter;

      await mcpApiClient.get("/api/v1/mcp/servers");

      const calledConfig = adapter.mock.calls[0][0];
      expect(calledConfig.baseURL).toBe("http://localhost:8000");
    });
  });

  describe("request interceptor — caching", () => {
    it("only calls configRepository.getConfig() once across multiple requests", async () => {
      mockConfig.mcpApiBaseUrl = "http://localhost:8020";
      const { mcpApiClient, configRepository } = await loadMcpApiClient();
      const adapter = okAdapter();
      mcpApiClient.defaults.adapter = adapter;

      await mcpApiClient.get("/a");
      await mcpApiClient.get("/b");
      await mcpApiClient.get("/c");

      expect(configRepository.getConfig).toHaveBeenCalledTimes(1);
    });
  });

  describe("response interceptor — error extraction", () => {
    it("extracts error.response.data.detail into an Error", async () => {
      const { mcpApiClient } = await loadMcpApiClient();
      mcpApiClient.defaults.adapter = vi.fn().mockRejectedValue({
        response: {
          data: { detail: "Something went wrong on the server" },
          status: 500,
          statusText: "Internal Server Error",
          headers: {},
          config: {},
        },
        config: {},
        message: "Request failed with status code 500",
      });

      await expect(mcpApiClient.get("/api/v1/mcp/servers")).rejects.toThrow(
        "Something went wrong on the server",
      );
    });

    it("falls back to error.message when response.data.detail is absent", async () => {
      const { mcpApiClient } = await loadMcpApiClient();
      mcpApiClient.defaults.adapter = vi.fn().mockRejectedValue({
        response: {
          data: {},
          status: 502,
          statusText: "Bad Gateway",
          headers: {},
          config: {},
        },
        config: {},
        message: "Request failed with status code 502",
      });

      await expect(mcpApiClient.get("/api/v1/mcp/servers")).rejects.toThrow(
        "Request failed with status code 502",
      );
    });

    it("rejects with the original error when there is no response", async () => {
      const { mcpApiClient } = await loadMcpApiClient();
      const networkError = new Error("Network Error");
      mcpApiClient.defaults.adapter = vi.fn().mockRejectedValue(networkError);

      await expect(mcpApiClient.get("/api/v1/mcp/servers")).rejects.toBe(networkError);
    });
  });
});
