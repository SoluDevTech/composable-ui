import { useState } from "react";
import { cn } from "@/application/lib/utils";

interface StructuredResponseCardProps {
  data: unknown;
  className?: string;
}

export default function StructuredResponseCard({
  data,
  className,
}: StructuredResponseCardProps) {
  const [copied, setCopied] = useState(false);

  if (data == null) return null;

  let displayText = "";
  try {
    displayText = JSON.stringify(data, null, 2);
  } catch {
    displayText = String(data);
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className={cn(
        "mt-4 rounded-xl border border-secondary-brand/20 bg-surface-container-low/40",
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-secondary-brand">
            data_object
          </span>
          <span className="text-xs font-medium text-on-surface-variant">
            Structured Response
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-secondary-brand hover:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined text-base">
            {copied ? "check" : "content_copy"}
          </span>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="px-4 pb-3">
        <pre className="font-mono text-[11px] leading-relaxed text-on-surface whitespace-pre-wrap break-words bg-surface-container p-3 rounded-lg overflow-x-auto">
          {displayText}
        </pre>
      </div>
    </div>
  );
}
