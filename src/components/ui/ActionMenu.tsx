// "⋯" menu for row actions in tables.
//
// The menu is drawn on top of the whole page (a React "portal" into <body>),
// so the table's scroll area can never cut it off — even when a filter leaves
// only one row. It opens below the button, or above it when there is no room.
import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { cn } from "@/utils/cn";

export interface ActionItem {
  label: string;
  icon?: LucideIcon;
  to?: string;
  onClick?: () => void;
  danger?: boolean;
}

const MENU_WIDTH = 192; // w-48
const GAP = 4;

export function ActionMenu({ label, items }: { label: string; items: ActionItem[] }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  // Place the menu next to the button (flip up if it would go off the bottom of the screen).
  useLayoutEffect(() => {
    if (!open || !buttonRef.current || !menuRef.current) return;
    const button = buttonRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current.offsetHeight;
    const fitsBelow = button.bottom + GAP + menuHeight <= window.innerHeight - 8;
    const top = fitsBelow ? button.bottom + GAP : Math.max(8, button.top - GAP - menuHeight);
    const left = Math.min(Math.max(8, button.right - MENU_WIDTH), window.innerWidth - MENU_WIDTH - 8);
    setPosition({ top, left });
  }, [open]);

  // Close on outside click, Escape, scrolling or resizing.
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const toggle = () => {
    setPosition(null);
    setOpen((value) => !value);
  };

  const itemClass = (danger?: boolean) =>
    cn("flex w-full items-center gap-2 px-3 py-2 text-left text-sm", danger ? "text-danger-700 hover:bg-danger-50" : "text-ink-soft hover:bg-surface-muted hover:text-primary-900");

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={label}
        className="flex size-9 items-center justify-center rounded-md text-ink-muted hover:bg-surface-muted hover:text-primary-800"
      >
        <MoreHorizontal className="size-5" aria-hidden="true" />
      </button>
      {open &&
        createPortal(
          <ul
            ref={menuRef}
            className="fixed z-80 w-48 animate-fade-in rounded-lg border border-border bg-surface py-1 shadow-lg"
            // Hidden for the first moment while its position is measured.
            style={position ? { top: position.top, left: position.left } : { top: 0, left: 0, visibility: "hidden" }}
          >
            {items.map((item) => (
              <li key={item.label}>
                {item.to ? (
                  <Link to={item.to} className={itemClass(item.danger)} onClick={() => setOpen(false)}>
                    {item.icon && <item.icon className="size-4" aria-hidden="true" />}
                    {item.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={itemClass(item.danger)}
                    onClick={() => {
                      setOpen(false);
                      item.onClick?.();
                    }}
                  >
                    {item.icon && <item.icon className="size-4" aria-hidden="true" />}
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  );
}
