import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/infrastructure/api/chat/chatApi";
import { useChatStore } from "@/application/stores/useChatStore";
import { StreamEventType } from "@/domain/entities/chat/streamEvent";
import type { ChatRequest } from "@/domain/entities/chat/chatRequest";

export function useStreamChat(threadId: string | null) {
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  const stream = useCallback(
    (request: ChatRequest) => {
      if (!threadId) return;

      const {
        clearStream,
        setStreaming,
        setPendingUserMessage,
        // setError read via getState() in callbacks
      } = useChatStore.getState();

      clearStream();
      setStreaming(true);
      setPendingUserMessage(request.message ?? null);

      abortRef.current = chatApi.streamMessage(
        threadId,
        request,
        (event) => {
          if (event.type === StreamEventType.ERROR) {
            useChatStore.getState().setStreaming(false);
            useChatStore.getState().setError(event.data);
            return;
          }
          useChatStore.getState().appendStreamEvent(event);
        },
        async () => {
          try {
            await queryClient.invalidateQueries({
              queryKey: ["messages", threadId],
            });
          } finally {
            const { setPendingUserMessage, setStreaming } =
              useChatStore.getState();
            setPendingUserMessage(null);
            setStreaming(false);
          }
        },
        (error) => {
          console.error("Stream error:", error);
          useChatStore.getState().setStreaming(false);
          useChatStore.getState().setError(
            error.message || "An error occurred while streaming.",
          );
        },
      );
    },
    [threadId, queryClient],
  );

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      useChatStore.getState().clearStream();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  return { stream, cancel };
}
