interface BreadcrumbBarProps {
  segments: string[];
  onNavigate: (index: number) => void;
}

export default function BreadcrumbBar({
  segments,
  onNavigate,
}: Readonly<BreadcrumbBarProps>) {
  return (
    <nav
      className="flex items-center gap-2 text-sm text-on-surface-variant mb-6"
      aria-label="Breadcrumb"
    >
      <button
        type="button"
        onClick={() => onNavigate(-1)}
        aria-label="Home"
        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container transition-colors"
      >
        <span className="material-symbols-outlined text-lg" aria-hidden="true">
          home
        </span>
      </button>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        return (
          <div key={`${segment}-${index}`} className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-xs text-outline"
              aria-hidden="true"
            >
              chevron_right
            </span>
            {isLast ? (
              <span className="font-headline text-sm font-semibold text-on-surface">
                {segment}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(index)}
                className="font-headline text-sm text-secondary-brand hover:opacity-80 transition-opacity"
              >
                {segment}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
