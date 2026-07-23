import { useId, useState, memo } from "react";
import { Trash2 } from "lucide-react";
import type { McpServerConfig } from "@/domain/entities/agent/mcpServerConfig";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";
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
import { Separator } from "@/application/components/ui/separator";
import StringListEditor from "./StringListEditor";
import KeyValueEditor from "./KeyValueEditor";

interface McpServerEditorProps {
  value: McpServerConfig;
  onChange: (value: McpServerConfig) => void;
  onRemove: () => void;
}

function McpServerEditorImpl({
  value,
  onChange,
  onRemove,
}: Readonly<McpServerEditorProps>) {
  // Local draft is the source of truth for inputs. We propagate to the parent
  // ONLY on blur (not on every keystroke) so useFieldArray.update() does not
  // fire mid-typing and remount the AccordionContent, which steals focus.
  const [draft, setDraft] = useState<McpServerConfig>(value);
  const [transport, setTransport] = useState(value.transport);

  function updateLocal(patch: Partial<McpServerConfig>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function commit() {
    onChange(draft);
  }

  const isStdio = transport === McpTransportType.STDIO;
  const idBase = `mcp-${useId()}`;

  return (
    <div className="space-y-4 border border-border bg-surface p-3">
      <div className="flex items-center justify-between">
        <h4 className="font-mono text-xs uppercase tracking-[0.1em] text-muted">
          {draft.name || "MCP Server"}
        </h4>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="Remove server"
          className="h-7 w-7"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label
            htmlFor={`${idBase}-name`}
            className="mb-1.5 block text-xs uppercase tracking-[0.1em]"
          >
            Name
          </Label>
          <Input
            id={`${idBase}-name`}
            value={draft.name}
            onChange={(e) => updateLocal({ name: e.target.value })}
            onBlur={commit}
            placeholder="my-server"
          />
        </div>
        <div>
          <Label
            htmlFor={`${idBase}-transport`}
            className="mb-1.5 block text-xs uppercase tracking-[0.1em]"
          >
            Transport
          </Label>
          <Select
            value={transport}
            onValueChange={(v) => {
              setTransport(v as McpTransportType);
              setDraft((prev) => ({ ...prev, transport: v as McpTransportType }));
              onChange({ ...draft, transport: v as McpTransportType });
            }}
          >
            <SelectTrigger id={`${idBase}-transport`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={McpTransportType.STDIO}>stdio</SelectItem>
              <SelectItem value={McpTransportType.HTTP}>http</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isStdio && (
        <>
          <Separator />
          <div>
            <Label
              htmlFor={`${idBase}-command`}
              className="mb-1.5 block text-xs uppercase tracking-[0.1em]"
            >
              Command
            </Label>
            <Input
              id={`${idBase}-command`}
              value={draft.command ?? ""}
              onChange={(e) => updateLocal({ command: e.target.value || undefined })}
              onBlur={commit}
              placeholder="npx"
            />
          </div>
          <StringListEditor
            label="Args"
            value={draft.args}
            onChange={(args) => {
              updateLocal({ args });
              onChange({ ...draft, args });
            }}
            placeholder="Add argument…"
          />
        </>
      )}

      {!isStdio && (
        <>
          <Separator />
          <div>
            <Label
              htmlFor={`${idBase}-url`}
              className="mb-1.5 block text-xs uppercase tracking-[0.1em]"
            >
              URL
            </Label>
            <Input
              id={`${idBase}-url`}
              value={draft.url ?? ""}
              onChange={(e) => updateLocal({ url: e.target.value || undefined })}
              onBlur={commit}
              placeholder="http://localhost:3000/mcp"
            />
          </div>
          <KeyValueEditor
            label="Headers"
            value={draft.headers}
            onChange={(headers) => {
              updateLocal({ headers });
              onChange({ ...draft, headers });
            }}
            keyPlaceholder="Header name"
            valuePlaceholder="Header value"
          />
        </>
      )}

      <Separator />
      <KeyValueEditor
        label="Env"
        value={draft.env}
        onChange={(env) => {
          updateLocal({ env });
          onChange({ ...draft, env });
        }}
        keyPlaceholder="Variable name"
        valuePlaceholder="Variable value"
      />

      <div>
        <Label
          htmlFor={`${idBase}-auth`}
          className="mb-1.5 block text-xs uppercase tracking-[0.1em]"
        >
          Auth Token
        </Label>
        <Input
          id={`${idBase}-auth`}
          type="password"
          value={draft.auth_token ?? ""}
          onChange={(e) => updateLocal({ auth_token: e.target.value || undefined })}
          onBlur={commit}
          placeholder="Optional auth token"
        />
      </div>
    </div>
  );
}

export const McpServerEditor = memo(McpServerEditorImpl);

export default McpServerEditor;