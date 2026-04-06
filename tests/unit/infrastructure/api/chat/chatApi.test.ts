import { vi, describe, it, expect, beforeEach } from "vitest";
import { chatApi } from "@/infrastructure/api/chat/chatApi";
import { apiClient } from "@/infrastructure/api/axiosInstance";
import { createThread, createMessage } from "../../../../fixtures/external";

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

      expect(apiClient.delete).toHaveBeenCalledWith(
        "/api/v1/threads/thread-123",
      );
    });
  });

  describe("getMessages", () => {
    it("fetches from GET /api/v1/threads/{id}/messages", async () => {
      const messages = [createMessage()];
      vi.mocked(apiClient.get).mockResolvedValue({ data: messages });

      const result = await chatApi.getMessages("thread-123");

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/v1/threads/thread-123/messages",
      );
      expect(result).toEqual(messages);
    });
  });

  describe("sendMessage", () => {
    it("posts ChatRequest to /api/v1/chat/{id}", async () => {
      const message = createMessage();
      vi.mocked(apiClient.post).mockResolvedValue({ data: message });

      const result = await chatApi.sendMessage("thread-123", {
        message: "Hello",
      });

      expect(apiClient.post).toHaveBeenCalledWith("/api/v1/chat/thread-123", {
        message: "Hello",
      });
      expect(result).toEqual(message);
    });
  });
});
