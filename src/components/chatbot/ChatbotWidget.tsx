// Floating chat button (bottom-right of public pages) with a greeting bubble.
//
// • The greeting ("Hi! How can I help you today?") is ALWAYS shown next to the
//   robot button while the chat is closed — no hover needed.
// • Clicking the greeting or the robot opens the chat; the X closes it again.
// • If the chat is closed while SJB Assistant is still answering, the reply
//   still arrives: a red badge on the robot shows how many replies are unread,
//   and the greeting says there is a new reply. Opening the chat clears it.
import { X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { BotAvatar } from "./BotAvatar";
import { ChatPanel } from "./ChatPanel";

/** The text in the greeting bubble next to the robot button. */
const GREETING = "Hi! How can I help you today?";
const NEW_REPLY_GREETING = "SJB Assistant replied — tap to read";

/** "1 new message", "2 new messages" (for screen readers). */
function unreadLabel(count: number) {
  return `${count} new ${count === 1 ? "message" : "messages"}`;
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  /** The chat window is created on first opening, then only hidden/shown. */
  const [started, setStarted] = useState(false);
  const [unread, setUnread] = useState(0);
  // Replies arrive later (after `await`), so read "is it open?" from a ref, not from old state.
  const openRef = useRef(false);

  function setChatOpen(value: boolean) {
    openRef.current = value;
    setOpen(value);
    if (value) {
      setStarted(true);
      setUnread(0);
    }
  }

  const handleReply = useCallback(() => {
    if (!openRef.current) setUnread((count) => count + 1);
  }, []);

  return (
    <div className="no-print">
      {started && <ChatPanel open={open} onClose={() => setChatOpen(false)} onReply={handleReply} />}

      <div className="fixed right-4 bottom-4 z-40 flex items-center gap-3 sm:right-6 sm:bottom-6">
        {!open && (
          // Navy speech bubble with a small pointer towards the robot.
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="relative rounded-full bg-primary-950 px-4 py-2.5 text-sm font-medium whitespace-nowrap text-white shadow-sm"
          >
            {unread > 0 ? NEW_REPLY_GREETING : GREETING}
            <span className="absolute top-1/2 -right-1 size-2.5 -translate-y-1/2 rotate-45 bg-primary-950" aria-hidden="true" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setChatOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Close school assistant" : unread > 0 ? `Open school assistant, ${unreadLabel(unread)}` : "Open school assistant"}
          className="relative flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-900 text-white shadow-sm"
        >
          {open ? <X className="size-6" aria-hidden="true" /> : <BotAvatar size="lg" />}
          {!open && unread > 0 && (
            // Unread badge (red circle with the number, like a messaging app).
            <span
              className="absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-danger-600 px-1.5 text-xs font-bold text-white ring-2 ring-white"
              aria-hidden="true"
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </div>

      {/* Announces new replies to screen-reader users while the chat is closed. */}
      <p className="sr-only" aria-live="polite">
        {!open && unread > 0 ? `SJB Assistant: ${unreadLabel(unread)}` : ""}
      </p>
    </div>
  );
}
