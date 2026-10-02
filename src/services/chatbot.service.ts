// Chatbot API. The UI only talks to OUR backend; the backend decides how to
// answer (AI limited to Saint John Bosco topics, or the approved FAQ). No AI keys ever live here.
import type { ChatbotReply } from "@/types";
import { api } from "./api";

export const chatbotService = {
  send: async (message: string, history: Array<{ role: "user" | "assistant"; content: string }> = []) =>
    (await api.post<ChatbotReply>("/chatbot/message", { message, history })).data,
};
