import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { chatApi } from "@/infrastructure/api/chat/chatApi";
import { useChatStore } from "@/application/stores/useChatStore";
import type { ChatRequest } from "@/domain/entities/chat/chatRequest";
import type { StreamEvent } from "@/domain/entities/chat/streamEvent";

export function useStreamChat(threadId: string | null) {
  const queryClient = useQueryClient();
  const store = useChatStore();
  const abortRef = useRef<AbortController | null>(null);

  const stream = useCallback(
    (request: ChatRequest) => {
      if (!threadId) return;

      store.clearStream();
      store.setStreaming(true);
      store.setPendingUserMessage(request.message ?? null);

      abortRef.current = chatApi.streamMessage(
        threadId,
        request,
        (event: StreamEvent) => {
          store.appendStreamEvent(event);
        },
        async () => {
          try {
            await queryClient.invalidateQueries({
              queryKey: ["messages", threadId],
            });
          } finally {
            store.setPendingUserMessage(null);
            store.setStreaming(false);
          }
        },
        (error) => {
          console.error("Stream error:", error);
          store.setPendingUserMessage(null);
          store.setStreaming(false);
          toast.error("Stream error", {
            description: error.message || "An error occurred while streaming.",
          });
        },
      );
    },
    [threadId, store, queryClient],
  );

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      store.setStreaming(false);
    }
  }, [store]);

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  return { stream, cancel };
}
