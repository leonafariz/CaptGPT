import { api } from "encore.dev/api";
import { chatDB } from "./db";
import type { Conversation } from "./types";

export interface CreateConversationRequest {
  title: string;
}

export interface CreateConversationResponse {
  conversation: Conversation;
}

// Creates a new conversation.
export const createConversation = api<CreateConversationRequest, CreateConversationResponse>(
  { expose: true, method: "POST", path: "/conversations" },
  async (req) => {
    const row = await chatDB.queryRow<{
      id: number;
      title: string;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO conversations (title)
      VALUES (${req.title})
      RETURNING id, title, created_at, updated_at
    `;

    if (!row) {
      throw new Error("Failed to create conversation");
    }

    return {
      conversation: {
        id: row.id,
        title: row.title,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  }
);
