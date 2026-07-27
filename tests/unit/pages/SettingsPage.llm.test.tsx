import { screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { LlmSettings } from "@/domain/entities/settings/llmSettings";

// Mock the LLM settings hook so we don't hit the network in page tests.
const mockUseLlmSettings = vi.fn();
vi.mock("@/application/hooks/settings/useLlmSettings", () => ({
  useLlmSettings: () => mockUseLlmSettings(),
}));

// Mock the API keys hook to keep the page isolated from network.
const mockUseApiKeys = vi.fn();
vi.mock("@/application/hooks/auth/useApiKeys", () => ({
  useApiKeys: () => mockUseApiKeys(),
}));

import { renderWithProviders } from "../../utils/render";
import SettingsPage from "@/application/pages/SettingsPage";
import { useSettingsStore } from "@/application/stores/useSettingsStore";

function defaultLlmHookState(overrides: Partial<ReturnType<typeof mockUseLlmSettings>> = {}) {
  return {
    settings: null as LlmSettings | null,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    upsert: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    isUpserting: false,
    isRemoving: false,
    ...overrides,
  };
}

function defaultApiKeysHookState(overrides: Partial<ReturnType<typeof mockUseApiKeys>> = {}) {
  return {
    keys: [],
    isLoading: false,
    isError: false,
    error: null as Error | null,
    create: vi.fn(),
    revoke: vi.fn().mockResolvedValue(undefined),
    isCreating: false,
    isRevoking: false,
    ...overrides,
  };
}

describe("SettingsPage — LLM card (backend persisted)", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.style.removeProperty("--accent");
    useSettingsStore.getState().resetToDefaults();
    mockUseLlmSettings.mockReturnValue(defaultLlmHookState());
    mockUseApiKeys.mockReturnValue(defaultApiKeysHookState());
  });

  it("renders the LLM Provider card with data-od-id=settings-llm and Provider/Base URL/API Key fields", () => {
    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const llmCard = document.querySelector('[data-od-id="settings-llm"]');
    expect(llmCard).not.toBeNull();
    expect(llmCard).toBeInTheDocument();

    // Use exact label matchers (case-insensitive) to avoid the heading "LLM
    // Provider" matching /provider/i too.
    expect(within(llmCard as HTMLElement).getByText(/^provider$/i)).toBeInTheDocument();
    expect(within(llmCard as HTMLElement).getByText(/base url/i)).toBeInTheDocument();
    expect(within(llmCard as HTMLElement).getByText(/^api key$/i)).toBeInTheDocument();
  });

  it("shows the masked key when settings are configured", () => {
    mockUseLlmSettings.mockReturnValue(
      defaultLlmHookState({
        settings: {
          user_id: "u1",
          provider: "openai",
          base_url: "https://api.openai.com/v1",
          api_key_masked: "sk-***1234",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-02T00:00:00Z",
        },
      }),
    );

    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    // The masked key is rendered as "Current key: sk-***1234" but split across
    // two text nodes ("Current key: " + the masked value), so use a function
    // matcher that joins the parent element's text content.
    const llmCard = document.querySelector('[data-od-id="settings-llm"]') as HTMLElement;
    expect(llmCard).not.toBeNull();
    expect(llmCard?.textContent).toContain("sk-***1234");
  });

  it("save button calls upsert with provider/base_url/api_key", async () => {
    const upsert = vi.fn().mockResolvedValue(undefined);
    mockUseLlmSettings.mockReturnValue(defaultLlmHookState({ upsert }));

    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    // The form uses react-hook-form + zod; api_key is required so we must
    // fill it before submitting.
    const apiKeyInput = document.querySelector(
      '[data-od-id="settings-llm-api-key"]',
    ) as HTMLInputElement;
    await userEvent.type(apiKeyInput, "sk-test-secret");

    const saveBtn = screen.getByRole("button", { name: /save llm settings/i });
    await userEvent.click(saveBtn);

    await waitFor(() => expect(upsert).toHaveBeenCalledTimes(1));
    const call = upsert.mock.calls[0][0];
    expect(call).toHaveProperty("provider");
    expect(call).toHaveProperty("base_url");
    expect(call).toHaveProperty("api_key", "sk-test-secret");
  });

  it("delete button calls remove", async () => {
    const remove = vi.fn().mockResolvedValue(undefined);
    mockUseLlmSettings.mockReturnValue(
      defaultLlmHookState({
        settings: {
          user_id: "u1",
          provider: "openai",
          base_url: "https://api.openai.com/v1",
          api_key_masked: "sk-***",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-02T00:00:00Z",
        },
        remove,
      }),
    );

    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const deleteBtn = screen.getByRole("button", { name: /delete llm settings/i });
    await userEvent.click(deleteBtn);

    await waitFor(() => expect(remove).toHaveBeenCalledTimes(1));
  });

  it("shows a loading indicator while initial settings are loading", () => {
    mockUseLlmSettings.mockReturnValue(defaultLlmHookState({ isLoading: true, settings: null }));

    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    expect(screen.getByText(/loading llm settings/i)).toBeInTheDocument();
  });
});
