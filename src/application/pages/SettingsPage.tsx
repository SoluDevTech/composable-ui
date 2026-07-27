import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { Button } from "@/application/components/ui/button";
import { Input } from "@/application/components/ui/input";
import { Label } from "@/application/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/application/components/ui/select";
import { Switch } from "@/application/components/ui/switch";
import AppShell from "@/application/components/layout/AppShell";
import LlmSettingsCard from "@/application/components/settings/LlmSettingsCard";
import ApiKeysCard from "@/application/components/settings/ApiKeysCard";
import { useSettingsStore } from "@/application/stores/useSettingsStore";
import { hexToHue, hueToHex, isValidHex } from "@/application/lib/color";
import { redirectToSignOut } from "@/infrastructure/auth/oauth2Redirect";

function SettingsCard({
  odId,
  title,
  children,
}: {
  readonly odId: string;
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col border border-border bg-surface">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-display text-sm uppercase tracking-[0.06em] text-fg">{title}</h2>
      </div>
      <div data-od-id={odId} className="flex flex-col gap-4 p-5">
        {children}
      </div>
    </section>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  readonly htmlFor: string;
  readonly children: React.ReactNode;
}) {
  return (
    <Label htmlFor={htmlFor} className="font-mono text-xs uppercase tracking-[0.1em] text-muted">
      {children}
    </Label>
  );
}

export default function SettingsPage() {
  const accent = useSettingsStore((s) => s.accent);
  const surface = useSettingsStore((s) => s.surface);
  const chatFontSize = useSettingsStore((s) => s.chatFontSize);
  const chatFontFamily = useSettingsStore((s) => s.chatFontFamily);
  const theme = useSettingsStore((s) => s.theme);
  const setAccent = useSettingsStore((s) => s.setAccent);
  const setSurface = useSettingsStore((s) => s.setSurface);
  const setChatFontSize = useSettingsStore((s) => s.setChatFontSize);
  const setChatFontFamily = useSettingsStore((s) => s.setChatFontFamily);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);
  const resetToDefaults = useSettingsStore((s) => s.resetToDefaults);

  const [accentDraft, setAccentDraft] = useState(accent);
  useEffect(() => {
    setAccentDraft(accent);
  }, [accent]);

  const hue = hexToHue(accent);

  return (
    <AppShell>
      <div className="flex flex-1 flex-col overflow-y-auto p-6 md:p-8" data-od-id="view-settings">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <p className="max-w-[48ch] font-body text-sm text-muted">
            Customize the console appearance, chat readability, per-user LLM provider and personal
            API keys. Credentials are managed by oauth2-proxy.
          </p>
          <Button
            type="button"
            variant="outline"
            data-od-id="settings-sign-out"
            onClick={redirectToSignOut}
          >
            <LogOut aria-hidden="true" /> Sign out
          </Button>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <SettingsCard odId="settings-theme" title="Theme">
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="settings-accent-hex">Accent color</FieldLabel>
              <div className="color-picker">
                <input
                  type="range"
                  className="color-gradient"
                  id="settings-accent-gradient"
                  data-od-id="settings-accent-gradient"
                  min={0}
                  max={360}
                  value={hue}
                  aria-label="Hue"
                  onChange={(e) => setAccent(hueToHex(Number(e.target.value)))}
                />
                <div className="color-picker-row">
                  <span
                    className="color-preview"
                    id="accent-preview"
                    style={{ background: accent }}
                    aria-hidden="true"
                  />
                  <Input
                    id="settings-accent-hex"
                    data-od-id="settings-accent-hex"
                    className="color-hex"
                    value={accentDraft}
                    maxLength={7}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAccentDraft(v);
                      if (isValidHex(v)) setAccent(v);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="settings-surface">Surface shade</FieldLabel>
              <Select
                value={surface}
                onValueChange={(v) => {
                  setSurface(v);
                  toast.success("Surface shade updated");
                }}
              >
                <SelectTrigger
                  id="settings-surface"
                  data-od-id="settings-surface"
                  aria-label="Surface shade"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="#10162a">Ink blue (#10162a)</SelectItem>
                  <SelectItem value="#1a1025">Deep violet (#1a1025)</SelectItem>
                  <SelectItem value="#111827">Slate (#111827)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel htmlFor="settings-dark-mode">Dark mode</FieldLabel>
              <Switch
                id="settings-dark-mode"
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                aria-label="Dark mode"
              />
            </div>
          </SettingsCard>

          <SettingsCard odId="settings-typography" title="Typography">
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="settings-chat-font-size">Font size</FieldLabel>
              <input
                id="settings-chat-font-size"
                type="range"
                className="input-range"
                data-od-id="settings-chat-font-size"
                min={10}
                max={18}
                step={1}
                value={chatFontSize}
                onChange={(e) => setChatFontSize(Number(e.target.value))}
              />
              <div className="input-range-hint">
                <span>10px</span>
                <span id="chat-font-size-value">{chatFontSize}px</span>
                <span>18px</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="settings-chat-font-family">Font family</FieldLabel>
              <Select
                value={chatFontFamily}
                onValueChange={(v) => {
                  setChatFontFamily(v);
                  toast.success("Font family updated");
                }}
              >
                <SelectTrigger
                  id="settings-chat-font-family"
                  data-od-id="settings-chat-font-family"
                  aria-label="Font family"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='"Press Start 2P", "Arial Black", system-ui, sans-serif'>
                    Press Start 2P (default)
                  </SelectItem>
                  <SelectItem value="ui-monospace, monospace">Monospace</SelectItem>
                  <SelectItem value='"Press Start 2P", ui-monospace, monospace'>Mono</SelectItem>
                  <SelectItem value="Georgia, serif">Georgia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SettingsCard>

          <LlmSettingsCard />

          <ApiKeysCard />

          <SettingsCard odId="settings-reset" title="Reset">
            <p className="font-body text-sm text-muted">
              Restore the default appearance settings. This does not affect your backend-stored LLM
              settings or API keys.
            </p>
            <Button
              type="button"
              variant="secondary"
              data-od-id="settings-reset-btn"
              onClick={() => {
                resetToDefaults();
                toast.success("Settings reset to defaults");
              }}
            >
              Reset to Defaults
            </Button>
          </SettingsCard>
        </div>
      </div>
    </AppShell>
  );
}
