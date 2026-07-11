import { cn } from "@/application/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

type BadgeVariant = {
  bg: string;
  text: string;
  label?: string;
};

function resolveVariant(status: string): BadgeVariant {
  const normalized = status.toLowerCase();

  if (normalized === "active" || normalized === "completed" || normalized === "approved") {
    return { bg: "bg-emerald-100", text: "text-emerald-700" };
  }

  if (
    normalized === "awaiting_hitl" ||
    normalized === "awaiting review" ||
    normalized === "pending"
  ) {
    return { bg: "bg-orange-100", text: "text-orange-700" };
  }

  if (
    normalized === "streaming" ||
    normalized === "in_progress" ||
    normalized === "in progress" ||
    normalized === "processing"
  ) {
    return { bg: "bg-blue-100", text: "text-blue-700" };
  }

  if (normalized === "rejected" || normalized === "error" || normalized === "failed") {
    return { bg: "bg-red-100", text: "text-red-700" };
  }

  if (normalized === "standby" || normalized === "off") {
    return { bg: "bg-slate-100", text: "text-slate-500" };
  }

  return { bg: "bg-surface-container-high", text: "text-on-surface-variant" };
}

/** Format display label from a raw status string. */
function formatLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function StatusBadge({ status, className }: Readonly<StatusBadgeProps>) {
  const { bg, text } = resolveVariant(status);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest select-none",
        bg,
        text,
        className,
      )}
    >
      {formatLabel(status)}
    </span>
  );
}
