import { Trash2 } from "lucide-react";
import type { SubAgentConfig } from "@/domain/entities/agent/agentConfig";
import { Badge } from "@/application/components/ui/badge";
import { Button } from "@/application/components/ui/button";
import { Input } from "@/application/components/ui/input";
import { Label } from "@/application/components/ui/label";

interface SubAgentEditorProps {
  value: SubAgentConfig;
  onChange: (value: SubAgentConfig) => void;
  onRemove: () => void;
  index: number;
}

export default function SubAgentEditor({
  value,
  onChange,
  onRemove,
}: Readonly<SubAgentEditorProps>) {
  function update(patch: Partial<SubAgentConfig>) {
    onChange({ ...value, ...patch });
  }

  return (
    <div className="space-y-4 border border-border bg-surface p-3">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <h4 className="truncate font-mono text-xs uppercase tracking-[0.1em] text-muted">
            {value.name}
          </h4>
          <Badge variant="outline" className="shrink-0">
            ref: {value.agent_ref}
          </Badge>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="Remove subagent"
          className="h-7 w-7 shrink-0"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="min-w-0">
        <Label
          htmlFor={`sub-name-${value.agent_ref}`}
          className="mb-1.5 block text-xs uppercase tracking-[0.1em]"
        >
          Name
        </Label>
        <Input id={`sub-name-${value.agent_ref}`} value={value.name} disabled readOnly />
      </div>

      <div className="min-w-0">
        <Label
          htmlFor={`sub-desc-${value.agent_ref}`}
          className="mb-1.5 block text-xs uppercase tracking-[0.1em]"
        >
          Description
        </Label>
        <Input
          id={`sub-desc-${value.agent_ref}`}
          value={value.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Describe what this subagent does"
        />
      </div>
    </div>
  );
}
