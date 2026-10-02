import { Suspense } from "react";
import { Outlet, useLocation } from "react-router";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { PublicFooter } from "@/components/navbar/PublicFooter";
import { PublicNavbar } from "@/components/navbar/PublicNavbar";
import { LoadingState } from "@/components/ui/States";

export function PublicLayout() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>
      <PublicNavbar />
      <main id="main" className="flex-1">
        {/* Some pages (e.g. Apply online) load on demand */}
        <Suspense fallback={<LoadingState label="Loading..." className="min-h-[60vh] pt-24" />}>
          {/* Soft fade each time the page changes (key = the page address). */}
          <div key={pathname} className="animate-page-in">
            <Outlet />
          </div>
        </Suspense>
      </main>
      <PublicFooter />
      <ChatbotWidget />
    </div>
  );
}
