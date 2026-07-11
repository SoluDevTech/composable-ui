import type { ReactNode } from "react";
import TopNav from "@/application/components/layout/TopNav";
import ThreadSidebar from "@/application/components/layout/ThreadSidebar";

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  activeThreadId?: string;
}

const MAIN_ID = "main-content";

function SkipLink() {
  return (
    <a
      href={`#${MAIN_ID}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-on-surface focus:text-white focus:shadow-lg focus:font-headline focus:text-xs focus:font-bold focus:uppercase focus:tracking-widest"
    >
      Skip to content
    </a>
  );
}

export default function MainLayout({
  children,
  showSidebar = false,
  activeThreadId,
}: Readonly<MainLayoutProps>) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <SkipLink />
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <ThreadSidebar activeThreadId={activeThreadId} />}
        <main
          id={MAIN_ID}
          tabIndex={-1}
          className="flex-1 flex flex-col overflow-hidden outline-none scroll-mt-24"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
