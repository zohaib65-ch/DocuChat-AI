import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

/**
 * Returns the Google API key from the environment.
 * Throws a descriptive error if the key is missing.
 */
export function getGoogleApiKey(): string {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "Missing GOOGLE_API_KEY. Please set your Google Gemini API key in .env.local"
    );
  }
  return apiKey.trim();
}

export interface ChatModelOptions {
  modelName?: string;
  temperature?: number;
  streaming?: boolean;
  maxRetries?: number;
}

/**
 * Initializes and returns the LangChain Chat Model for Google Gemini.
 * 
 * In LangChain:
 * - Implements the `BaseChatModel` abstraction.
 * - Used in the RAG pipeline to synthesize answers from retrieved context and user questions.
 * 
 * Default model: "gemini-3.5-flash-lite" (ultra-fast TTFT ~800ms)
 * Default temperature: 0.2 (low temperature for grounded, non-hallucinatory document Q&A)
 */
export function getChatModel(options?: ChatModelOptions): ChatGoogleGenerativeAI {
  const apiKey = getGoogleApiKey();
  const model = options?.modelName || process.env.GEMINI_CHAT_MODEL || "gemini-3.5-flash-lite";
  const temperature = options?.temperature ?? 0.2;
  const streaming = options?.streaming ?? true;
  const maxRetries = options?.maxRetries ?? 2;

  return new ChatGoogleGenerativeAI({
    apiKey,
    model,
    temperature,
    streaming,
    maxRetries,
  });
}
