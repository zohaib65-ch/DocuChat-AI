/**
 * Metadata associated with an uploaded document.
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
 * A retrieved document chunk with source attribution.
 */
export interface DocumentSourceChunk {
  documentId: string;
  documentName: string;
  page?: number;
  chunkIndex: number;
  content: string;
  score?: number;
}
