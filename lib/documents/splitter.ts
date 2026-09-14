import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export interface SplitterOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

/**
 * Splits LangChain Documents into smaller, semantic chunks using RecursiveCharacterTextSplitter.
 * 
 * Why chunking is necessary:
 * 1. Semantic Precision: A 50-page document cannot be represented by a single vector;
 *    specific answers reside in specific paragraphs.
 * 2. LLM Context Window: Providing only the most relevant 3-5 chunks prevents prompt
 *    bloat and reduces hallucinations.
 * 3. Chunk Overlap: Preserves continuity across boundaries so sentences aren't chopped in half.
 */
export async function splitDocuments(
  documents: Document[],
  options?: SplitterOptions
): Promise<Document[]> {
  const chunkSize = options?.chunkSize ?? 1000;
  const chunkOverlap = options?.chunkOverlap ?? 200;

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: ["\n\n", "\n", ". ", " ", ""],
  });

  const rawChunks = await splitter.splitDocuments(documents);

  // Enrich each chunk with unique index and metadata
  return rawChunks.map((chunk, index) => {
    return new Document({
      pageContent: chunk.pageContent,
      metadata: {
        ...chunk.metadata,
        chunkIndex: index,
      },
    });
  });
}
