import type { AgentConfig } from "@/domain/entities/agent/agentConfig";
import type { AgentConfigMetadata } from "@/domain/entities/agent/agentConfigMetadata";

export interface IAgentPort {
  listAgents(): Promise<AgentConfigMetadata[]>;
  getAgent(name: string): Promise<AgentConfig>;
  createAgent(name: string, yamlFile: File): Promise<AgentConfig>;
  updateAgent(name: string, yamlFile: File): Promise<AgentConfig>;
  deleteAgent(name: string): Promise<void>;
}
