export interface Message {
  id: number;
  conversationId: number;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: number;
  systemMessage: string;
  createdAt: Date;
  updatedAt: Date;
}
