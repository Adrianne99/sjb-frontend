// The chat window. Messages go to POST /api/chatbot/message on our backend,
// which answers with AI (Saint John Bosco topics only) or the FAQ.
import { Send, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { getErrorMessage } from "@/services/api";
import { chatbotService } from "@/services/chatbot.service";
import { BotAvatar } from "./BotAvatar";
import { ChatMessage, TypingIndicator, type ChatEntry } from "./ChatMessage";

const WELCOME: ChatEntry = {
  id: 0,
  from: "assistant",
  text: "Hi! I'm the Saint John Bosco assistant. Ask me about admissions, programs, tuition fees, enrollment, schedules, announcements or the Student Portal.",
};

const STARTER_QUESTIONS = ["What are the admission requirements?", "How much is the tuition?", "How do I log in to the Student Portal?"];

/** How many earlier messages are sent along, so follow-up questions make sense. */
const HISTORY_SIZE = 6;

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatEntry[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  async function ask(text: string) {
    const question = text.trim();
    if (!question || typing) return;
    // Earlier messages of this chat (not the welcome text), oldest first.
    const history = messages
      .filter((entry) => entry.id !== WELCOME.id)
      .slice(-HISTORY_SIZE)
      .map((entry) => ({ role: entry.from, content: entry.text.slice(0, 1500) }));
    setMessages((current) => [...current, { id: nextId.current++, from: "user", text: question }]);
    setInput("");
    setTyping(true);
    try {
      const reply = await chatbotService.send(question, history);
      setMessages((current) => [...current, { id: nextId.current++, from: "assistant", text: reply.reply }]);
    } catch (error) {
      setMessages((current) => [...current, { id: nextId.current++, from: "assistant", text: getErrorMessage(error) }]);
    } finally {
      setTyping(false);
    }
  }

  // Suggested questions only show before the conversation starts.
  const hasStarted = messages.some((entry) => entry.from === "user");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <section
      aria-label="School assistant chat"
      className="fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] animate-slide-up flex-col overflow-hidden rounded-t-2xl border border-border bg-surface shadow-lg sm:inset-x-auto sm:right-6 sm:bottom-24 sm:h-[min(600px,calc(100dvh-8rem))] sm:w-[380px] sm:rounded-2xl"
    >
      <header className="flex items-center gap-3 bg-primary-900 px-4 py-3 text-white">
        <BotAvatar size="md" className="ring-2 ring-white/20" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-sm font-semibold text-white">SJB Assistant</h2>
          <p className="text-xs text-primary-200">Saint John Bosco questions only</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close chat" className="flex size-9 items-center justify-center rounded-md text-primary-100 hover:bg-white/10">
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.map((entry) => (
          <ChatMessage key={entry.id} entry={entry} />
        ))}
        {typing && <TypingIndicator />}
      </div>

      {!hasStarted && (
        <div className="flex flex-col items-start gap-1.5 px-4 pb-2" aria-label="Suggested questions">
          {STARTER_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => void ask(question)}
              className="max-w-full rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-left text-xs font-medium text-primary-800 hover:bg-primary-100"
            >
              {question}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border px-3 py-3">
        <label htmlFor="chat-input" className="sr-only">
          Type your question
        </label>
        <input
          id="chat-input"
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          maxLength={500}
          placeholder="Type your question..."
          autoComplete="off"
          className="h-11 min-w-0 flex-1 rounded-full border border-border-strong bg-surface px-4 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || typing}
          aria-label="Send message"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
        >
          <Send className="size-4" aria-hidden="true" />
        </button>
      </form>
      <p className="flex items-center gap-1.5 bg-surface-muted px-4 py-2 text-[0.7rem] text-ink-muted">
        <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
        Answers may be AI-generated — confirm important details with the school. Don't share personal details here.
      </p>
    </section>
  );
}
