import { vi, describe, it, expect, beforeEach } from "vitest";
import { agentApi } from "@/infrastructure/api/agent/agentApi";
import { apiClient } from "@/infrastructure/api/axiosInstance";
import { createAgentConfigMetadata } from "../../../../fixtures/external";

vi.mock("@/infrastructure/api/axiosInstance", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("agentApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listAgents", () => {
    it("fetches agents from GET /api/v1/agents", async () => {
      const agents = [createAgentConfigMetadata()];
      vi.mocked(apiClient.get).mockResolvedValue({ data: agents });

      const result = await agentApi.listAgents();

      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/agents");
      expect(result).toEqual(agents);
    });
  });

  describe("getAgent", () => {
    it("fetches agent config from GET /api/v1/agents/{name}", async () => {
      const config = { name: "test-agent", model: "test-model" };
      vi.mocked(apiClient.get).mockResolvedValue({ data: config });

      const result = await agentApi.getAgent("test-agent");

      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/agents/test-agent");
      expect(result).toEqual(config);
    });

    it("encodes agent name with special characters", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: {} });

      await agentApi.getAgent("my agent");

      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/agents/my%20agent");
    });
  });

  describe("createAgent", () => {
    it("posts FormData to POST /api/v1/agents", async () => {
      const config = { name: "new-agent", model: "test" };
      vi.mocked(apiClient.post).mockResolvedValue({ data: config });
      const file = new File(["name: new-agent"], "agent.yaml", {
        type: "application/yaml",
      });

      const result = await agentApi.createAgent("new-agent", file);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/v1/agents",
        expect.any(FormData),
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      expect(result).toEqual(config);
    });
  });

  describe("updateAgent", () => {
    it("puts FormData to PUT /api/v1/agents/{name}", async () => {
      const config = { name: "test-agent", model: "updated" };
      vi.mocked(apiClient.put).mockResolvedValue({ data: config });
      const file = new File(["name: test-agent"], "agent.yaml", {
        type: "application/yaml",
      });

      const result = await agentApi.updateAgent("test-agent", file);

      expect(apiClient.put).toHaveBeenCalledWith(
        "/api/v1/agents/test-agent",
        expect.any(FormData),
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      expect(result).toEqual(config);
    });
  });

  describe("deleteAgent", () => {
    it("sends DELETE to /api/v1/agents/{name}", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});

      await agentApi.deleteAgent("test-agent");

      expect(apiClient.delete).toHaveBeenCalledWith(
        "/api/v1/agents/test-agent",
      );
    });
  });
});
