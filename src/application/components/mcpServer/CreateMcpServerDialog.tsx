import { useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import type {
  McpServerInput,
  McpSourceType,
  RegisteredMcpServer,
} from "@/domain/entities/mcpServer/registeredMcpServer";
import { useCreateMcpServer } from "@/application/hooks/mcpServer/useCreateMcpServer";
import { useUpdateMcpServer } from "@/application/hooks/mcpServer/useUpdateMcpServer";
import { useValidateMcpServer } from "@/application/hooks/mcpServer/useValidateMcpServer";
import { extractApiMessage } from "@/infrastructure/api/store/storeApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/application/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/application/components/ui/select";
import { Button } from "@/application/components/ui/button";
import { Input } from "@/application/components/ui/input";
import { Label } from "@/application/components/ui/label";
import KeyValueEditor from "@/application/components/agent/KeyValueEditor";

interface CreateMcpServerDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly editServer?: RegisteredMcpServer;
}

const FORM_ID = "mcp-server-form";

/**
 * Dialog to create or edit a registered MCP server. The form collects the
 * registry fields and submits via {@link useCreateMcpServer} (create mode) or
 * {@link useUpdateMcpServer} (edit mode). A "Test connection" button calls
 * {@link useValidateMcpServer} and surfaces the tool count on success.
 *
 * The top-level "Type" select switches between an `external` remote MCP
 * server (url + headers + env + auth_token) and an `openapi` spec-mounted
 * server (openapi_url + headers — no env, no auth_token).
 */
export function CreateMcpServerDialog({
  open,
  onOpenChange,
  editServer,
}: Readonly<CreateMcpServerDialogProps>) {
  const isEdit = Boolean(editServer);
  const [sourceType, setSourceType] = useState<McpSourceType>(
    editServer?.source_type ?? "external",
  );
  const [name, setName] = useState(editServer?.name ?? "");
  const [url, setUrl] = useState(editServer?.url ?? "");
  const [openapiUrl, setOpenapiUrl] = useState(editServer?.openapi_url ?? "");
  const [headers, setHeaders] = useState<Record<string, string>>(editServer?.headers ?? {});
  const [env, setEnv] = useState<Record<string, string>>(editServer?.env ?? {});
  const [authToken, setAuthToken] = useState(editServer?.auth_token ?? "");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const createServer = useCreateMcpServer();
  const updateServer = useUpdateMcpServer();
  const validateServer = useValidateMcpServer();

  const isOpenapi = sourceType === "openapi";
  const submitLabel = isEdit ? "Save" : "Create";

  function resetForm() {
    setSourceType("external");
    setName("");
    setUrl("");
    setOpenapiUrl("");
    setHeaders({});
    setEnv({});
    setAuthToken("");
    setValidationMessage(null);
    setValidationError(null);
  }

  function handleClose() {
    resetForm();
    onOpenChange(false);
  }

  function buildInput(): McpServerInput {
    return {
      name: name.trim(),
      url: isOpenapi ? null : url.trim(),
      headers,
      env: isOpenapi ? {} : env,
      auth_token: isOpenapi ? null : authToken,
      source_type: sourceType,
      openapi_url: isOpenapi ? openapiUrl.trim() : null,
    };
  }

  async function handleTestConnection() {
    setValidationMessage(null);
    setValidationError(null);
    try {
      const result = await validateServer.mutateAsync(buildInput());
      setValidationMessage(`✓ ${result.tool_count} tools`);
    } catch (error) {
      const message = extractApiMessage(error);
      setValidationError(message);
    }
  }

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Server name is required");
      return;
    }
    if (isOpenapi) {
      if (!openapiUrl.trim()) {
        toast.error("OpenAPI URL is required");
        return;
      }
    } else if (!url.trim()) {
      toast.error("Server URL is required");
      return;
    }

    const input = buildInput();
    const onSuccess = () => {
      toast.success(isEdit ? "Server updated successfully" : "Server created successfully");
      handleClose();
    };
    const onError = (error: unknown) => {
      toast.error(extractApiMessage(error));
    };

    if (isEdit && editServer) {
      updateServer.mutate({ name: editServer.name, input }, { onSuccess, onError });
    } else {
      createServer.mutate(input, { onSuccess, onError });
    }
  }

  const isPending = createServer.isPending || updateServer.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent
        className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0 sm:p-0"
        data-od-id="create-mcp-server-dialog"
      >
        <div className="shrink-0 border-b border-border bg-surface px-6 pb-4 pt-6 sm:px-8">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="font-display text-lg">
              {isEdit ? "Edit MCP Server" : "Create MCP Server"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted">
              Register a remote MCP server. Secrets are stored encrypted and revealed only on
              demand.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overscroll-contain overflow-y-auto bg-surface px-6 py-6 sm:px-8">
          <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label
                htmlFor="mcp-source-type"
                className="mb-2 block text-xs uppercase tracking-[0.1em]"
              >
                Type
              </Label>
              <Select
                value={sourceType}
                onValueChange={(v) => setSourceType(v as McpSourceType)}
                disabled={isEdit}
              >
                <SelectTrigger id="mcp-source-type" data-od-id="mcp-source-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="external">External</SelectItem>
                  <SelectItem value="openapi">OpenAPI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mcp-name" className="mb-2 block text-xs uppercase tracking-[0.1em]">
                Name
              </Label>
              <Input
                id="mcp-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="weather"
                autoComplete="off"
                spellCheck={false}
                aria-label="Name"
                disabled={isEdit}
              />
            </div>

            {isOpenapi ? (
              <div>
                <Label
                  htmlFor="mcp-openapi-url"
                  className="mb-2 block text-xs uppercase tracking-[0.1em]"
                >
                  OpenAPI URL
                </Label>
                <Input
                  id="mcp-openapi-url"
                  type="url"
                  value={openapiUrl}
                  onChange={(e) => setOpenapiUrl(e.target.value)}
                  placeholder="https://example.com/openapi.json"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="openapi_url"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="mcp-url" className="mb-2 block text-xs uppercase tracking-[0.1em]">
                  URL
                </Label>
                <Input
                  id="mcp-url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/mcp"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="URL"
                />
              </div>
            )}

            <KeyValueEditor
              label="Headers"
              value={headers}
              onChange={setHeaders}
              keyPlaceholder="Header name"
              valuePlaceholder="Header value"
            />

            {!isOpenapi && (
              <>
                <KeyValueEditor
                  label="Env"
                  value={env}
                  onChange={setEnv}
                  keyPlaceholder="Variable name"
                  valuePlaceholder="Variable value"
                />

                <div>
                  <Label
                    htmlFor="mcp-auth-token"
                    className="mb-2 block text-xs uppercase tracking-[0.1em]"
                  >
                    Auth Token
                  </Label>
                  <Input
                    id="mcp-auth-token"
                    type="password"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    placeholder="Optional auth token"
                    autoComplete="off"
                    aria-label="auth_token"
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={validateServer.isPending}
              >
                Test connection
              </Button>
              {validationMessage && (
                <p className="font-mono text-xs text-success" aria-live="polite">
                  {validationMessage}
                </p>
              )}
              {validationError && (
                <p className="font-mono text-xs text-danger" aria-live="assertive">
                  Error: {validationError}
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="flex shrink-0 items-center gap-3 border-t border-border bg-surface px-6 py-4 sm:px-8">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <div className="flex-1" />
          <Button type="submit" form={FORM_ID} disabled={isPending}>
            {isPending ? "Saving…" : submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateMcpServerDialog;
