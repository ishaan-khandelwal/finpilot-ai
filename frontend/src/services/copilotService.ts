import api from "@/lib/api";
import { API_ROUTES } from "@/constants/routes";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: string[];
}

export interface ConversationResponse {
  id: string;
  messages: ChatMessage[];
}

export const copilotService = {
  async sendMessage(question: string, conversationId?: string): Promise<{
    answer: string;
    conversation_id: string;
    sources: string[];
  }> {
    const { data } = await api.post(API_ROUTES.COPILOT.CHAT, {
      question,
      conversation_id: conversationId,
    });
    return data;
  },
};
