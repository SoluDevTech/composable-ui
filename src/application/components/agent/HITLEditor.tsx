import { useState, useId } from "react";
import { Button } from "@/application/components/ui/button";
import { Input } from "@/application/components/ui/input";
import { Label } from "@/application/components/ui/label";
import { Switch } from "@/application/components/ui/switch";

type RuleValue = boolean | { before?: boolean; after?: boolean };

interface HITLEditorProps {
  value: Record<string, RuleValue>;
  onChange: (value: Record<string, RuleValue>) => void;
}

export default function HITLEditor({
  value,
  onChange,
}: Readonly<HITLEditorProps>) {
  const [ruleName, setRuleName] = useState("");
  const inputId = useId();
  const entries = Object.entries(value);

  function addRule() {
    const trimmed = ruleName.trim();
    if (!trimmed) return;
    onChange({ ...value, [trimmed]: true });
    setRuleName("");
  }

  function removeRule(key: string) {
    const next = { ...value };
    delete next[key];
    onChange(next);
  }

  function updateRule(key: string, val: RuleValue) {
    onChange({ ...value, [key]: val });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          id={inputId}
          value={ruleName}
          onChange={(e) => setRuleName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addRule();
            }
          }}
          placeholder="Rule name (e.g. create_file)"
          className="flex-1"
          name="hitl-rule-name"
        />
        <Button type="button" variant="outline" size="sm" onClick={addRule}>
          Add
        </Button>
      </div>
      {entries.map(([key, val]) => (
        <div
          key={key}
          className="flex items-center gap-3 bg-surface-container-low rounded-lg px-3 py-2"
        >
          <span className="font-mono text-xs text-on-surface">{key}</span>
          <div className="flex-1" />
          {typeof val === "boolean" ? (
            <div className="flex items-center gap-2">
              <Label className="text-xs text-on-surface-variant">Enabled</Label>
              <Switch
                checked={val}
                onCheckedChange={(v) => updateRule(key, v)}
              />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Label className="text-xs text-on-surface-variant">
                  Before
                </Label>
                <Switch
                  checked={val.before ?? false}
                  onCheckedChange={(v) =>
                    updateRule(key, { ...val, before: v })
                  }
                />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-on-surface-variant">After</Label>
                <Switch
                  checked={val.after ?? false}
                  onCheckedChange={(v) =>
                    updateRule(key, { ...val, after: v })
                  }
                />
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => removeRule(key)}
            className="rounded-full hover:bg-destructive/20 p-0.5"
            aria-label={`Remove ${key}`}
          >
            <span className="material-symbols-outlined text-xs">close</span>
          </button>
        </div>
      ))}
      {entries.length === 0 && (
        <p className="text-xs text-on-surface-variant italic">
          No HITL rules configured
        </p>
      )}
    </div>
  );
}
