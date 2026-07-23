import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/infrastructure/api/chat/chatApi";

export function useThreadHistory(threadId: string | null) {
  return useQuery({
    queryKey: ["history", threadId],
    queryFn: () => {
      if (!threadId) throw new Error("threadId is required");
      return chatApi.getThreadHistory(threadId);
    },
    enabled: !!threadId,
  });
}
