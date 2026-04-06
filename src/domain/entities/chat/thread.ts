import type { Message } from "./message";

export interface Thread {
  id: string;
  agent_name: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}
