import { DocumentSourceChunk } from "./document";

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  sources?: DocumentSourceChunk[];
  isStreaming?: boolean;
}

export interface ChatRequestPayload {
  message: string;
  history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  documentId?: string; // Optional filter to query a single document or all
}
