import { useState, useId } from "react";
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
    <div className="space-y-2">
      <Label htmlFor={keyId} className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          id={keyId}
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder={keyPlaceholder}
          className="flex-1"
          aria-label={`${label} key`}
        />
        <Input
          id={valId}
          value={valueInput}
          onChange={(e) => setValueInput(e.target.value)}
          placeholder={valuePlaceholder}
          className="flex-1"
          aria-label={`${label} value`}
        />
        <Button type="button" variant="outline" size="sm" onClick={addEntry}>
          Add
        </Button>
      </div>
      {entries.length > 0 && (
        <div className="space-y-1">
          {entries.map(([k, v]) => (
            <div
              key={k}
              className="flex items-center gap-2 bg-surface-container-low rounded-lg px-3 py-1.5"
            >
              <span className="font-mono text-xs text-on-surface">{k}</span>
              <span className="text-on-surface-variant text-xs">=</span>
              <span className="font-mono text-xs text-on-surface-variant flex-1 truncate">
                {v}
              </span>
              <button
                type="button"
                onClick={() => removeEntry(k)}
                className="shrink-0 rounded-full hover:bg-destructive/20 p-0.5"
                aria-label={`Remove ${k}`}
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
