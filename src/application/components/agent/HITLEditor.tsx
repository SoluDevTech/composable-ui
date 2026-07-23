import { useState, useId } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/application/components/ui/button";
import { Input } from "@/application/components/ui/input";
import { Label } from "@/application/components/ui/label";
import { Switch } from "@/application/components/ui/switch";

type RuleValue = boolean | { before?: boolean; after?: boolean };

interface HITLEditorProps {
  value: Record<string, RuleValue>;
  onChange: (value: Record<string, RuleValue>) => void;
}

export default function HITLEditor({ value, onChange }: Readonly<HITLEditorProps>) {
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
    <div className="flex flex-col gap-2 border border-border bg-surface-warm p-3">
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
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add
        </Button>
      </div>
      {entries.map(([key, val]) => (
        <div
          key={key}
          className="flex items-center gap-2 border border-border-soft bg-surface px-3 py-2"
        >
          <span className="font-mono text-xs text-fg">{key}</span>
          <div className="flex-1" />
          {typeof val === "boolean" ? (
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted">Enabled</Label>
              <Switch checked={val} onCheckedChange={(v) => updateRule(key, v)} />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted">Before</Label>
                <Switch
                  checked={val.before ?? false}
                  onCheckedChange={(v) => updateRule(key, { ...val, before: v })}
                />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted">After</Label>
                <Switch
                  checked={val.after ?? false}
                  onCheckedChange={(v) => updateRule(key, { ...val, after: v })}
                />
              </div>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeRule(key)}
            aria-label={`Remove ${key}`}
            className="h-7 w-7"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </Button>
        </div>
      ))}
      {entries.length === 0 && (
        <p className="font-mono text-xs italic text-muted">No HITL rules configured</p>
      )}
    </div>
  );
}
