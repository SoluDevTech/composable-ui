import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { ReactNode } from "react";
import type { LlmSettings, UpsertLlmSettingsInput } from "@/domain/entities/settings/llmSettings";

vi.mock("@/infrastructure/api/settings/settingsApi", () => ({
  settingsApi: {
    getLlmSettings: vi.fn(),
    upsertLlmSettings: vi.fn(),
    deleteLlmSettings: vi.fn(),
  },
}));

import { useLlmSettings } from "@/application/hooks/settings/useLlmSettings";
import { settingsApi } from "@/infrastructure/api/settings/settingsApi";

const sampleSettings: LlmSettings = {
  user_id: "u1",
  provider: "openai",
  base_url: "https://api.openai.com/v1",
  api_key_masked: "sk-***1234",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-02T00:00:00Z",
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useLlmSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches LLM settings on mount via settingsApi.getLlmSettings", async () => {
    vi.mocked(settingsApi.getLlmSettings).mockResolvedValue(sampleSettings);

    const { result } = renderHook(() => useLlmSettings(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.settings).toEqual(sampleSettings));
    expect(settingsApi.getLlmSettings).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("exposes an error state when fetch rejects", async () => {
    vi.mocked(settingsApi.getLlmSettings).mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() => useLlmSettings(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Network Error");
    expect(result.current.settings).toBeNull();
  });

  it("upsert calls settingsApi.upsertLlmSettings and refetches", async () => {
    vi.mocked(settingsApi.getLlmSettings).mockResolvedValue(sampleSettings);
    const updated: LlmSettings = { ...sampleSettings, provider: "openrouter" };
    const input: UpsertLlmSettingsInput = {
      provider: "openrouter",
      base_url: "https://openrouter.ai/api/v1",
      api_key: "sk-new",
    };
    vi.mocked(settingsApi.upsertLlmSettings).mockResolvedValue(updated);

    const { result } = renderHook(() => useLlmSettings(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.settings).toEqual(sampleSettings));

    await act(async () => {
      await result.current.upsert(input);
    });

    expect(settingsApi.upsertLlmSettings).toHaveBeenCalledWith(input);
  });

  it("delete calls settingsApi.deleteLlmSettings and refetches", async () => {
    vi.mocked(settingsApi.getLlmSettings).mockResolvedValue(sampleSettings);
    vi.mocked(settingsApi.deleteLlmSettings).mockResolvedValue(undefined);
    vi.mocked(settingsApi.getLlmSettings).mockResolvedValueOnce(sampleSettings);
    vi.mocked(settingsApi.getLlmSettings).mockResolvedValueOnce(null);

    const { result } = renderHook(() => useLlmSettings(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.settings).toEqual(sampleSettings));

    await act(async () => {
      await result.current.remove();
    });

    expect(settingsApi.deleteLlmSettings).toHaveBeenCalledTimes(1);
  });
});
