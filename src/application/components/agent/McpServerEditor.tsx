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

export default function McpServerEditor({
  value,
  onChange,
  onRemove,
}: Readonly<McpServerEditorProps>) {
  function update(patch: Partial<McpServerConfig>) {
    onChange({ ...value, ...patch });
  }

  const isStdio = value.transport === McpTransportType.STDIO;
  const idBase = `mcp-${value.name || "new"}`;

  return (
    <div className="bg-surface-container-low rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold font-headline uppercase tracking-widest text-on-surface-variant">
          {value.name || "MCP Server"}
        </h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          aria-label="Remove server"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`${idBase}-name`}>Name</Label>
          <Input
            id={`${idBase}-name`}
            value={value.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="my-server"
          />
        </div>
        <div>
          <Label htmlFor={`${idBase}-transport`}>Transport</Label>
          <Select
            value={value.transport}
            onValueChange={(v) =>
              update({ transport: v as McpTransportType })
            }
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
            <Label htmlFor={`${idBase}-command`}>Command</Label>
            <Input
              id={`${idBase}-command`}
              value={value.command ?? ""}
              onChange={(e) =>
                update({ command: e.target.value || undefined })
              }
              placeholder="npx"
            />
          </div>
          <StringListEditor
            label="Args"
            value={value.args}
            onChange={(args) => update({ args })}
            placeholder="Add argument..."
          />
        </>
      )}

      {!isStdio && (
        <>
          <Separator />
          <div>
            <Label htmlFor={`${idBase}-url`}>URL</Label>
            <Input
              id={`${idBase}-url`}
              value={value.url ?? ""}
              onChange={(e) => update({ url: e.target.value || undefined })}
              placeholder="http://localhost:3000/mcp"
            />
          </div>
          <KeyValueEditor
            label="Headers"
            value={value.headers}
            onChange={(headers) => update({ headers })}
            keyPlaceholder="Header name"
            valuePlaceholder="Header value"
          />
        </>
      )}

      <Separator />
      <KeyValueEditor
        label="Env"
        value={value.env}
        onChange={(env) => update({ env })}
        keyPlaceholder="Variable name"
        valuePlaceholder="Variable value"
      />

      <div>
        <Label htmlFor={`${idBase}-auth`}>Auth Token</Label>
        <Input
          id={`${idBase}-auth`}
          type="password"
          value={value.auth_token ?? ""}
          onChange={(e) =>
            update({ auth_token: e.target.value || undefined })
          }
          placeholder="Optional auth token"
        />
      </div>
    </div>
  );
}
