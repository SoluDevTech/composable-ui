import type { ChatRequest } from "@/domain/entities/chat/chatRequest";
import type { Message } from "@/domain/entities/chat/message";
import type { Thread } from "@/domain/entities/chat/thread";
import type { TraceEvent, ThreadHistory } from "@/domain/entities/chat/traceEvent";

export interface IChatPort {
  createThread(agentName: string): Promise<Thread>;
  listThreads(): Promise<Thread[]>;
  getThread(threadId: string): Promise<Thread>;
  deleteThread(threadId: string): Promise<void>;
  getThreadHistory(threadId: string): Promise<ThreadHistory>;
  sendMessage(threadId: string, request: ChatRequest): Promise<Message>;
  streamMessage(
    threadId: string,
    request: ChatRequest,
    onEvent: (event: TraceEvent) => void,
    onComplete: () => void,
    onError: (err: Error) => void,
  ): AbortController;
}
