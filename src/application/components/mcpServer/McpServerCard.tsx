import { Pencil, Trash2 } from "lucide-react";
import type { RegisteredMcpServer } from "@/domain/entities/mcpServer/registeredMcpServer";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";
import { Badge } from "@/application/components/ui/badge";
import { Button } from "@/application/components/ui/button";

interface McpServerCardProps {
  readonly server: RegisteredMcpServer;
  readonly onEdit: (server: RegisteredMcpServer) => void;
  readonly onDelete: (name: string) => void;
}

/**
 * Presentational card for a single registered MCP server. Mirrors the
 * SkillCard visual treatment (border + block-shadow-raised + hover lift).
 * Renders a source-type badge (External vs OpenAPI) and, for OpenAPI
 * servers, the spec URL.
 */
export function McpServerCard({ server, onEdit, onDelete }: Readonly<McpServerCardProps>) {
  const isHttp = server.transport === McpTransportType.HTTP;
  const isOpenapi = server.source_type === "openapi";
  const sourceTypeLabel = isOpenapi ? "OpenAPI" : "External";
  const displayedUrl = isOpenapi && server.openapi_url ? server.openapi_url : (server.url ?? "—");

  return (
    <div
      data-od-id={`mcp-server-card-${server.name}`}
      className="group relative flex flex-col gap-3 border border-border bg-surface p-4 block-shadow-raised transition-[border-color,box-shadow,transform] duration-base ease-standard hover:-translate-y-0.5 hover:border-accent"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="min-w-0 truncate font-display text-lg uppercase tracking-[0.06em] text-fg">
          {server.name}
        </h3>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge variant={isOpenapi ? "accent" : "default"} data-od-id="mcp-source-type-badge">
            {sourceTypeLabel}
          </Badge>
          <Badge variant={isHttp ? "accent" : "default"}>{server.transport}</Badge>
        </div>
      </div>

      <p className="min-w-0 truncate font-mono text-xs text-muted" title={displayedUrl}>
        {displayedUrl}
      </p>

      <p className="font-mono text-xs text-fg-2">{server.tool_count} tools</p>
      <p className="font-mono text-[10px] text-muted">Created {server.created_at.slice(0, 10)}</p>

      <div className="mt-auto flex items-center gap-2 border-t border-border-soft pt-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onEdit(server)}
          aria-label="Edit"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Edit
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(server.name)}
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete
        </Button>
      </div>
    </div>
  );
}

export default McpServerCard;
