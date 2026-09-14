import { getChatModel } from "./model";
import { ragPromptTemplate } from "./prompts";
import { getVectorStore } from "@/lib/vector-store";
import { DocumentSourceChunk } from "@/types";
import { DocumentInterface } from "@langchain/core/documents";
import { IterableReadableStream } from "@langchain/core/utils/stream";
import { AIMessageChunk } from "@langchain/core/messages";

export interface RagPipelineInput {
  question: string;
  documentId?: string;
  history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

export interface RagPipelineResult {
  stream: IterableReadableStream<AIMessageChunk>;
  sources: DocumentSourceChunk[];
}

/**
 * Executes the LangChain RAG pipeline:
 * 
 * Question
 *   ↓
 * Vector Store Similarity Search (Cosine)
 *   ↓
 * Top k Relevant Chunks + Metadata
 *   ↓
 * Grounded Prompt Template
 *   ↓
 * Gemini 3.6 Flash
 *   ↓
 * Streaming Token Response + Source Citations
 */
export async function runRagPipeline(
  input: RagPipelineInput
): Promise<RagPipelineResult> {
  const { question, documentId } = input;
  const store = getVectorStore();

  // Step 1: Retrieve top 3 most relevant chunks with similarity score
  const filter = documentId ? { documentId } : undefined;
  const retrievedWithScore = await store.similaritySearchWithScore(
    question,
    3,
    filter
  );

  // Step 2: Extract clean source citation metadata for the frontend
  const sources: DocumentSourceChunk[] = retrievedWithScore.map(
    ([doc, score], index) => {
      const meta = doc.metadata || {};
      return {
        documentId: (meta.documentId as string) || "unknown",
        documentName: (meta.fileName as string) || "Document",
        pageNumber: typeof meta.pageNumber === "number" ? meta.pageNumber : undefined,
        chunkIndex: typeof meta.chunkIndex === "number" ? meta.chunkIndex : index,
        content: doc.pageContent,
        score: typeof score === "number" ? Math.max(0, Math.min(1, score)) : undefined,
      };
    }
  );

  // Step 3: Format context string for the prompt
  let contextText = "";
  if (retrievedWithScore.length === 0) {
    contextText = "No relevant context found in uploaded documents.";
  } else {
    contextText = retrievedWithScore
      .map(([doc], i) => {
        const name = doc.metadata?.fileName || "Document";
        const page = doc.metadata?.pageNumber ? ` (Page ${doc.metadata.pageNumber})` : "";
        return `[Source ${i + 1}: ${name}${page}]\n${doc.pageContent}`;
      })
      .join("\n\n---\n\n");
  }

  // Step 4: Prepare the streaming Chat model and invoke the LCEL pipeline
  const chatModel = getChatModel({
    temperature: 0.2,
    streaming: true,
  });

  const ragChain = ragPromptTemplate.pipe(chatModel);

  const stream = await ragChain.stream({
    context: contextText,
    question,
  });

  return {
    stream,
    sources,
  };
}
