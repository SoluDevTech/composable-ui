import type { StructuredResponseResult } from "@/domain/entities/chat/traceEvent";
import StructuredResponseCard from "@/application/components/chat/StructuredResponseCard";

interface StructuredResponseLiveProps {
  result: StructuredResponseResult | null;
  hasResponseFormat: boolean;
}

export default function StructuredResponseLive({
  result,
  hasResponseFormat,
}: Readonly<StructuredResponseLiveProps>) {
  if (!result) return null;
  if (result.kind === "valid") return <StructuredResponseCard data={result.data} />;
  if (result.kind === "malformed") {
    return (
      <div
        role="alert"
        className="mt-2 border border-danger bg-bg p-3 font-mono text-xs text-danger"
      >
        <span className="uppercase tracking-[0.1em]">Malformed JSON</span>
        <p className="mt-1 text-danger/80">{result.error}</p>
      </div>
    );
  }
  if (!hasResponseFormat) return null;
  return <div className="mt-2 font-mono text-xs text-muted">No structured response</div>;
}
