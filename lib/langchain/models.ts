import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

/**
 * Validates that the Google Gemini API key is configured.
 */
export function getApiKey(): string {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "Missing GOOGLE_API_KEY. Please set your Google Gemini API key in .env.local"
    );
  }
  return apiKey.trim();
}

/**
 * Returns a configured LangChain Chat Model for Google Gemini.
 * 
 * In LangChain, ChatGoogleGenerativeAI implements the BaseChatModel interface.
 * - model: "gemini-3.6-flash" (high speed, reasoning, streaming support)
 * - temperature: 0.2 (low randomness for accurate, grounded document Q&A)
 */
export function getChatModel(options?: {
  temperature?: number;
  modelName?: string;
  streaming?: boolean;
}): ChatGoogleGenerativeAI {
  const apiKey = getApiKey();
  return new ChatGoogleGenerativeAI({
    apiKey,
    model: options?.modelName ?? "gemini-3.6-flash",
    temperature: options?.temperature ?? 0.2,
    streaming: options?.streaming ?? true,
    maxRetries: 2,
  });
}

/**
 * Returns a configured LangChain Embeddings Model for Google Gemini.
 * 
 * In LangChain, GoogleGenerativeAIEmbeddings implements the Embeddings interface.
 * Embeddings convert arbitrary text passages into high-dimensional vectors (numerical arrays).
 * - model: "gemini-embedding-2" (creates 3072-dimensional semantic vectors)
 */
export function getEmbeddingsModel(options?: {
  modelName?: string;
}): GoogleGenerativeAIEmbeddings {
  const apiKey = getApiKey();
  return new GoogleGenerativeAIEmbeddings({
    apiKey,
    model: options?.modelName ?? "gemini-embedding-2",
  });
}
