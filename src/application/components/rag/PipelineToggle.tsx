interface PipelineToggleProps {
  value: "lightrag" | "classical";
  onChange: (value: "lightrag" | "classical") => void;
}

export default function PipelineToggle({ value, onChange }: Readonly<PipelineToggleProps>) {
  return (
    <div className="flex items-center gap-1 bg-surface-container rounded-lg p-1">
        <button
        type="button"
        aria-pressed={value === "lightrag"}
        onClick={() => onChange("lightrag")}
        className={`px-4 py-2 rounded-md font-headline text-xs font-semibold transition-colors ${
          value === "lightrag"
            ? "bg-surface-container-lowest text-on-surface shadow-sm"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        LightRAG
      </button>
      <button
        type="button"
        aria-pressed={value === "classical"}
        onClick={() => onChange("classical")}
        className={`px-4 py-2 rounded-md font-headline text-xs font-semibold transition-colors ${
          value === "classical"
            ? "bg-surface-container-lowest text-on-surface shadow-sm"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        Classical
      </button>
    </div>
  );
}