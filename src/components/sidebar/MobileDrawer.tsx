// Slide-in panel for the sidebar on phones and tablets.
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function MobileDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div className="absolute inset-0 animate-fade-in bg-primary-950/50" onClick={onClose} aria-hidden="true" />
      <div className="relative h-full w-72 max-w-[85vw] animate-slide-in-left shadow-lg">
        {children}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute top-4 -right-12 flex size-10 items-center justify-center rounded-full bg-surface text-primary-900 shadow-md"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
