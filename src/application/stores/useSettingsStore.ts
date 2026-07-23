import { create } from "zustand";
import { accentOnFor, isValidHex } from "@/application/lib/color";

export type Theme = "dark" | "light";

const STORAGE_KEY = "composable-ui-settings";
const THEME_SYNC_KEY = "composable-ui-theme";

const DEFAULTS = {
  accent: "#ff00ff",
  surface: "#10162a",
  chatFontSize: 10,
  chatFontFamily: "var(--font-body)",
  llmProvider: "anthropic",
  apiKey: "",
  theme: "dark" as Theme,
};

interface SettingsState {
  accent: string;
  surface: string;
  chatFontSize: number;
  chatFontFamily: string;
  llmProvider: string;
  apiKey: string;
  theme: Theme;
  setAccent: (hex: string) => void;
  setSurface: (hex: string) => void;
  setChatFontSize: (n: number) => void;
  setChatFontFamily: (s: string) => void;
  setLlmProvider: (s: string) => void;
  setApiKey: (s: string) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  resetToDefaults: () => void;
}

function readStoredSettings(): Partial<SettingsState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { state?: Partial<SettingsState> };
      if (parsed.state) return parsed.state;
    }
  } catch {
    // localStorage may be unavailable (private mode, SSR, jsdom edge cases)
  }
  return {};
}

function applyThemeClass(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(THEME_SYNC_KEY, theme);
  } catch {
    // localStorage may be unavailable
  }
}

// Only --accent, --meta and --accent-on are driven by the store. Surface,
// chat font size and chat font family stay CSS-var driven via :root so the
// dark/light theme tokens keep precedence. We deliberately do NOT pin --surface
// inline (that would override the light theme's surface token and break the
// dark/light toggle). The chat font is exposed via --chat-font-size and
// --app-font-family which are purely additive (not themed) so safe to set.
function applyAccent(accent: string): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--accent", accent);
  root.style.setProperty("--meta", accent);
  root.style.setProperty("--accent-on", accentOnFor(accent));
}

function applyChatTypography(size: number, family: string): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--app-font-scale", (size / 12).toFixed(3));
  root.style.setProperty("--app-font-family", family);
  root.style.setProperty("--chat-font-size", `${size}px`);
}

function persist(state: SettingsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state }));
  } catch {
    // ignore persistence failures
  }
}

const persisted = readStoredSettings();
const initialState: SettingsState = { ...DEFAULTS, ...persisted } as SettingsState;
applyThemeClass(initialState.theme);
applyAccent(initialState.accent);
applyChatTypography(initialState.chatFontSize, initialState.chatFontFamily);

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...initialState,
  setAccent: (accent) => {
    if (!isValidHex(accent)) return;
    set({ accent });
    applyAccent(accent);
    persist(get());
  },
  setSurface: (surface) => {
    set({ surface });
    persist(get());
  },
  setChatFontSize: (chatFontSize) => {
    set({ chatFontSize });
    applyChatTypography(get().chatFontSize, get().chatFontFamily);
    persist(get());
  },
  setChatFontFamily: (chatFontFamily) => {
    set({ chatFontFamily });
    applyChatTypography(get().chatFontSize, get().chatFontFamily);
    persist(get());
  },
  setLlmProvider: (llmProvider) => {
    set({ llmProvider });
    persist(get());
  },
  setApiKey: (apiKey) => {
    set({ apiKey });
    persist(get());
  },
  setTheme: (theme) => {
    set({ theme });
    applyThemeClass(theme);
    persist(get());
  },
  toggleTheme: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    set({ theme: next });
    applyThemeClass(next);
    persist(get());
  },
  resetToDefaults: () => {
    set({ ...DEFAULTS });
    applyThemeClass(DEFAULTS.theme);
    applyAccent(DEFAULTS.accent);
    applyChatTypography(DEFAULTS.chatFontSize, DEFAULTS.chatFontFamily);
    persist(get());
  },
}));
