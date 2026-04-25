import { useState } from "react";

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
      <div className="flex items-center justify-center py-12">
        <span
          data-testid="query-results-spinner"
          className="material-symbols-outlined text-4xl text-on-surface-variant animate-spin"
          aria-hidden="true"
        >
          progress_activity
        </span>
        <p className="ml-3 text-on-surface-variant font-headline text-sm">
          Searching...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <span
          className="material-symbols-outlined text-4xl text-red-600"
          aria-hidden="true"
        >
          error
        </span>
        <p className="text-red-600 font-headline text-sm">{error.message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 text-secondary-brand font-headline text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            refresh
          </span>
          {"Retry"}
        </button>
      </div>
    );
  }

  if (data === null || data === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <span
          className="material-symbols-outlined text-4xl text-on-surface-variant"
          aria-hidden="true"
        >
          search
        </span>
        <p className="text-on-surface-variant font-headline text-sm">
          Run a query to search your indexed documents
        </p>
      </div>
    );
  }

  const jsonText = JSON.stringify(data, null, 2);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-3 right-3 flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors bg-surface-container px-2 py-1 rounded-md"
        title="Copy to clipboard"
      >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            {copied ? "check" : "content_copy"}
          </span>
          <span className="font-headline text-xs">{copied ? "Copied" : "Copy"}</span>
        </button>
      <pre className="bg-surface-container-lowest rounded-lg p-4 overflow-auto max-h-[500px] text-xs font-body text-on-surface border border-outline-variant">
        {jsonText}
      </pre>
    </div>
  );
}