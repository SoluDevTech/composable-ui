import type { ChatRequest } from "@/domain/entities/chat/chatRequest";
import type { Message } from "@/domain/entities/chat/message";
import type { StreamEvent } from "@/domain/entities/chat/streamEvent";
import type { Thread } from "@/domain/entities/chat/thread";

export interface IChatPort {
  createThread(agentName: string): Promise<Thread>;
  listThreads(): Promise<Thread[]>;
  getThread(threadId: string): Promise<Thread>;
  deleteThread(threadId: string): Promise<void>;
  getMessages(threadId: string): Promise<Message[]>;
  sendMessage(threadId: string, request: ChatRequest): Promise<Message>;
  streamMessage(
    threadId: string,
    request: ChatRequest,
    onChunk: (event: StreamEvent) => void,
    onComplete: () => void,
    onError: (err: Error) => void,
  ): AbortController;
}
