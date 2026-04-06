import type { AgentConfig } from "@/domain/entities/agent/agentConfig";
import type { AgentConfigMetadata } from "@/domain/entities/agent/agentConfigMetadata";
import type { IAgentPort } from "@/domain/ports/agent/agentPort";
import { apiClient } from "@/infrastructure/api/axiosInstance";

export const agentApi: IAgentPort = {
  async listAgents(): Promise<AgentConfigMetadata[]> {
    const response =
      await apiClient.get<AgentConfigMetadata[]>("/api/v1/agents");
    return response.data;
  },

  async getAgent(name: string): Promise<AgentConfig> {
    const response = await apiClient.get<AgentConfig>(
      `/api/v1/agents/${encodeURIComponent(name)}`,
    );
    return response.data;
  },

  async createAgent(name: string, yamlFile: File): Promise<AgentConfig> {
    const formData = new FormData();
    formData.append("agent_name", name);
    formData.append("file", yamlFile);

    const response = await apiClient.post<AgentConfig>(
      "/api/v1/agents",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  async updateAgent(name: string, yamlFile: File): Promise<AgentConfig> {
    const formData = new FormData();
    formData.append("file", yamlFile);

    const response = await apiClient.put<AgentConfig>(
      `/api/v1/agents/${encodeURIComponent(name)}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  async deleteAgent(name: string): Promise<void> {
    await apiClient.delete(`/api/v1/agents/${encodeURIComponent(name)}`);
  },
};
