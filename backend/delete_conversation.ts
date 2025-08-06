import { api } from "encore.dev/api";
import { chatDB } from "./db";

export interface DeleteConversationRequest {
  conversationId: number;
}

// Deletes a conversation and all its messages.
export const deleteConversation = api<DeleteConversationRequest, void>(
  { expose: true, method: "DELETE", path: "/conversations/:conversationId" },
  async (req) => {
    await chatDB.exec`
      DELETE FROM conversations
      WHERE id = ${req.conversationId}
    `;
  }
);
