// Chatbot API. The UI only talks to OUR backend; the backend decides how to
// answer (AI limited to Saint John Bosco topics, or the approved FAQ). No AI keys ever live here.
//
// Every chat runs in a session. The session token is an HttpOnly cookie the
// browser sends automatically — JavaScript never sees it. Requests that change
// something also carry the chat CSRF token in the X-Chat-CSRF-Token header.
import type { ChatbotReply, ChatHistoryMessage, ChatSessionInfo } from "@/types";
import { api } from "./api";

const chatCsrfHeader = (csrfToken: string) => ({ "X-Chat-CSRF-Token": csrfToken });

export const chatbotService = {
  /** Starts a chat (or returns the one this browser already has). */
  createSession: async () => (await api.post<ChatSessionInfo>("/chatbot/sessions")).data,
  /** This browser's chat. Fails with CHAT_SESSION_* when there is none / it ended. */
  currentSession: () => api.get<ChatSessionInfo>("/chatbot/sessions/current"),
  endSession: (csrfToken: string) => api.delete<null>("/chatbot/sessions/current", chatCsrfHeader(csrfToken)),
  /** Earlier messages of the current chat, oldest first. */
  history: () => api.get<ChatHistoryMessage[]>("/chatbot/messages"),
  send: async (message: string, csrfToken: string) =>
    (await api.post<ChatbotReply>("/chatbot/message", { message }, chatCsrfHeader(csrfToken))).data,
};
