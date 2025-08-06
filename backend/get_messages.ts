import { api } from "encore.dev/api";
import { chatDB } from "./db";
import type { Message } from "./types";

export interface GetMessagesRequest {
  conversationId: number;
}

export interface GetMessagesResponse {
  messages: Message[];
}

// Retrieves all messages for a conversation, ordered by creation date.
export const getMessages = api<GetMessagesRequest, GetMessagesResponse>(
  { expose: true, method: "GET", path: "/conversations/:conversationId/messages" },
  async (req) => {
    const rows = await chatDB.queryAll<{
      id: number;
      conversation_id: number;
      role: "user" | "assistant" | "system";
      content: string;
      created_at: Date;
    }>`
      SELECT id, conversation_id, role, content, created_at
      FROM messages
      WHERE conversation_id = ${req.conversationId}
      ORDER BY created_at ASC
    `;

    return {
      messages: rows.map(row => ({
        id: row.id,
        conversationId: row.conversation_id,
        role: row.role,
        content: row.content,
        createdAt: row.created_at,
      })),
    };
  }
);
