import { useRef, useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/application/components/ui/button";
import { cn } from "@/application/lib/utils";

interface StructuredResponseCardProps {
  data: unknown;
  className?: string;
}

export default function StructuredResponseCard({
  data,
  className,
}: Readonly<StructuredResponseCardProps>) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (data == null) return null;

  let displayText = "";
  try {
    displayText = JSON.stringify(data, null, 2);
  } catch {
    try {
      displayText = String(data);
    } catch {
      displayText = "[Unable to display data]";
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      data-od-id="structured-response"
      className={cn("mt-2 border border-border bg-bg", className)}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="font-mono text-xs uppercase tracking-[0.1em] text-muted">
          Structured Response
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          aria-label={copied ? "Copied to clipboard" : "Copy structured response to clipboard"}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap px-3 py-2 font-mono text-xs leading-relaxed text-fg-2">
        {displayText}
      </pre>
    </div>
  );
}
