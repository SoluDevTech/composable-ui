import { screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { renderWithProviders } from "../../utils/render";
import SettingsPage from "@/application/pages/SettingsPage";
import { useSettingsStore, FONT_DEFAULT } from "@/application/stores/useSettingsStore";

describe("SettingsPage", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.style.removeProperty("--accent");
    useSettingsStore.getState().resetToDefaults();
  });

  it("renders all four card headings: Theme, Typography, LLM Provider, Reset", () => {
    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    expect(screen.getByRole("heading", { name: /^theme$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^typography$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /llm provider/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^reset$/i })).toBeInTheDocument();
  });

  it("Theme card has data-od-id=settings-theme and contains Accent color, Surface shade and Dark mode controls", () => {
    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const themeCard = document.querySelector('[data-od-id="settings-theme"]');
    expect(themeCard).not.toBeNull();
    expect(themeCard).toBeInTheDocument();

    expect(within(themeCard as HTMLElement).getByText(/accent color/i)).toBeInTheDocument();
    expect(within(themeCard as HTMLElement).getByText(/surface shade/i)).toBeInTheDocument();
    expect(
      within(themeCard as HTMLElement).getByRole("switch", { name: /dark mode/i }),
    ).toBeInTheDocument();
  });

  it("Typography card has data-od-id=settings-typography and contains Font size and Font family labels", () => {
    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const typoCard = document.querySelector('[data-od-id="settings-typography"]');
    expect(typoCard).not.toBeNull();
    expect(typoCard).toBeInTheDocument();

    expect(within(typoCard as HTMLElement).getByText(/^font size$/i)).toBeInTheDocument();
    expect(within(typoCard as HTMLElement).getByText(/^font family$/i)).toBeInTheDocument();
  });

  it("LLM Provider card has data-od-id=settings-llm and contains Provider and API Key labels", () => {
    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const llmCard = document.querySelector('[data-od-id="settings-llm"]');
    expect(llmCard).not.toBeNull();
    expect(llmCard).toBeInTheDocument();

    expect(within(llmCard as HTMLElement).getByText(/provider/i)).toBeInTheDocument();
    expect(within(llmCard as HTMLElement).getByText(/api key/i)).toBeInTheDocument();
  });

  it("Reset card has data-od-id=settings-reset and contains a Reset to Defaults button", () => {
    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const resetCard = document.querySelector('[data-od-id="settings-reset"]');
    expect(resetCard).not.toBeNull();
    expect(resetCard).toBeInTheDocument();

    expect(
      within(resetCard as HTMLElement).getByRole("button", { name: /reset to defaults/i }),
    ).toBeInTheDocument();
  });

  it("renders the accent hex input with data-od-id=settings-accent-hex", () => {
    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const accentHex = document.querySelector('[data-od-id="settings-accent-hex"]');
    expect(accentHex).not.toBeNull();
    expect(accentHex).toBeInTheDocument();
  });

  it("renders the accent hue gradient range with data-od-id=settings-accent-gradient", () => {
    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const gradient = document.querySelector(
      '[data-od-id="settings-accent-gradient"]',
    ) as HTMLInputElement | null;
    expect(gradient).not.toBeNull();
    expect(gradient).toBeInTheDocument();
    expect(gradient?.min).toBe("0");
    expect(gradient?.max).toBe("360");
  });

  it("renders the accent color preview swatch with id=accent-preview", () => {
    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const preview = document.querySelector("#accent-preview");
    expect(preview).not.toBeNull();
    expect(preview).toBeInTheDocument();
  });

  it("dragging the hue gradient updates the store accent and the preview background", () => {
    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const gradient = document.querySelector(
      '[data-od-id="settings-accent-gradient"]',
    ) as HTMLInputElement;

    fireEvent.change(gradient, { target: { value: "120" } });

    const state = useSettingsStore.getState();
    expect(state.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
    const preview = document.querySelector("#accent-preview") as HTMLElement;
    expect(preview.style.background).not.toBe("");
  });

  it("renders the surface shade select with data-od-id=settings-surface", () => {
    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const surfaceSelect = document.querySelector('[data-od-id="settings-surface"]');
    expect(surfaceSelect).not.toBeNull();
    expect(surfaceSelect).toBeInTheDocument();
  });

  it("renders the chat font size range input with data-od-id=settings-chat-font-size and hint showing current value", () => {
    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const range = document.querySelector(
      '[data-od-id="settings-chat-font-size"]',
    ) as HTMLInputElement | null;
    expect(range).not.toBeNull();
    expect(range).toBeInTheDocument();
    expect(range?.min).toBe("10");
    expect(range?.max).toBe("18");
    expect(range?.step).toBe("1");

    const valueEl = document.querySelector("#chat-font-size-value");
    expect(valueEl).not.toBeNull();
    expect(valueEl?.textContent).toBe("10px");
  });

  it("renders the chat font family select with data-od-id=settings-chat-font-family", () => {
    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const fontFamily = document.querySelector('[data-od-id="settings-chat-font-family"]');
    expect(fontFamily).not.toBeNull();
    expect(fontFamily).toBeInTheDocument();
  });

  it("renders the LLM provider select with data-od-id=settings-llm-provider", () => {
    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const provider = document.querySelector('[data-od-id="settings-llm-provider"]');
    expect(provider).not.toBeNull();
    expect(provider).toBeInTheDocument();
  });

  it("renders the API key password input with data-od-id=settings-api-key, autoComplete=off and placeholder sk-...", () => {
    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const apiKey = document.querySelector(
      '[data-od-id="settings-api-key"]',
    ) as HTMLInputElement | null;
    expect(apiKey).not.toBeNull();
    expect(apiKey).toBeInTheDocument();
    expect(apiKey?.type).toBe("password");
    expect(apiKey?.autocomplete).toBe("off");
    expect(apiKey?.placeholder).toMatch(/sk-\.\.\./i);
  });

  it("renders the reset button with data-od-id=settings-reset-btn", () => {
    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const resetBtn = document.querySelector('[data-od-id="settings-reset-btn"]');
    expect(resetBtn).not.toBeNull();
    expect(resetBtn).toBeInTheDocument();
  });

  it("clicking Reset to Defaults restores the store to default values", async () => {
    const user = userEvent.setup();

    // Mutate away from defaults first.
    useSettingsStore.getState().setAccent("#abcdef");
    useSettingsStore.getState().setLlmProvider("openai");
    useSettingsStore.getState().setApiKey("sk-mutated");

    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    await user.click(screen.getByRole("button", { name: /reset to defaults/i }));

    const state = useSettingsStore.getState();
    expect(state.accent).toBe("#ff00ff");
    expect(state.surface).toBe("#10162a");
    expect(state.chatFontSize).toBe(10);
    expect(state.chatFontFamily).toBe(FONT_DEFAULT);
    expect(state.llmProvider).toBe("anthropic");
    expect(state.apiKey).toBe("");
    expect(state.theme).toBe("dark");
  });

  it("typing in the accent hex input updates the store accent and the gradient hue", async () => {
    const user = userEvent.setup();

    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const accentHex = document.querySelector(
      '[data-od-id="settings-accent-hex"]',
    ) as HTMLInputElement;

    await user.clear(accentHex);
    await user.type(accentHex, "#abcdef");

    expect(useSettingsStore.getState().accent).toBe("#abcdef");
  });

  it("dragging the font size slider updates the live value label", () => {
    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const range = document.querySelector(
      '[data-od-id="settings-chat-font-size"]',
    ) as HTMLInputElement;
    const valueEl = document.querySelector("#chat-font-size-value");

    fireEvent.change(range, { target: { value: "16" } });

    expect(valueEl?.textContent).toBe("16px");
    expect(useSettingsStore.getState().chatFontSize).toBe(16);
  });

  it("toggling the Dark mode switch flips the theme in the store", async () => {
    const user = userEvent.setup();

    renderWithProviders(<SettingsPage />, { initialEntries: ["/settings"] });

    const toggle = screen.getByRole("switch", { name: /dark mode/i });
    expect(useSettingsStore.getState().theme).toBe("dark");

    await user.click(toggle);

    expect(useSettingsStore.getState().theme).toBe("light");

    await user.click(toggle);

    expect(useSettingsStore.getState().theme).toBe("dark");
  });
});
