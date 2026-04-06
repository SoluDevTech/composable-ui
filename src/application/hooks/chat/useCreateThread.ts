import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/infrastructure/api/chat/chatApi";

export function useCreateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentName: string) => chatApi.createThread(agentName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });
}
