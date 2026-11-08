import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/application/components/layout/AppShell";
import McpServerGrid from "@/application/components/mcpServer/McpServerGrid";
import { CreateMcpServerDialog } from "@/application/components/mcpServer/CreateMcpServerDialog";
import { useMcpRegistry } from "@/application/hooks/mcpServer/useMcpRegistry";
import { useDeleteMcpServer } from "@/application/hooks/mcpServer/useDeleteMcpServer";
import { useConfig } from "@/application/hooks/config/useConfig";
import type { BuiltInMcpServer } from "@/domain/entities/config/appConfig";
import { McpTransportType } from "@/domain/entities/agent/mcpServerConfig";
import { mcpRegistryApi } from "@/infrastructure/api/mcpServer/mcpRegistryApi";
import { extractApiMessage } from "@/infrastructure/api/store/storeApi";
import type { RegisteredMcpServer } from "@/domain/entities/mcpServer/registeredMcpServer";
import { Badge } from "@/application/components/ui/badge";
import { Button } from "@/application/components/ui/button";
import ToolTag from "@/application/components/shared/ToolTag";

export default function McpRegistryPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editServer, setEditServer] = useState<RegisteredMcpServer | undefined>(undefined);
  const [prefillServer, setPrefillServer] = useState<Partial<RegisteredMcpServer> | undefined>(
    undefined,
  );
  const { data: servers } = useMcpRegistry();
  const deleteServer = useDeleteMcpServer();
  const { data: config } = useConfig();
  const builtIns = config?.builtInMcpServers ?? [];

  const total = (servers ?? []).length;

  function openCreate() {
    setEditServer(undefined);
    setPrefillServer(undefined);
    setCreateDialogOpen(true);
  }

  function openRegisterPrefill(builtIn: BuiltInMcpServer) {
    setEditServer(undefined);
    setPrefillServer({
      name: builtIn.name,
      url: builtIn.url,
      transport: McpTransportType.HTTP,
      source_type: "external",
      headers: {},
      env: {},
      auth_token: null,
      tool_count: 0,
      created_at: "",
      updated_at: "",
      openapi_url: null,
    });
    setCreateDialogOpen(true);
  }

  async function openEdit(server: RegisteredMcpServer) {
    try {
      const revealed = await mcpRegistryApi.reveal(server.name);
      setEditServer(revealed);
    } catch (err) {
      toast.error(`Could not load server details: ${extractApiMessage(err)}`);
      setEditServer(server);
    }
    setCreateDialogOpen(true);
  }

  function handleDelete(name: string) {
    deleteServer.mutate(name, {
      onSuccess: () => {
        toast.success(`Server "${name}" deleted`);
      },
      onError: (err) => {
        toast.error(extractApiMessage(err));
      },
    });
  }

  return (
    <AppShell>
      <div
        className="flex flex-1 flex-col gap-6 overflow-y-auto bg-bg p-4 md:p-8"
        data-od-id="mcp-registry-view"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="max-w-md font-body text-sm text-muted">
            Register and manage remote MCP servers. Each entry stores the endpoint URL and secrets
            (encrypted) so agents can reference them by name. Servers hosted by raganything are
            listed below and can be registered with one click (no key needed).
          </p>
          <div className="flex items-center gap-3">
            <Badge variant="default" data-od-id="mcp-server-count">
              {total} server{total === 1 ? "" : "s"}
            </Badge>
            <Button
              type="button"
              variant="default"
              onClick={openCreate}
              data-od-id="create-mcp-server"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add MCP Server
            </Button>
          </div>
        </div>

        {builtIns.length > 0 && (
          <div className="space-y-2" data-od-id="mcp-built-in-section">
            <h3 className="font-mono text-xs uppercase tracking-[0.1em] text-muted">
              Built-in (raganything)
            </h3>
            {builtIns.map((server) => (
              <div
                key={server.name}
                className="flex items-center justify-between gap-3 border border-border-soft bg-surface px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-mono text-sm text-fg">
                    {server.name}
                    <Badge variant="outline">built-in</Badge>
                  </p>
                  <p className="truncate font-mono text-xs text-muted">{server.url}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ToolTag label={server.transport} />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-od-id={`register-built-in-${server.name}`}
                    onClick={() => openRegisterPrefill(server)}
                  >
                    Register
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <McpServerGrid onCreateNew={openCreate} onEdit={openEdit} onDelete={handleDelete} />
      </div>

      {createDialogOpen && (
        <CreateMcpServerDialog
          open
          onOpenChange={(v) => {
            if (!v) setCreateDialogOpen(false);
          }}
          editServer={editServer}
          prefill={prefillServer}
        />
      )}
    </AppShell>
  );
}
