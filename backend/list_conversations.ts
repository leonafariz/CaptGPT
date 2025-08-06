import { api } from "encore.dev/api";
import { chatDB } from "./db";
import type { Conversation } from "./types";

export interface ListConversationsResponse {
  conversations: Conversation[];
}

// Retrieves all conversations, ordered by update date (latest first).
export const listConversations = api<void, ListConversationsResponse>(
  { expose: true, method: "GET", path: "/conversations" },
  async () => {
    const rows = await chatDB.queryAll<{
      id: number;
      title: string;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT id, title, created_at, updated_at
      FROM conversations
      ORDER BY updated_at DESC
    `;

    return {
      conversations: rows.map(row => ({
        id: row.id,
        title: row.title,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    };
  }
);
