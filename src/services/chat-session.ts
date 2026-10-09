// Keeps ONE SJB Assistant chat session for this browser tab.
//
//   ensure()   reuse the current session, or create one. Calls made at the same
//              time share ONE request, so double clicks never create duplicates.
//   send()     send a message. If the chat security token is out of date
//              (e.g. after logging in), re-read it once and try again.
//   restart()  end the current session (if any) and start a fresh one.
//
// The session token itself is in an HttpOnly cookie; this file only ever sees
// the CSRF token, and keeps it in memory (never localStorage).
import type { ChatbotReply, ChatSessionInfo } from "@/types";
import { ApiError } from "./api";
import { chatbotService } from "./chatbot.service";

/** The backend calls the manager needs (a fake one is used in tests). */
export interface ChatSessionClient {
  currentSession(): Promise<ChatSessionInfo>;
  createSession(): Promise<ChatSessionInfo>;
  endSession(csrfToken: string): Promise<unknown>;
  send(message: string, csrfToken: string): Promise<ChatbotReply>;
}

/** Shown when a chat has expired or ended. */
export const CHAT_EXPIRED_MESSAGE = "Your chat session has expired. Start a new conversation to continue chatting with SJB Assistant.";

/** True when the server says the chat is missing, expired, revoked or not valid. */
export function isChatSessionEnded(error: unknown): boolean {
  return error instanceof ApiError && error.code.startsWith("CHAT_SESSION_");
}

export function createChatSessionManager(client: ChatSessionClient) {
  let session: ChatSessionInfo | null = null;
  let pending: Promise<ChatSessionInfo> | null = null;

  /** Runs `task` unless one is already running, in which case its result is shared. */
  function singleFlight(task: () => Promise<ChatSessionInfo>): Promise<ChatSessionInfo> {
    if (!pending) {
      pending = task()
        .then((info) => {
          session = info;
          return info;
        })
        .finally(() => {
          pending = null;
        });
    }
    return pending;
  }

  async function currentOrNew(): Promise<ChatSessionInfo> {
    try {
      return await client.currentSession();
    } catch (error) {
      if (!isChatSessionEnded(error)) throw error;
      return client.createSession();
    }
  }

  async function startFresh(): Promise<ChatSessionInfo> {
    const old = session;
    session = null;
    // Ending the old chat may fail if it already expired — that is fine.
    if (old) await client.endSession(old.csrfToken).catch(() => undefined);
    return client.createSession();
  }

  return {
    ensure: () => singleFlight(currentOrNew),

    restart: () => singleFlight(startFresh),

    async send(message: string): Promise<ChatbotReply> {
      const current = session ?? (await singleFlight(currentOrNew));
      try {
        return await client.send(message, current.csrfToken);
      } catch (error) {
        if (isChatSessionEnded(error)) session = null;
        if (!(error instanceof ApiError && error.code === "CHAT_CSRF_INVALID")) throw error;
        // Out-of-date security token: read the current one and retry once.
        const fresh = await singleFlight(() => client.currentSession());
        return client.send(message, fresh.csrfToken);
      }
    },
  };
}

/** The one manager the website uses. */
export const chatSession = createChatSessionManager(chatbotService);
