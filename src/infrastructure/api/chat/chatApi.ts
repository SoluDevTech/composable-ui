import type { ChatRequest } from "@/domain/entities/chat/chatRequest";
import type { Message } from "@/domain/entities/chat/message";
import type { Thread } from "@/domain/entities/chat/thread";
import type { IChatPort } from "@/domain/ports/chat/chatPort";
import { apiClient } from "@/infrastructure/api/axiosInstance";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { envConfig } from "@/infrastructure/config/envConfig";

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
    );
    return response.data;
  },

  streamMessage(
    threadId: string,
    request: ChatRequest,
    onChunk: (data: string) => void,
    onComplete: () => void,
    onError: (err: Error) => void,
  ): AbortController {
    const ctrl = new AbortController();

    fetchEventSource(`${envConfig.apiBaseUrl}/api/v1/chat/${threadId}/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: ctrl.signal,
      onmessage(ev) {
        if (ev.data) {
          onChunk(ev.data);
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

    return ctrl;
  },
};
