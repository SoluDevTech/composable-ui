interface ToolTagProps {
  label: string;
}

export default function ToolTag({ label }: ToolTagProps) {
  return (
    <span className="bg-surface-container-low px-3 py-1 rounded-full text-xs font-medium text-on-surface-variant">
      {label}
    </span>
  );
}
