import { Plus } from "lucide-react";
import { useMcpRegistry } from "@/application/hooks/mcpServer/useMcpRegistry";
import McpServerCard from "@/application/components/mcpServer/McpServerCard";
import type { RegisteredMcpServer } from "@/domain/entities/mcpServer/registeredMcpServer";

interface McpServerGridProps {
  readonly onCreateNew: () => void;
  readonly onEdit: (server: RegisteredMcpServer) => void;
  readonly onDelete: (name: string) => void;
}

/**
 * Grid of registered MCP servers. Mirrors the SkillGrid / MemoryGrid layout:
 * a responsive grid of server cards followed by a dashed "create" card, which
 * is also rendered when the registry is empty (so users always have an entry
 * point to create a new server from the grid itself).
 */
export default function McpServerGrid({
  onCreateNew,
  onEdit,
  onDelete,
}: Readonly<McpServerGridProps>) {
  const { data: servers, isLoading, error } = useMcpRegistry();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24" data-od-id="mcp-server-grid">
        <span
          className="spin mr-3 inline-block h-4 w-4 border-2 border-border border-t-accent"
          aria-hidden="true"
        />
        <p className="font-mono text-sm text-muted">Loading MCP servers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24" data-od-id="mcp-server-grid">
        <p className="font-mono text-sm text-danger">Failed to load MCP servers: {error.message}</p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      data-od-id="mcp-server-grid"
    >
      {(Array.isArray(servers) ? servers : []).map((server) => (
        <McpServerCard key={server.name} server={server} onEdit={onEdit} onDelete={onDelete} />
      ))}
      <McpServerCreateButton onClick={onCreateNew} />
    </div>
  );
}

function McpServerCreateButton({ onClick }: Readonly<{ onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-od-id="mcp-server-card-new"
      aria-label="Create a new MCP server"
      className="group flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-border bg-surface/50 text-muted transition-[border-color,color] duration-base ease-standard hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:shadow-focus"
    >
      <span
        className="flex h-12 w-12 items-center justify-center border border-border bg-surface text-muted transition-colors group-hover:border-accent group-hover:text-accent"
        aria-hidden="true"
      >
        <Plus className="h-6 w-6" />
      </span>
      <span className="font-mono text-xs uppercase tracking-[0.1em]">New MCP Server</span>
    </button>
  );
}
