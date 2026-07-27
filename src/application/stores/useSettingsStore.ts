import { create } from "zustand";
import { accentOnFor, isValidHex } from "@/application/lib/color";

export type Theme = "dark" | "light";

const STORAGE_KEY = "composable-ui-settings";
const THEME_SYNC_KEY = "composable-ui-theme";

// Concrete font stacks — the value stored in the store/UI. We no longer use
// CSS var() references here because --font-body/--font-mono now derive from
// --app-font-family, so storing `var(--font-body)` would create a circular
// reference. Old persisted values are migrated on load (see migrateFontFamily).
export const FONT_DEFAULT = '"Press Start 2P", "Arial Black", system-ui, sans-serif';
export const FONT_MONO = '"Press Start 2P", ui-monospace, monospace';

const DEFAULTS = {
  accent: "#ff00ff",
  surface: "#10162a",
  chatFontSize: 10,
  chatFontFamily: FONT_DEFAULT,
  theme: "dark" as Theme,
};

// Map legacy persisted values (pre-concrete-stacks) to the new concrete stacks.
// Without this, returning users would get `var(--font-body)` applied as the
// literal family string, which no longer resolves correctly.
function migrateFontFamily(value: string | undefined): string | undefined {
  if (value === "var(--font-body)") return FONT_DEFAULT;
  if (value === "var(--font-mono)") return FONT_MONO;
  return value;
}

interface SettingsState {
  accent: string;
  surface: string;
  chatFontSize: number;
  chatFontFamily: string;
  theme: Theme;
  setAccent: (hex: string) => void;
  setSurface: (hex: string) => void;
  setChatFontSize: (n: number) => void;
  setChatFontFamily: (s: string) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  resetToDefaults: () => void;
}

/**
 * Migrates a legacy persisted settings blob to the current shape.
 *
 * The LLM `provider` and `apiKey` previously lived in localStorage and are
 * now persisted on the backend (`PUT /api/v1/settings/llm`). Any leftover
 * fields are stripped here so the persisted store stays in sync with the
 * SettingsState interface.
 */
function migratePersisted(
  state: Partial<SettingsState> & Record<string, unknown>,
): Partial<SettingsState> {
  const { llmProvider: _llm, apiKey: _key, ...rest } = state;
  return rest as Partial<SettingsState>;
}

function readStoredSettings(): Partial<SettingsState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { state?: Record<string, unknown> };
      if (parsed.state) {
        const migrated = { ...parsed.state };
        const migratedFont = migrateFontFamily(migrated.chatFontFamily as string | undefined);
        if (migratedFont !== undefined) migrated.chatFontFamily = migratedFont;
        return migratePersisted(migrated);
      }
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
