import { cn } from "@/application/lib/utils";

interface StatusBadgeProps {
  status: string;
}

function resolveVariant(status: string): {
  bg: string;
  text: string;
} {
  const normalized = status.toLowerCase();
  if (normalized === "active" || normalized === "completed") {
    return { bg: "bg-emerald-100", text: "text-emerald-700" };
  }
  if (normalized === "awaiting_hitl") {
    return { bg: "bg-orange-100", text: "text-orange-700" };
  }
  return { bg: "bg-slate-100", text: "text-slate-600" };
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { bg, text } = resolveVariant(status);

  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest select-none",
        bg,
        text,
      )}
    >
      {status}
    </span>
  );
}
