import type { ChatRequest } from "@/domain/entities/chat/chatRequest";
import type { Message } from "@/domain/entities/chat/message";
import type { StreamEvent, StreamEventType } from "@/domain/entities/chat/streamEvent";
import type { Thread } from "@/domain/entities/chat/thread";
import type { IChatPort } from "@/domain/ports/chat/chatPort";
import { apiClient } from "@/infrastructure/api/axiosInstance";
import { configRepository } from "@/infrastructure/config/configRepositoryInstance";
import { fetchEventSource } from "@microsoft/fetch-event-source";

export const chatApi: IChatPort = {
  async createThread(agentName: string): Promise<Thread> {
    const response = await apiClient.post<Thread>("/api/v1/threads", {
      agent_name: agentName,
    });
    return response.data;
  },

  async listThreads(): Promise<Thread[]> {
    const response = await apiClient.get<Thread[]>("/api/v1/threads");
    return response.data;
  },

  async getThread(threadId: string): Promise<Thread> {
    const response = await apiClient.get<Thread>(`/api/v1/threads/${threadId}`);
    return response.data;
  },

  async deleteThread(threadId: string): Promise<void> {
    await apiClient.delete(`/api/v1/threads/${threadId}`);
  },

  async getMessages(threadId: string): Promise<Message[]> {
    const response = await apiClient.get<Message[]>(
      `/api/v1/threads/${threadId}/messages`,
    );
    return response.data;
  },

  async sendMessage(threadId: string, request: ChatRequest): Promise<Message> {
    const response = await apiClient.post<Message>(
      `/api/v1/chat/${threadId}`,
      request,
      { timeout: 300000 },
    );
    return response.data;
  },

  streamMessage(
    threadId: string,
    request: ChatRequest,
    onChunk: (event: StreamEvent) => void,
    onComplete: () => void,
    onError: (err: Error) => void,
  ): AbortController {
    const ctrl = new AbortController();

    const streamUrl = async () => {
      const config = await configRepository.getConfig();
      return `${config.apiBaseUrl}/api/v1/chat/${threadId}/stream`;
    };

    streamUrl().then((url) => {
      fetchEventSource(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: ctrl.signal,
        onmessage(ev) {
          if (ev.data === "[DONE]") return;
          if (!ev.data) return;
          try {
            const event: StreamEvent = JSON.parse(ev.data);
            onChunk(event);
          } catch {
            // Fallback: treat raw data as content for backward compatibility
            onChunk({ type: "content" as StreamEventType, data: ev.data });
          }
        },
        onclose() {
          onComplete();
        },
        onerror(err) {
          onError(err instanceof Error ? err : new Error(String(err)));
          throw err;
        },
      });
    });

    return ctrl;
  },
};
