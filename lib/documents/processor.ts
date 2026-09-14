import { loadDocumentFromBuffer } from "./loader";
import { splitDocuments } from "./splitter";
import { getVectorStore } from "@/lib/vector-store";
import { DocumentMetadata, IngestionResult } from "@/types";

export interface ProcessDocumentInput {
  buffer: Buffer;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentId?: string;
}

/**
 * End-to-end Document Ingestion Processor:
 * 
 * 1. Loader: Parses raw file buffer (PDF/TXT) into LangChain Document[]
 * 2. Splitter: Splits text into overlapping semantic chunks
 * 3. Embedder & Vector Store: Generates Gemini embeddings and indexes vectors
 * 4. Registry: Records document metadata for the UI catalogue
 */
export async function processDocument(
  input: ProcessDocumentInput
): Promise<IngestionResult> {
  const { buffer, fileName, fileType, fileSize } = input;
  const documentId = input.documentId || `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Step 1: Load text from file buffer
  const loadedDocs = await loadDocumentFromBuffer(buffer, {
    documentId,
    fileName,
    fileType,
  });

  if (loadedDocs.length === 0) {
    throw new Error(`Failed to extract text from "${fileName}".`);
  }

  // Calculate total characters extracted
  const totalCharacters = loadedDocs.reduce(
    (acc, doc) => acc + doc.pageContent.length,
    0
  );

  // Step 2: Split text into semantic chunks
  const chunks = await splitDocuments(loadedDocs, {
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  if (chunks.length === 0) {
    throw new Error(`Document "${fileName}" produced 0 chunks.`);
  }

  // Step 3: Embed and index into the Vector Database
  const vectorStore = getVectorStore();
  await vectorStore.addDocuments(chunks);

  // Step 4: Register document in metadata catalogue
  const metadata: DocumentMetadata = {
    id: documentId,
    name: fileName,
    size: fileSize,
    type: fileType,
    uploadedAt: Date.now(),
    totalChunks: chunks.length,
    totalCharacters,
    status: "ready",
  };

  vectorStore.registerDocument(metadata);

  return {
    document: metadata,
    chunksCount: chunks.length,
  };
}
