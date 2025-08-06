import { api } from "encore.dev/api";
import { chatDB } from "./db";
import type { Message } from "./types";

export interface SendMessageRequest {
  conversationId: number;
  content: string;
  apiKey: string;
}

export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage: Message;
}

// Sends a message and gets AI response.
export const sendMessage = api<SendMessageRequest, SendMessageResponse>(
  { expose: true, method: "POST", path: "/conversations/:conversationId/messages" },
  async (req) => {
    // Save user message
    const userMessageRow = await chatDB.queryRow<{
      id: number;
      conversation_id: number;
      role: "user" | "assistant" | "system";
      content: string;
      created_at: Date;
    }>`
      INSERT INTO messages (conversation_id, role, content)
      VALUES (${req.conversationId}, 'user', ${req.content})
      RETURNING id, conversation_id, role, content, created_at
    `;

    if (!userMessageRow) {
      throw new Error("Failed to save user message");
    }

    // Get system message
    const settingsRow = await chatDB.queryRow<{ system_message: string }>`
      SELECT system_message FROM settings ORDER BY id DESC LIMIT 1
    `;
    const systemMessage = settingsRow?.system_message || "You are a helpful assistant.";

    // Get conversation history
    const historyRows = await chatDB.queryAll<{
      role: "user" | "assistant" | "system";
      content: string;
    }>`
      SELECT role, content
      FROM messages
      WHERE conversation_id = ${req.conversationId}
      AND role != 'system'
      ORDER BY created_at ASC
    `;

    // Prepare messages for OpenAI
    const messages = [
      { role: "system", content: systemMessage },
      ...historyRows.map(row => ({ role: row.role, content: row.content }))
    ];

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${req.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const assistantContent = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    // Save assistant message
    const assistantMessageRow = await chatDB.queryRow<{
      id: number;
      conversation_id: number;
      role: "user" | "assistant" | "system";
      content: string;
      created_at: Date;
    }>`
      INSERT INTO messages (conversation_id, role, content)
      VALUES (${req.conversationId}, 'assistant', ${assistantContent})
      RETURNING id, conversation_id, role, content, created_at
    `;

    if (!assistantMessageRow) {
      throw new Error("Failed to save assistant message");
    }

    // Update conversation timestamp
    await chatDB.exec`
      UPDATE conversations
      SET updated_at = NOW()
      WHERE id = ${req.conversationId}
    `;

    return {
      userMessage: {
        id: userMessageRow.id,
        conversationId: userMessageRow.conversation_id,
        role: userMessageRow.role,
        content: userMessageRow.content,
        createdAt: userMessageRow.created_at,
      },
      assistantMessage: {
        id: assistantMessageRow.id,
        conversationId: assistantMessageRow.conversation_id,
        role: assistantMessageRow.role,
        content: assistantMessageRow.content,
        createdAt: assistantMessageRow.created_at,
      },
    };
  }
);
