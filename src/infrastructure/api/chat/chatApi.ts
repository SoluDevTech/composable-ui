import type { ChatRequest } from "@/domain/entities/chat/chatRequest";
import type { Message } from "@/domain/entities/chat/message";
import type { Thread } from "@/domain/entities/chat/thread";
import type { TraceEvent, ThreadHistory } from "@/domain/entities/chat/traceEvent";
import { TraceEventType } from "@/domain/entities/chat/traceEvent";
import type { IChatPort } from "@/domain/ports/chat/chatPort";
import { apiClient } from "@/infrastructure/api/axiosInstance";
import { configRepository } from "@/infrastructure/config/configRepositoryInstance";
import { fetchEventSource } from "@microsoft/fetch-event-source";

const VALID_EVENT_TYPES: ReadonlySet<string> = new Set(Object.values(TraceEventType));

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidTraceEvent(parsed: unknown): parsed is TraceEvent {
  if (!isObject(parsed)) return false;
  if (typeof parsed.type !== "string" || !VALID_EVENT_TYPES.has(parsed.type)) return false;
  if (typeof parsed.id !== "string") return false;
  if (typeof parsed.thread_id !== "string") return false;
  if (typeof parsed.turn_id !== "string") return false;
  if (typeof parsed.timestamp !== "string") return false;
  if (typeof parsed.sequence !== "number") return false;
  if (parsed.source !== null && typeof parsed.source !== "string") return false;
  if (parsed.name !== null && typeof parsed.name !== "string") return false;
  if (parsed.content !== null && typeof parsed.content !== "string") return false;
  if (parsed.metadata !== null && !isObject(parsed.metadata)) return false;
  return true;
}

function isErrorPayload(parsed: unknown): parsed is { type: "error"; data: string } {
  return isObject(parsed) && parsed.type === "error" && typeof parsed.data === "string";
}

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

  async getThreadHistory(threadId: string): Promise<ThreadHistory> {
    const response = await apiClient.get<ThreadHistory>(`/api/v1/threads/${threadId}/history`);
    return response.data;
  },

  async sendMessage(threadId: string, request: ChatRequest): Promise<Message> {
    const response = await apiClient.post<Message>(`/api/v1/chat/${threadId}`, request, {
      timeout: 300000,
    });
    return response.data;
  },

  streamMessage(
    threadId: string,
    request: ChatRequest,
    onEvent: (event: TraceEvent) => void,
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
        openWhenHidden: true,
        onmessage(ev) {
          if (ev.data === "[DONE]") return;
          if (!ev.data) return;
          try {
            const parsed = JSON.parse(ev.data) as unknown;
            if (isErrorPayload(parsed)) {
              onError(new Error(parsed.data));
              return;
            }
            if (isValidTraceEvent(parsed)) {
              onEvent(parsed);
            } else {
              console.warn("[SSE] Unknown event format:", ev.data);
            }
          } catch {
            console.warn("[SSE] Failed to parse:", ev.data);
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
