import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/infrastructure/api/chat/chatApi";

export function useMessages(threadId: string | null) {
  return useQuery({
    queryKey: ["messages", threadId],
    queryFn: () => {
      if (!threadId) throw new Error("threadId is required");
      return chatApi.getMessages(threadId);
    },
    enabled: !!threadId,
  });
}
