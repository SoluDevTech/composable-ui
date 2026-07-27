import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { ApiKeyView, CreatedApiKey } from "@/domain/entities/auth/apiKey";

const mockUseLlmSettings = vi.fn();
vi.mock("@/application/hooks/settings/useLlmSettings", () => ({
  useLlmSettings: () => mockUseLlmSettings(),
}));

const mockUseApiKeys = vi.fn();
vi.mock("@/application/hooks/auth/useApiKeys", () => ({
  useApiKeys: () => mockUseApiKeys(),
}));

import { renderWithProviders } from "../../utils/render";
import SettingsPage from "@/application/pages/SettingsPage";
import { useSettingsStore } from "@/application/stores/useSettingsStore";

function defaultLlmHookState(overrides: Record<string, unknown> = {}) {
  return {
    settings: null,
    isLoading: false,
    isError: false,
    error: null,
    upsert: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    isUpserting: false,
    isRemoving: false,
    ...overrides,
  };
}

function defaultApiKeysHookState(overrides: Record<string, unknown> = {}) {
  return {
    keys: [] as ApiKeyView[],
    isLoading: false,
    isError: false,
    error: null,
    create: vi.fn(),
    revoke: vi.fn().mockResolvedValue(undefined),
    isCreating: false,
    isRevoking: false,
    ...overrides,
  };
}

describe("SettingsPage — API Keys card", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.style.removeProperty("--accent");
    useSettingsStore.getState().resetToDefaults();
    mockUseLlmSettings.mockReturnValue(defaultLlmHookState());
    mockUseApiKeys.mockReturnValue(defaultApiKeysHookState());
  });

  it("renders the API Keys card with data-od-id=settings-api-keys", () => {
    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const keysCard = document.querySelector('[data-od-id="settings-api-keys"]');
    expect(keysCard).not.toBeNull();
    expect(keysCard).toBeInTheDocument();
  });

  it("lists existing keys with name, key_prefix, created_at, last_used_at and status", () => {
    const keys: ApiKeyView[] = [
      {
        id: "k1",
        name: "ci",
        key_prefix: "csk_abc12",
        created_at: "2025-01-01T00:00:00Z",
        last_used_at: "2025-01-04T00:00:00Z",
        revoked_at: null,
      },
    ];
    mockUseApiKeys.mockReturnValue(defaultApiKeysHookState({ keys }));

    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    expect(screen.getByText("ci")).toBeInTheDocument();
    expect(screen.getByText(/csk_abc12/)).toBeInTheDocument();
    // Active status badge
    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it("create flow: typing a name and submitting shows the plaintext once with a copy button and a warning", async () => {
    const created: CreatedApiKey = {
      id: "k2",
      name: "ci-2",
      key_prefix: "csk_xyz99",
      plaintext: "csk_live_supersecret",
      created_at: "2025-01-05T00:00:00Z",
    };
    const createMock = vi.fn().mockResolvedValue(created);
    mockUseApiKeys.mockReturnValue(defaultApiKeysHookState({ create: createMock }));

    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const nameInput = screen.getByLabelText(/new api key name/i);
    await userEvent.type(nameInput, "ci-2");

    const createBtn = screen.getByRole("button", { name: /create key/i });
    await userEvent.click(createBtn);

    await waitFor(() => expect(createMock).toHaveBeenCalledWith({ name: "ci-2" }));

    // Plaintext is shown once.
    expect(await screen.findByText(/csk_live_supersecret/)).toBeInTheDocument();
    // Warning that it won't be shown again.
    expect(screen.getByText(/won't see this again/i)).toBeInTheDocument();
    // Copy button is present.
    expect(screen.getByRole("button", { name: /copy key/i })).toBeInTheDocument();
  });

  it("revoke flow: clicking revoke opens a confirmation dialog and confirming calls revoke(id)", async () => {
    const keys: ApiKeyView[] = [
      {
        id: "k1",
        name: "ci",
        key_prefix: "csk_abc12",
        created_at: "2025-01-01T00:00:00Z",
        last_used_at: null,
        revoked_at: null,
      },
    ];
    const revokeMock = vi.fn().mockResolvedValue(undefined);
    mockUseApiKeys.mockReturnValue(defaultApiKeysHookState({ keys, revoke: revokeMock }));

    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const revokeBtn = screen.getByRole("button", { name: /revoke/i });
    await userEvent.click(revokeBtn);

    // Confirmation dialog appears.
    expect(await screen.findByText(/revoke api key/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: /^confirm revoke$/i });
    await userEvent.click(confirmBtn);

    await waitFor(() => expect(revokeMock).toHaveBeenCalledWith("k1"));
  });

  it("shows a loading indicator while keys are loading", () => {
    mockUseApiKeys.mockReturnValue(defaultApiKeysHookState({ isLoading: true }));

    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    expect(screen.getByText(/loading api keys/i)).toBeInTheDocument();
  });

  it("shows the sign out button linking to /oauth2/sign_out", () => {
    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const signOut = screen.getByRole("button", { name: /sign out/i });
    expect(signOut).toBeInTheDocument();
  });
});
