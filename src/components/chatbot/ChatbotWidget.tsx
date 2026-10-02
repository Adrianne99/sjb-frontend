// Floating chat button (bottom-right of public pages) with a greeting bubble.
//
// • The greeting ("Hi! How can I help you today?") is ALWAYS shown next to the
//   robot button while the chat is closed — no hover needed.
// • Clicking the greeting or the robot opens the chat; the X closes it again.
import { X } from "lucide-react";
import { useState } from "react";
import { BotAvatar } from "./BotAvatar";
import { ChatPanel } from "./ChatPanel";

/** The text in the greeting bubble next to the robot button. */
const GREETING = "Hi! How can I help you today?";

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="no-print">
      {open && <ChatPanel onClose={() => setOpen(false)} />}

      <div className="fixed right-4 bottom-4 z-40 flex items-center gap-3 sm:right-6 sm:bottom-6">
        {!open && (
          // Navy speech bubble with a small pointer towards the robot.
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative animate-slide-up rounded-full bg-primary-950 px-4 py-2.5 text-sm font-medium whitespace-nowrap text-white shadow-lg"
          >
            {GREETING}
            <span className="absolute top-1/2 -right-1 size-2.5 -translate-y-1/2 rotate-45 bg-primary-950" aria-hidden="true" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Close school assistant" : "Open school assistant"}
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-900 text-white shadow-lg ring-4 ring-gold-400/30 transition-transform hover:scale-105"
        >
          {open ? <X className="size-6" aria-hidden="true" /> : <BotAvatar size="lg" />}
        </button>
      </div>
    </div>
  );
}
