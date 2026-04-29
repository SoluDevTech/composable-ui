export enum MessageRole {
  HUMAN = "human",
  AI = "ai",
  SYSTEM = "system",
  TOOL = "tool",
}

export enum MessageStatus {
  COMPLETED = "completed",
  AWAITING_HITL = "awaiting_hitl",
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result?: string;
}

export interface Message {
  role: MessageRole;
  content: string;
  timestamp: string;
  tool_calls: ToolCall[] | null;
  status: MessageStatus | null;
  structured_response: unknown;
  thinking: string | null;
}
