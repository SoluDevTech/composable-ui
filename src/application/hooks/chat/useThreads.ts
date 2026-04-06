import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/infrastructure/api/chat/chatApi";

export function useThreads() {
  return useQuery({
    queryKey: ["threads"],
    queryFn: () => chatApi.listThreads(),
  });
}
