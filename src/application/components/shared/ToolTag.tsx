import { cn } from "@/application/lib/utils";

interface ToolTagProps {
  label: string;
  className?: string;
}

export default function ToolTag({ label, className }: Readonly<ToolTagProps>) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-border bg-surface-warm px-2 py-0.5 font-mono text-xs text-fg-2 rounded-none",
        className,
      )}
    >
      {label}
    </span>
  );
}
