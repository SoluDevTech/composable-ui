import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/application/components/layout/AppShell";
import McpServerGrid from "@/application/components/mcpServer/McpServerGrid";
import { CreateMcpServerDialog } from "@/application/components/mcpServer/CreateMcpServerDialog";
import { useMcpRegistry } from "@/application/hooks/mcpServer/useMcpRegistry";
import { useDeleteMcpServer } from "@/application/hooks/mcpServer/useDeleteMcpServer";
import { mcpRegistryApi } from "@/infrastructure/api/mcpServer/mcpRegistryApi";
import { extractApiMessage } from "@/infrastructure/api/store/storeApi";
import type { RegisteredMcpServer } from "@/domain/entities/mcpServer/registeredMcpServer";
import { Badge } from "@/application/components/ui/badge";
import { Button } from "@/application/components/ui/button";

export default function McpRegistryPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editServer, setEditServer] = useState<RegisteredMcpServer | undefined>(undefined);
  const { data: servers } = useMcpRegistry();
  const deleteServer = useDeleteMcpServer();

  const total = (servers ?? []).length;

  function openCreate() {
    setEditServer(undefined);
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
            (encrypted) so agents can reference them by name.
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

        <McpServerGrid onCreateNew={openCreate} onEdit={openEdit} onDelete={handleDelete} />
      </div>

      {createDialogOpen && (
        <CreateMcpServerDialog
          open
          onOpenChange={(v) => {
            if (!v) setCreateDialogOpen(false);
          }}
          editServer={editServer}
        />
      )}
    </AppShell>
  );
}
