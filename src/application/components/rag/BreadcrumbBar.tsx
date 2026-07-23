import { Home } from "lucide-react";
import { Button } from "@/application/components/ui/button";

interface BreadcrumbBarProps {
  segments: string[];
  onNavigate: (index: number) => void;
}

export default function BreadcrumbBar({ segments, onNavigate }: Readonly<BreadcrumbBarProps>) {
  return (
    <nav
      aria-label="Breadcrumb"
      data-od-id="breadcrumb"
      className="flex items-center gap-1 flex-wrap p-3 border border-border bg-surface"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="Home"
        onClick={() => onNavigate(-1)}
        className="text-muted hover:text-accent font-mono text-xs"
      >
        <Home className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
      <ol className="flex items-center gap-1 flex-wrap min-w-0">
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          return (
            <li key={`${segment}-${index}`} className="flex items-center gap-1 min-w-0">
              <span className="text-muted px-1 font-mono text-xs" aria-hidden="true">
                ›
              </span>
              {isLast ? (
                <span
                  aria-current="page"
                  className="text-fg font-mono text-xs truncate px-1 py-0.5"
                >
                  {segment}
                </span>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate(index)}
                  className="text-muted hover:text-accent font-mono text-xs"
                >
                  {segment}
                </Button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
