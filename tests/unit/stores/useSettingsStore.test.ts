import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  useSettingsStore,
  FONT_DEFAULT,
  FONT_MONO,
} from "@/application/stores/useSettingsStore";

const STORAGE_KEY = "composable-ui-settings";

describe("useSettingsStore", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.style.removeProperty("--accent");
    // Reset to defaults and re-apply side effects.
    useSettingsStore.getState().resetToDefaults();
  });

  it("exposes the expected default values", () => {
    const state = useSettingsStore.getState();
    expect(state.accent).toBe("#ff00ff");
    expect(state.surface).toBe("#10162a");
    expect(state.chatFontSize).toBe(10);
    expect(state.chatFontFamily).toBe(FONT_DEFAULT);
    expect(state.llmProvider).toBe("anthropic");
    expect(state.apiKey).toBe("");
    expect(state.theme).toBe("dark");
  });

  it("setAccent updates state and applies the --accent CSS variable on documentElement", () => {
    useSettingsStore.getState().setAccent("#00ff00");

    expect(useSettingsStore.getState().accent).toBe("#00ff00");
    expect(document.documentElement.style.getPropertyValue("--accent")).toBe("#00ff00");
  });

  it("setSurface updates state", () => {
    useSettingsStore.getState().setSurface("#1a1025");

    expect(useSettingsStore.getState().surface).toBe("#1a1025");
  });

  it("setChatFontSize updates state", () => {
    useSettingsStore.getState().setChatFontSize(16);

    expect(useSettingsStore.getState().chatFontSize).toBe(16);
  });

  it("setChatFontFamily updates state", () => {
    useSettingsStore.getState().setChatFontFamily("Monospace");

    expect(useSettingsStore.getState().chatFontFamily).toBe("Monospace");
  });

  it("setLlmProvider updates state", () => {
    useSettingsStore.getState().setLlmProvider("openai");

    expect(useSettingsStore.getState().llmProvider).toBe("openai");
  });

  it("setApiKey updates state", () => {
    useSettingsStore.getState().setApiKey("sk-test-123");

    expect(useSettingsStore.getState().apiKey).toBe("sk-test-123");
  });

  it("setTheme('light') updates state, removes 'dark' class, and persists to localStorage", () => {
    useSettingsStore.getState().setTheme("light");

    expect(useSettingsStore.getState().theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored as string);
    expect(parsed.state.theme).toBe("light");
  });

  it("setTheme('dark') updates state, adds 'dark' class, and persists to localStorage", () => {
    // First switch to light so we can observe the dark class re-applied.
    useSettingsStore.getState().setTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    useSettingsStore.getState().setTheme("dark");

    expect(useSettingsStore.getState().theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored as string);
    expect(parsed.state.theme).toBe("dark");
  });

  it("toggleTheme() flips dark -> light and updates the 'dark' class", () => {
    expect(useSettingsStore.getState().theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    useSettingsStore.getState().toggleTheme();

    expect(useSettingsStore.getState().theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("toggleTheme() flips light -> dark and updates the 'dark' class", () => {
    useSettingsStore.setState({ theme: "light" });
    document.documentElement.classList.remove("dark");

    useSettingsStore.getState().toggleTheme();

    expect(useSettingsStore.getState().theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("resetToDefaults restores all fields to defaults and re-applies theme class + accent CSS var", () => {
    // Mutate away from defaults first.
    useSettingsStore.getState().setAccent("#123456");
    useSettingsStore.getState().setSurface("#abcdef");
    useSettingsStore.getState().setChatFontSize(18);
    useSettingsStore.getState().setChatFontFamily("Georgia");
    useSettingsStore.getState().setLlmProvider("openai");
    useSettingsStore.getState().setApiKey("sk-mutated");
    useSettingsStore.getState().setTheme("light");

    useSettingsStore.getState().resetToDefaults();

    const state = useSettingsStore.getState();
    expect(state.accent).toBe("#ff00ff");
    expect(state.surface).toBe("#10162a");
    expect(state.chatFontSize).toBe(10);
    expect(state.chatFontFamily).toBe(FONT_DEFAULT);
    expect(state.llmProvider).toBe("anthropic");
    expect(state.apiKey).toBe("");
    expect(state.theme).toBe("dark");

    // Side effects re-applied.
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--accent")).toBe("#ff00ff");
  });

  it("persists accent changes to localStorage under the 'composable-ui-settings' key", () => {
    useSettingsStore.getState().setAccent("#00ff00");

    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored as string);
    expect(parsed.state.accent).toBe("#00ff00");
  });

  it("setChatFontSize applies --app-font-scale and --chat-font-size on documentElement", () => {
    useSettingsStore.getState().setChatFontSize(16);

    expect(document.documentElement.style.getPropertyValue("--app-font-scale")).toBe(
      (16 / 12).toFixed(3),
    );
    expect(document.documentElement.style.getPropertyValue("--chat-font-size")).toBe("16px");
  });

  it("setChatFontFamily applies --app-font-family on documentElement", () => {
    useSettingsStore.getState().setChatFontFamily("Georgia, serif");

    expect(document.documentElement.style.getPropertyValue("--app-font-family")).toBe(
      "Georgia, serif",
    );
  });

  it("migrates a legacy persisted chatFontFamily='var(--font-body)' to the concrete default", () => {
    // Simulate a returning user with the old var() value in localStorage.
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: { ...useSettingsStore.getState(), chatFontFamily: "var(--font-body)" },
      }),
    );

    // Re-import side effects run at module load; to exercise readStoredSettings
    // we reset and re-create the store by reading persisted then applying.
    // Easiest: call resetToDefaults then re-load by re-reading via a fresh
    // module import is not possible here. Instead, verify the migration
    // mapping directly by simulating a store re-init through getInitialState.
    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) as string);
    expect(persisted.state.chatFontFamily).toBe("var(--font-body)");

    // Reload the module to trigger readStoredSettings() migration.
    vi.resetModules();
    return import("@/application/stores/useSettingsStore").then(({ useSettingsStore: reloaded }) => {
      expect(reloaded.getState().chatFontFamily).toBe(FONT_DEFAULT);
    });
  });

  it("migrates a legacy persisted chatFontFamily='var(--font-mono)' to the concrete mono stack", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: { ...useSettingsStore.getState(), chatFontFamily: "var(--font-mono)" },
      }),
    );

    vi.resetModules();
    return import("@/application/stores/useSettingsStore").then(({ useSettingsStore: reloaded }) => {
      expect(reloaded.getState().chatFontFamily).toBe(FONT_MONO);
    });
  });
});
