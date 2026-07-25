import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/application/components/ui/button";
import { cn } from "@/application/lib/utils";

interface JsonBlockProps {
  content: string | null;
  maxHeightClassName?: string;
  id?: string;
}

export default function JsonBlock({
  content,
  maxHeightClassName = "max-h-96",
  id,
}: Readonly<JsonBlockProps>) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (content == null || content === "") return null;

  let displayText = content;
  try {
    const parsed = JSON.parse(content);
    displayText = JSON.stringify(parsed, null, 2);
  } catch {
    displayText = content;
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
    <div data-od-id="json-block" id={id}>
      <div className="flex items-center justify-between border-t border-border px-3 py-1">
        <span className="sr-only">Result content</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <pre
        className={cn(
          "overflow-x-auto whitespace-pre-wrap px-3 py-2 font-mono text-xs leading-relaxed text-fg-2",
          maxHeightClassName,
        )}
      >
        {displayText}
      </pre>
    </div>
  );
}
