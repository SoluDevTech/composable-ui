import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/infrastructure/api/chat/chatApi";
import { useChatStore } from "@/application/stores/useChatStore";
import type { ChatRequest } from "@/domain/entities/chat/chatRequest";

function generateTurnId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `turn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useStreamChat(threadId: string | null) {
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  const stream = useCallback(
    (request: ChatRequest) => {
      if (!threadId) return;

      const { clearStream, setStreaming, setPendingUserMessage, initStreamingTurn } =
        useChatStore.getState();

      clearStream();
      const turnId = generateTurnId();
      initStreamingTurn(turnId);
      setStreaming(true);
      setPendingUserMessage(request.message ?? null);

      abortRef.current = chatApi.streamMessage(
        threadId,
        request,
        (event) => {
          useChatStore.getState().appendTraceEvent(event);
        },
        async () => {
          try {
            await queryClient.invalidateQueries({
              queryKey: ["history", threadId],
            });
          } finally {
            const { setPendingUserMessage, setStreaming } = useChatStore.getState();
            setPendingUserMessage(null);
            setStreaming(false);
          }
        },
        (error) => {
          console.error("Stream error:", error);
          useChatStore.getState().setStreaming(false);
          useChatStore.getState().setError(error.message || "An error occurred while streaming.");
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
