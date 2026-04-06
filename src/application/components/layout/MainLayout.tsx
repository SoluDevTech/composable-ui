import type { ReactNode } from "react";
import TopNav from "@/application/components/layout/TopNav";
import ThreadSidebar from "@/application/components/layout/ThreadSidebar";

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  activeThreadId?: string;
}

export default function MainLayout({
  children,
  showSidebar = false,
  activeThreadId,
}: MainLayoutProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <ThreadSidebar activeThreadId={activeThreadId} />}
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
