import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/infrastructure/api/chat/chatApi";
import type { ChatRequest } from "@/domain/entities/chat/chatRequest";

export function useSendMessage(threadId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ChatRequest) => {
      if (!threadId)
        throw new Error("Cannot send message without an active thread");
      return chatApi.sendMessage(threadId, request);
    },
    onSuccess: () => {
      if (threadId) {
        queryClient.invalidateQueries({ queryKey: ["messages", threadId] });
      }
    },
  });
}
