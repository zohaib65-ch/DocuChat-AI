/**
 * Core type definitions for DocuChat AI
 */

export type MessageRole = "user" | "assistant" | "system";

/**
 * A retrieved document chunk with source attribution.
 */
export interface DocumentSourceChunk {
  documentId: string;
  documentName: string;
  pageNumber?: number;
  chunkIndex: number;
  content: string;
  score?: number;
}

/**
 * Chat message contract.
 */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  sources?: DocumentSourceChunk[];
  isStreaming?: boolean;
}

/**
 * Payload sent to /api/chat.
 */
export interface ChatRequestPayload {
  message: string;
  history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  documentId?: string;
}

/**
 * Metadata stored for uploaded documents.
 */
export interface DocumentMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: number;
  totalChunks: number;
  totalCharacters: number;
  status: "processing" | "ready" | "error";
  errorMessage?: string;
}

/**
 * Ingestion response returned after processing an upload.
 */
export interface IngestionResult {
  document: DocumentMetadata;
  chunksCount: number;
}
