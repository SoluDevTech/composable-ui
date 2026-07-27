import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/application/components/ui/badge";
import { Button } from "@/application/components/ui/button";
import { Input } from "@/application/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/application/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/application/components/ui/dialog";
import type { ApiKeyView, CreatedApiKey } from "@/domain/entities/auth/apiKey";
import { useApiKeys } from "@/application/hooks/auth/useApiKeys";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toISOString().slice(0, 19).replace("T", " ");
}

interface ApiKeyRowProps {
  readonly apiKey: ApiKeyView;
  readonly onRevoke: (id: string) => void;
}

function ApiKeyRow({ apiKey, onRevoke }: ApiKeyRowProps) {
  const [open, setOpen] = useState(false);
  const isRevoked = Boolean(apiKey.revoked_at);

  return (
    <li
      data-od-id={`api-key-row-${apiKey.id}`}
      className="flex flex-col gap-2 border border-border bg-surface-warm/40 p-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-1">
        <span className="font-display text-sm text-fg">{apiKey.name}</span>
        <span className="font-mono text-xs text-muted">{apiKey.key_prefix}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted">
        <span>
          <span className="text-fg-2">created:</span> {formatDate(apiKey.created_at)}
        </span>
        <span>
          <span className="text-fg-2">last used:</span> {formatDate(apiKey.last_used_at)}
        </span>
        {isRevoked ? (
          <Badge variant="danger">Revoked</Badge>
        ) : (
          <Badge variant="success">Active</Badge>
        )}
        {!isRevoked ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            data-od-id={`api-key-revoke-${apiKey.id}`}
            onClick={() => setOpen(true)}
          >
            <Trash2 aria-hidden="true" /> Revoke
          </Button>
        ) : null}
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke the key <strong>{apiKey.name}</strong> (
              {apiKey.key_prefix})? This action cannot be undone. Any client using this key will
              immediately lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="inline-flex h-10 items-center justify-center bg-danger text-fg border border-danger px-4 py-2 font-display uppercase tracking-[0.06em] text-sm hover:bg-danger/90"
              data-od-id={`api-key-revoke-confirm-${apiKey.id}`}
              onClick={() => {
                setOpen(false);
                onRevoke(apiKey.id);
              }}
            >
              Confirm revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

interface CreatedKeyDialogProps {
  readonly created: CreatedApiKey | null;
  readonly onClose: () => void;
}

function CreatedKeyDialog({ created, onClose }: CreatedKeyDialogProps) {
  const open = created !== null;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API key created</DialogTitle>
          <DialogDescription>
            Copy the key below now — you won&apos;t see it again. Store it securely.
          </DialogDescription>
        </DialogHeader>
        {created ? (
          <div className="mt-4 flex flex-col gap-3">
            <code
              data-od-id="api-key-plaintext"
              className="block break-all bg-surface-warm p-3 font-mono text-sm text-fg"
            >
              {created.plaintext}
            </code>
            <p className="font-mono text-xs text-warn" data-od-id="api-key-warning">
              ⚠ You won&apos;t see this again.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                data-od-id="api-key-copy"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(created.plaintext);
                    toast.success("Key copied to clipboard");
                  } catch {
                    toast.error("Failed to copy key");
                  }
                }}
              >
                <Copy aria-hidden="true" /> Copy key
              </Button>
              <Button type="button" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export interface ApiKeysCardProps {
  readonly odId?: string;
}

export default function ApiKeysCard({ odId = "settings-api-keys" }: ApiKeysCardProps) {
  const { keys, isLoading, isError, error, create, revoke, isCreating } = useApiKeys();
  const [newName, setNewName] = useState("");
  const [created, setCreated] = useState<CreatedApiKey | null>(null);

  const sortedKeys = useMemo(
    () => [...keys].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [keys],
  );

  async function onCreate() {
    const name = newName.trim();
    if (!name) {
      toast.error("Key name is required");
      return;
    }
    try {
      const result = await create({ name });
      setCreated(result);
      setNewName("");
      toast.success(`Key "${name}" created`);
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to create key");
    }
  }

  async function onRevoke(id: string) {
    try {
      await revoke(id);
      toast.success("Key revoked");
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to revoke key");
    }
  }

  return (
    <section className="flex flex-col border border-border bg-surface" data-od-id={odId}>
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-display text-sm uppercase tracking-[0.06em] text-fg">API Keys</h2>
      </div>
      <div className="flex flex-col gap-4 p-5">
        <p className="font-body text-sm text-muted">
          Personal access tokens used as the <code>X-API-Key</code> header for API automation.
          Plaintext is shown once at creation.
        </p>

        <form
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void onCreate();
          }}
        >
          <div className="flex flex-1 flex-col gap-1">
            <label
              htmlFor="settings-api-key-name"
              className="font-mono text-xs uppercase tracking-[0.1em] text-muted"
            >
              New API key name
            </label>
            <Input
              id="settings-api-key-name"
              data-od-id="settings-api-key-name"
              type="text"
              placeholder="e.g. ci-pipeline"
              autoComplete="off"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isCreating} data-od-id="settings-api-key-create">
            <Plus aria-hidden="true" /> {isCreating ? "Creating…" : "Create key"}
          </Button>
        </form>

        {isLoading ? (
          <p className="font-mono text-xs text-muted" data-od-id="api-keys-loading">
            Loading API keys…
          </p>
        ) : sortedKeys.length === 0 ? (
          <p className="font-mono text-xs text-muted">No API keys yet.</p>
        ) : (
          <ul className="flex flex-col gap-2" data-od-id="api-keys-list">
            {sortedKeys.map((k) => (
              <ApiKeyRow key={k.id} apiKey={k} onRevoke={onRevoke} />
            ))}
          </ul>
        )}

        {isError ? (
          <p className="font-mono text-xs text-danger" role="alert">
            {error?.message ?? "Failed to load API keys"}
          </p>
        ) : null}
      </div>

      <CreatedKeyDialog created={created} onClose={() => setCreated(null)} />
    </section>
  );
}
