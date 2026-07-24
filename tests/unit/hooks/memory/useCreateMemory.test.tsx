import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useCreateMemory } from "@/application/hooks/memory/useCreateMemory";
import { storeApi } from "@/infrastructure/api/store/storeApi";
import type { ReactNode } from "react";

vi.mock("@/infrastructure/api/store/storeApi", () => ({
  storeApi: {
    listFiles: vi.fn(),
    getFile: vi.fn(),
    putFile: vi.fn(),
    deleteFile: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
    queryClient,
  };
}

describe("useCreateMemory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a memory when no collision", async () => {
    // Arrange — getFile returns null (file does not exist)
    vi.mocked(storeApi.getFile).mockResolvedValue(null);
    vi.mocked(storeApi.putFile).mockResolvedValue(undefined);
    const { wrapper } = createWrapper();

    // Act
    const { result } = renderHook(() => useCreateMemory(), { wrapper });

    act(() => {
      result.current.mutate({ name: "AGENTS", content: "# Rules" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(storeApi.getFile).toHaveBeenCalledWith("/memories/AGENTS.md");
    expect(storeApi.putFile).toHaveBeenCalledWith("/memories/AGENTS.md", "# Rules");
  });

  it("blocks creation when a memory with the same name already exists", async () => {
    // Arrange — getFile returns an existing file (collision)
    vi.mocked(storeApi.getFile).mockResolvedValue({
      path: "/memories/AGENTS.md",
      content: "# Existing rules",
    });
    const { wrapper } = createWrapper();

    // Act
    const { result } = renderHook(() => useCreateMemory(), { wrapper });

    act(() => {
      result.current.mutate({ name: "AGENTS", content: "# New rules" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert — putFile must NOT be called, error must mention the collision
    expect(storeApi.putFile).not.toHaveBeenCalled();
    expect(result.current.error?.message).toContain('A memory named "AGENTS" already exists');
  });

  it("invalidates ['store-files'] on success", async () => {
    // Arrange
    vi.mocked(storeApi.getFile).mockResolvedValue(null);
    vi.mocked(storeApi.putFile).mockResolvedValue(undefined);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    // Act
    const { result } = renderHook(() => useCreateMemory(), { wrapper });

    act(() => {
      result.current.mutate({ name: "AGENTS", content: "# Rules" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["store-files"] });
  });
});
