import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { getGoogleApiKey } from "./model";

export interface EmbeddingsOptions {
  modelName?: string;
}

/**
 * Initializes and returns the LangChain Embeddings Model for Google Gemini.
 * 
 * In LangChain:
 * - Implements the `Embeddings` interface (`embedDocuments` and `embedQuery`).
 * - Converts raw text (document chunks or user questions) into numerical vectors.
 * - These vectors capture semantic meaning, allowing vector databases to perform
 *   mathematical similarity search (e.g. cosine similarity).
 * 
 * Default model: "gemini-embedding-2" (or configured via GEMINI_EMBEDDING_MODEL)
 */
export function getEmbeddingsModel(options?: EmbeddingsOptions): GoogleGenerativeAIEmbeddings {
  const apiKey = getGoogleApiKey();
  const model = options?.modelName || process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-2";

  return new GoogleGenerativeAIEmbeddings({
    apiKey,
    model,
  });
}
