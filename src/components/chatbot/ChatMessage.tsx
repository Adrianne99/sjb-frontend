import { cn } from "@/utils/cn";
import { BotAvatar } from "./BotAvatar";

export interface ChatEntry {
  id: number;
  from: "assistant" | "user";
  text: string;
}

/** One chat bubble. Text is rendered as plain text (never as HTML).
 *  `wrap-anywhere` breaks very long words (e.g. pasted links) so they stay inside the bubble. */
export function ChatMessage({ entry }: { entry: ChatEntry }) {
  const isUser = entry.from === "user";
  return (
    <div className={cn("flex items-end gap-2", isUser && "justify-end")}>
      {!isUser && (
        <BotAvatar size="sm" className="border border-border" />
      )}
      <p
        className={cn(
          "min-w-0 max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed whitespace-pre-line wrap-anywhere sm:max-w-[82%] sm:text-sm",
          isUser ? "rounded-br-sm bg-primary-600 text-white" : "rounded-bl-sm bg-surface-muted text-ink",
        )}
      >
        <span className="sr-only">{isUser ? "You said: " : "Assistant: "}</span>
        {entry.text}
      </p>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2" role="status" aria-label="Assistant is typing">
      <BotAvatar size="sm" className="border border-border" />
      <span className="flex gap-1 rounded-2xl rounded-bl-sm bg-surface-muted px-4 py-3.5" aria-hidden="true">
        {[0, 150, 300].map((delay) => (
          <span key={delay} className="size-1.5 animate-bounce rounded-full bg-ink-muted" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </span>
    </div>
  );
}
