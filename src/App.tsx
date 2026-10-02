import { useEffect, useRef } from "react";
import { BrowserRouter, useLocation } from "react-router";
import { AuthProvider } from "@/contexts/AuthProvider";
import { ToastProvider } from "@/contexts/ToastProvider";
import { AppRoutes } from "@/routes/AppRoutes";

/**
 * Scrolling between pages and landing-page sections:
 * - A link like "/#about" slides smoothly to the section with id="about"
 *   (also when coming from another page, once the landing page has loaded).
 * - Opening a different page starts at the top, like a normal website.
 */
function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  const lastPathname = useRef(pathname);

  useEffect(() => {
    const pageChanged = lastPathname.current !== pathname;
    lastPathname.current = pathname;

    if (!hash) {
      if (pageChanged) window.scrollTo({ top: 0 });
      return;
    }

    const id = decodeURIComponent(hash.slice(1));
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let tries = 0;
    let resizeObserver: ResizeObserver | undefined;
    let stopTimer = 0;

    // Content above the section (announcements, fee table...) may still be
    // loading and push it down. For 2 seconds, keep the section in place —
    // unless the visitor starts scrolling themselves.
    const stopFollowing = () => {
      resizeObserver?.disconnect();
      window.clearTimeout(stopTimer);
      ["wheel", "touchstart", "keydown"].forEach((type) => window.removeEventListener(type, stopFollowing));
    };
    const followSection = (section: HTMLElement) => {
      let pageHeight = document.documentElement.scrollHeight;
      resizeObserver = new ResizeObserver(() => {
        // Only react when the page actually grew or shrank (not on the first call).
        const height = document.documentElement.scrollHeight;
        if (height === pageHeight) return;
        pageHeight = height;
        section.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
      });
      resizeObserver.observe(document.body);
      stopTimer = window.setTimeout(stopFollowing, 2000);
      ["wheel", "touchstart", "keydown"].forEach((type) => window.addEventListener(type, stopFollowing, { passive: true }));
    };

    // The landing page itself may still be loading, so look for the section for ~2 seconds.
    const scrollToSection = () => {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
        followSection(section);
      } else if (tries++ < 120) frame = requestAnimationFrame(scrollToSection);
    };
    scrollToSection();
    return () => {
      cancelAnimationFrame(frame);
      stopFollowing();
    };
  }, [pathname, hash, key]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ScrollManager />
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
