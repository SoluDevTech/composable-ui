import { useState } from "react";
import { SearchX, Copy, Check, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/application/components/ui/button";

interface QueryResultsProps {
  data: unknown;
  error: Error | null;
  isLoading: boolean;
  onRetry: () => void;
}

export default function QueryResults({
  data,
  error,
  isLoading,
  onRetry,
}: Readonly<QueryResultsProps>) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (data === null || data === undefined) return;
    const text = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (isLoading) {
    return (
      <div
        data-od-id="query-results"
        className="flex flex-col gap-2 border border-border bg-bg p-3 items-center justify-center py-8"
      >
        <span data-testid="query-results-spinner" className="spin text-muted" aria-hidden="true" />
        <p className="font-mono text-sm text-muted">Searching...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        data-od-id="query-results"
        className="flex flex-col gap-2 border border-border bg-bg p-3 items-center justify-center py-8"
      >
        <AlertCircle className="h-8 w-8 text-danger" aria-hidden="true" />
        <p className="text-danger font-mono text-sm">{error.message}</p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </Button>
      </div>
    );
  }

  if (data === null || data === undefined) {
    return (
      <div
        data-od-id="query-results"
        className="flex flex-col gap-2 border border-border bg-bg p-3 items-center justify-center py-8"
      >
        <SearchX className="h-8 w-8 text-muted" aria-hidden="true" />
        <p className="font-mono text-xs text-muted">Run a query to search your indexed documents</p>
      </div>
    );
  }

  const jsonText = JSON.stringify(data, null, 2);

  return (
    <div data-od-id="query-results" className="flex flex-col gap-2 border border-border bg-bg p-3">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          aria-label="Copy to clipboard"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="font-mono text-xs text-fg-2 bg-surface border border-border p-3 overflow-auto max-h-[500px] whitespace-pre-wrap">
        {jsonText}
      </pre>
    </div>
  );
}
