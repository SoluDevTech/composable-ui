import { vi, describe, it, expect, beforeEach } from "vitest";
import { chatApi } from "@/infrastructure/api/chat/chatApi";
import { apiClient } from "@/infrastructure/api/axiosInstance";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import {
  createThread,
  createMessage,
  createTraceEvent,
  createThreadHistory,
} from "../../../../fixtures/external";
import { TraceEventType } from "@/domain/entities/chat/traceEvent";

vi.mock("@/infrastructure/api/axiosInstance", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@microsoft/fetch-event-source", () => ({
  fetchEventSource: vi.fn(),
}));

vi.mock("@/infrastructure/config/configRepositoryInstance", () => ({
  configRepository: {
    getConfig: vi.fn().mockResolvedValue({ apiBaseUrl: "http://localhost:8010" }),
  },
}));

describe("chatApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createThread", () => {
    it("posts to /api/v1/threads with agent_name", async () => {
      const thread = createThread();
      vi.mocked(apiClient.post).mockResolvedValue({ data: thread });

      const result = await chatApi.createThread("test-agent");

      expect(apiClient.post).toHaveBeenCalledWith("/api/v1/threads", {
        agent_name: "test-agent",
      });
      expect(result).toEqual(thread);
    });
  });

  describe("listThreads", () => {
    it("fetches from GET /api/v1/threads", async () => {
      const threads = [createThread()];
      vi.mocked(apiClient.get).mockResolvedValue({ data: threads });

      const result = await chatApi.listThreads();

      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/threads");
      expect(result).toEqual(threads);
    });
  });

  describe("getThread", () => {
    it("fetches from GET /api/v1/threads/{id}", async () => {
      const thread = createThread();
      vi.mocked(apiClient.get).mockResolvedValue({ data: thread });

      const result = await chatApi.getThread("thread-123");

      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/threads/thread-123");
      expect(result).toEqual(thread);
    });
  });

  describe("deleteThread", () => {
    it("sends DELETE to /api/v1/threads/{id}", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});

      await chatApi.deleteThread("thread-123");

      expect(apiClient.delete).toHaveBeenCalledWith("/api/v1/threads/thread-123");
    });
  });

  describe("getThreadHistory", () => {
    it("fetches from GET /api/v1/threads/{id}/history", async () => {
      const history = createThreadHistory();
      vi.mocked(apiClient.get).mockResolvedValue({ data: history });

      const result = await chatApi.getThreadHistory("thread-123");

      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/threads/thread-123/history");
      expect(result).toEqual(history);
    });
  });

  describe("sendMessage", () => {
    it("posts ChatRequest to /api/v1/chat/{id}", async () => {
      const message = createMessage();
      vi.mocked(apiClient.post).mockResolvedValue({ data: message });

      const result = await chatApi.sendMessage("thread-123", {
        message: "Hello",
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/v1/chat/thread-123",
        {
          message: "Hello",
        },
        { timeout: 300000 },
      );
      expect(result).toEqual(message);
    });
  });

  describe("streamMessage", () => {
    function captureCallbacks() {
      const captured: { opts: Record<string, unknown> } = { opts: {} };
      vi.mocked(fetchEventSource).mockImplementation(
        (_url: string, opts: Record<string, unknown>) => {
          captured.opts = opts;
          return Promise.resolve();
        },
      );
      return captured;
    }

    it("POSTs to /api/v1/chat/{id}/stream and forwards TraceEvent to onEvent", async () => {
      const captured = captureCallbacks();
      const onEvent = vi.fn();
      const onComplete = vi.fn();
      const onError = vi.fn();

      chatApi.streamMessage("thread-123", { message: "Hello" }, onEvent, onComplete, onError);

      await Promise.resolve();
      await Promise.resolve();

      expect(fetchEventSource).toHaveBeenCalledTimes(1);
      const url = vi.mocked(fetchEventSource).mock.calls[0]?.[0];
      expect(url).toBe("http://localhost:8010/api/v1/chat/thread-123/stream");

      const opts = captured.opts as {
        method: string;
        body: string;
        onmessage: (ev: { data: string }) => void;
      };
      expect(opts.method).toBe("POST");
      expect(opts.body).toBe(JSON.stringify({ message: "Hello" }));

      const traceEvent = createTraceEvent({
        type: TraceEventType.THINKING,
        content: "Reasoning...",
        source: null,
      });
      opts.onmessage({ data: JSON.stringify(traceEvent) });
      expect(onEvent).toHaveBeenCalledWith(traceEvent);
    });

    it("ignores [DONE] sentinel without calling onEvent", async () => {
      const captured = captureCallbacks();
      const onEvent = vi.fn();

      chatApi.streamMessage("thread-123", { message: "Hi" }, onEvent, vi.fn(), vi.fn());

      await Promise.resolve();
      await Promise.resolve();

      (captured.opts as { onmessage: (ev: { data: string }) => void }).onmessage({
        data: "[DONE]",
      });
      expect(onEvent).not.toHaveBeenCalled();
    });

    it("calls onError when payload is {type:'error', data:'...'}", async () => {
      const captured = captureCallbacks();
      const onError = vi.fn();

      chatApi.streamMessage("thread-123", { message: "Hi" }, vi.fn(), vi.fn(), onError);

      await Promise.resolve();
      await Promise.resolve();

      (captured.opts as { onmessage: (ev: { data: string }) => void }).onmessage({
        data: JSON.stringify({ type: "error", data: "Tool crashed" }),
      });
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
      expect((onError.mock.calls[0][0] as Error).message).toBe("Tool crashed");
    });

    it("warns on unknown event format (no onEvent, no onError)", async () => {
      const captured = captureCallbacks();
      const onEvent = vi.fn();
      const onError = vi.fn();
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      chatApi.streamMessage("thread-123", { message: "Hi" }, onEvent, vi.fn(), onError);

      await Promise.resolve();
      await Promise.resolve();

      (captured.opts as { onmessage: (ev: { data: string }) => void }).onmessage({
        data: JSON.stringify({ foo: "bar" }),
      });
      expect(onEvent).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it("warns on unparseable data", async () => {
      const captured = captureCallbacks();
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      chatApi.streamMessage("thread-123", { message: "Hi" }, vi.fn(), vi.fn(), vi.fn());

      await Promise.resolve();
      await Promise.resolve();

      (captured.opts as { onmessage: (ev: { data: string }) => void }).onmessage({
        data: "not-json{",
      });
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it("invokes onComplete on close", async () => {
      const captured = captureCallbacks();
      const onComplete = vi.fn();

      chatApi.streamMessage("thread-123", { message: "Hi" }, vi.fn(), onComplete, vi.fn());

      await Promise.resolve();
      await Promise.resolve();

      (captured.opts as { onclose: () => void }).onclose();
      expect(onComplete).toHaveBeenCalled();
    });

    it("returns an AbortController", () => {
      const ctrl = chatApi.streamMessage(
        "thread-123",
        { message: "Hi" },
        vi.fn(),
        vi.fn(),
        vi.fn(),
      );
      expect(ctrl).toBeInstanceOf(AbortController);
    });

    it("forwards AI_MESSAGE event with structured_response in content JSON (not metadata)", async () => {
      const captured = captureCallbacks();
      const onEvent = vi.fn();

      chatApi.streamMessage("thread-123", { message: "Hi" }, onEvent, vi.fn(), vi.fn());

      await Promise.resolve();
      await Promise.resolve();

      const aiEvent = createTraceEvent({
        type: TraceEventType.AI_MESSAGE,
        content: JSON.stringify({
          role: "ai",
          content: "Done",
          structured_response: { answer: 42 },
        }),
        metadata: { status: "completed" },
        turn_id: "turn-42",
      });
      (captured.opts as { onmessage: (ev: { data: string }) => void }).onmessage({
        data: JSON.stringify(aiEvent),
      });
      expect(onEvent).toHaveBeenCalledWith(aiEvent);
      expect(aiEvent.metadata).toEqual({ status: "completed" });
    });
  });
});
