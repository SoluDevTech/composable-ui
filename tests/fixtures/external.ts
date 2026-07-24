import type { AgentConfig } from "@/domain/entities/agent/agentConfig";
import { BackendType } from "@/domain/entities/agent/agentConfig";
import type { AgentConfigMetadata } from "@/domain/entities/agent/agentConfigMetadata";
import type { McpServerConfig } from "@/domain/entities/agent/mcpServerConfig";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";
import type { Thread } from "@/domain/entities/chat/thread";
import type { Message } from "@/domain/entities/chat/message";
import { MessageRole, MessageStatus } from "@/domain/entities/chat/message";
import type { TraceEvent, Turn, ThreadHistory } from "@/domain/entities/chat/traceEvent";
import { TraceEventType } from "@/domain/entities/chat/traceEvent";

export function createAgentConfigMetadata(
  overrides: Partial<AgentConfigMetadata> = {},
): AgentConfigMetadata {
  return {
    name: "test-agent",
    model: "openai:anthropic/claude-haiku-4.5:nitro",
    minio_path: "composable-agents/test-agent.yaml",
    is_builtin: false,
    created_at: "2026-04-06T10:00:00Z",
    updated_at: "2026-04-06T10:00:00Z",
    ...overrides,
  };
}

export function createThread(overrides: Partial<Thread> = {}): Thread {
  return {
    id: "thread-123",
    agent_name: "test-agent",
    messages: [],
    created_at: "2026-04-06T10:00:00Z",
    updated_at: "2026-04-06T10:00:00Z",
    ...overrides,
  };
}

export function createAgentConfig(overrides: Partial<AgentConfig> = {}): AgentConfig {
  return {
    name: "test-agent",
    model: "openai:anthropic/claude-haiku-4.5:nitro",
    system_prompt: "You are a helpful assistant.",
    tools: ["search", "calculator"],
    backend: { type: BackendType.STORE, checkpoint_backend: "memory" },
    hitl: { rules: {} },
    memory: [],
    skills: [],
    subagents: [],
    mcp_servers: [],
    debug: false,
    ...overrides,
  };
}

export function createMcpServerConfig(overrides: Partial<McpServerConfig> = {}): McpServerConfig {
  return {
    name: "fs-server",
    transport: McpTransportType.STDIO,
    command: "npx",
    args: ["-y", "@mcp/filesystem"],
    headers: {},
    env: {},
    ...overrides,
  };
}

export function createMessage(overrides: Partial<Message> = {}): Message {
  return {
    role: MessageRole.AI,
    content: "Hello, I am your assistant.",
    timestamp: "2026-04-06T10:00:00Z",
    tool_calls: null,
    status: MessageStatus.COMPLETED,
    structured_response: null,
    thinking: null,
    turn_id: null,
    ...overrides,
  };
}

export function createTraceEvent(overrides: Partial<TraceEvent> = {}): TraceEvent {
  return {
    id: "evt-1",
    thread_id: "thread-123",
    turn_id: "turn-1",
    type: TraceEventType.CONTENT,
    source: null,
    name: null,
    content: "Hello",
    metadata: null,
    timestamp: "2026-04-06T10:00:00Z",
    sequence: 0,
    ...overrides,
  };
}

export function createTurn(overrides: Partial<Turn> = {}): Turn {
  return {
    turn_id: "turn-1",
    human_message: createMessage({ role: MessageRole.HUMAN, content: "Hi" }),
    ai_message: createMessage({ role: MessageRole.AI, content: "Hello back" }),
    events: [],
    ...overrides,
  };
}

export function createThreadHistory(overrides: Partial<ThreadHistory> = {}): ThreadHistory {
  return {
    thread: createThread(),
    turns: [createTurn()],
    ...overrides,
  };
}
