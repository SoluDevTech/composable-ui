import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/infrastructure/api/chat/chatApi";
import { useChatStore } from "@/application/stores/useChatStore";
import type { ChatRequest } from "@/domain/entities/chat/chatRequest";

export function useStreamChat(threadId: string | null) {
  const queryClient = useQueryClient();
  const { setStreaming, appendStreamChunk, clearStream } = useChatStore();
  const abortRef = useRef<AbortController | null>(null);

  const stream = useCallback(
    (request: ChatRequest) => {
      if (!threadId) return;

      clearStream();
      setStreaming(true);

      abortRef.current = chatApi.streamMessage(
        threadId,
        request,
        (chunk) => {
          appendStreamChunk(chunk);
        },
        () => {
          setStreaming(false);
          queryClient.invalidateQueries({ queryKey: ["messages", threadId] });
        },
        (error) => {
          console.error("Stream error:", error);
          setStreaming(false);
        },
      );
    },
    [threadId, clearStream, setStreaming, appendStreamChunk, queryClient],
  );

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      setStreaming(false);
    }
  }, [setStreaming]);

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  return { stream, cancel };
}
