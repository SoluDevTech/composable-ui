import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
      useChatStore.getState().setPendingUserMessage(request.message ?? null);

      abortRef.current = chatApi.streamMessage(
        threadId,
        request,
        (chunk) => {
          appendStreamChunk(chunk);
        },
        async () => {
          try {
            await queryClient.invalidateQueries({
              queryKey: ["messages", threadId],
            });
          } finally {
            useChatStore.getState().setPendingUserMessage(null);
            setStreaming(false);
          }
        },
        (error) => {
          console.error("Stream error:", error);
          useChatStore.getState().setPendingUserMessage(null);
          setStreaming(false);
          toast.error("Stream error", {
            description: error.message || "An error occurred while streaming.",
          });
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
