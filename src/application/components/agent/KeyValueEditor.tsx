import { useState, useId } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/application/components/ui/button";
import { Input } from "@/application/components/ui/input";
import { Label } from "@/application/components/ui/label";

interface KeyValueEditorProps {
  label: string;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export default function KeyValueEditor({
  label,
  value,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
}: Readonly<KeyValueEditorProps>) {
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const keyId = useId();
  const valId = useId();

  function addEntry() {
    const trimmedKey = keyInput.trim();
    const trimmedValue = valueInput.trim();
    if (!trimmedKey) return;
    onChange({ ...value, [trimmedKey]: trimmedValue });
    setKeyInput("");
    setValueInput("");
  }

  function removeEntry(key: string) {
    const next = { ...value };
    delete next[key];
    onChange(next);
  }

  const entries = Object.entries(value);

  return (
    <div className="flex flex-col gap-2 border border-border bg-surface-warm p-3">
      <Label htmlFor={keyId} className="text-xs uppercase tracking-[0.1em] text-muted">
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          id={keyId}
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder={keyPlaceholder}
          className="flex-1 min-w-0"
          aria-label={`${label} key`}
        />
        <Input
          id={valId}
          value={valueInput}
          onChange={(e) => setValueInput(e.target.value)}
          placeholder={valuePlaceholder}
          className="flex-1 min-w-0"
          aria-label={`${label} value`}
        />
        <Button type="button" variant="outline" size="sm" onClick={addEntry}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add
        </Button>
      </div>
      {entries.length > 0 && (
        <div className="flex flex-col gap-1">
          {entries.map(([k, v]) => (
            <div
              key={k}
              className="flex items-center gap-2 border border-border-soft bg-surface px-3 py-1.5"
            >
              <span className="font-mono text-xs text-fg-2">{k}</span>
              <span className="font-mono text-xs text-muted">=</span>
              <span className="flex-1 truncate font-mono text-xs text-fg-2">{v}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeEntry(k)}
                aria-label={`Remove ${k}`}
                className="h-6 w-6"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
