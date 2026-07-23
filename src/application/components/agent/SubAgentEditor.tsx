import { Trash2 } from "lucide-react";
import type { SubAgentConfig } from "@/domain/entities/agent/agentConfig";
import { Button } from "@/application/components/ui/button";
import { Input } from "@/application/components/ui/input";
import { Label } from "@/application/components/ui/label";
import { Textarea } from "@/application/components/ui/textarea";
import { Separator } from "@/application/components/ui/separator";
import StringListEditor from "./StringListEditor";

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
  index,
}: Readonly<SubAgentEditorProps>) {
  function update(patch: Partial<SubAgentConfig>) {
    onChange({ ...value, ...patch });
  }

  return (
    <div className="space-y-4 border border-border bg-surface p-3">
      <div className="flex items-center justify-between">
        <h4 className="font-mono text-xs uppercase tracking-[0.1em] text-muted">
          {value.name || `Subagent ${index + 1}`}
        </h4>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="Remove subagent"
          className="h-7 w-7"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label
            htmlFor={`sub-name-${index}`}
            className="mb-1.5 block text-xs uppercase tracking-[0.1em]"
          >
            Name
          </Label>
          <Input
            id={`sub-name-${index}`}
            value={value.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="researcher"
          />
        </div>
        <div>
          <Label
            htmlFor={`sub-model-${index}`}
            className="mb-1.5 block text-xs uppercase tracking-[0.1em]"
          >
            Model
          </Label>
          <Input
            id={`sub-model-${index}`}
            value={value.model ?? ""}
            onChange={(e) => update({ model: e.target.value || undefined })}
            placeholder="openai:gpt-4o (optional)"
          />
        </div>
      </div>

      <div>
        <Label
          htmlFor={`sub-desc-${index}`}
          className="mb-1.5 block text-xs uppercase tracking-[0.1em]"
        >
          Description
        </Label>
        <Input
          id={`sub-desc-${index}`}
          value={value.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Describe what this subagent does"
        />
      </div>

      <div>
        <Label
          htmlFor={`sub-instr-${index}`}
          className="mb-1.5 block text-xs uppercase tracking-[0.1em]"
        >
          Instructions
        </Label>
        <Textarea
          id={`sub-instr-${index}`}
          value={value.instructions ?? ""}
          onChange={(e) => update({ instructions: e.target.value || undefined })}
          placeholder="Specific instructions for this subagent (optional)"
          rows={3}
        />
      </div>

      <Separator />

      <StringListEditor
        label="Tools"
        value={value.tools}
        onChange={(tools) => update({ tools })}
        placeholder="Add tool…"
      />

      <StringListEditor
        label="Skills"
        value={value.skills}
        onChange={(skills) => update({ skills })}
        placeholder="Add skill…"
      />
    </div>
  );
}
