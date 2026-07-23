import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/application/components/ui/button";
import { useSidebarStore } from "@/application/stores/useSidebarStore";

interface TitleEntry {
  match: (pathname: string) => boolean;
  render: () => ReactNode;
}

const TITLE_MAP: readonly TitleEntry[] = [
  {
    match: (p) => p.startsWith("/chat"),
    render: () => (
      <>
        Orchestration <span className="text-accent">Console</span>
      </>
    ),
  },
  {
    match: (p) => p.startsWith("/agents"),
    render: () => (
      <>
        Active <span className="text-accent">Agents</span>
      </>
    ),
  },
  {
    match: (p) => p.startsWith("/rag"),
    render: () => (
      <>
        RAG <span className="text-accent">Storage</span>
      </>
    ),
  },
  {
    match: (p) => p.startsWith("/settings"),
    render: () => <>Settings</>,
  },
] as const;

const FALLBACK_TITLE = "Composable UI";

function usePageTitle(): ReactNode {
  const { pathname } = useLocation();
  for (const entry of TITLE_MAP) {
    if (entry.match(pathname)) return entry.render();
  }
  return FALLBACK_TITLE;
}

export default function MainHeader() {
  const open = useSidebarStore((s) => s.open);
  const title = usePageTitle();

  return (
    <header
      data-od-id="main-header"
      className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-bg/80 px-4 backdrop-blur md:px-6"
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          onClick={open}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
        <h1
          data-od-id="page-title"
          className="font-display text-base uppercase tracking-[0.06em] text-fg"
        >
          {title}
        </h1>
      </div>
    </header>
  );
}
