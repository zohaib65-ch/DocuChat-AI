import { VectorStore } from "@langchain/core/vectorstores";
import { Document, DocumentInterface } from "@langchain/core/documents";
import { EmbeddingsInterface } from "@langchain/core/embeddings";
import { getEmbeddingsModel } from "@/lib/ai/embeddings";
import { DocumentMetadata } from "@/types";
import fs from "node:fs";
import path from "node:path";

export interface StoredEntry {
  id: string;
  vector: number[];
  document: Document;
}

export interface VectorFilter {
  documentId?: string;
  [key: string]: unknown;
}

const PERSISTENCE_FILE = path.resolve(process.cwd(), ".docuchat_store.json");

/**
 * Calculates cosine similarity between two numerical vectors.
 * Cosine similarity = (A · B) / (||A|| * ||B||)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error(
      `Vector dimension mismatch: vector A has ${vecA.length} dims, but vector B has ${vecB.length} dims.`
    );
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i];
    const b = vecB[i];
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * DocuChatVectorStore implements LangChain's standard `VectorStore` interface
 * with lightweight local disk persistence.
 * 
 * Features:
 * - High-speed in-memory vector storage backed by `.docuchat_store.json`.
 * - Survives Next.js server restarts and HMR reloads.
 * - Full LangChain compatibility (extends `VectorStore`, compatible with `asRetriever()`).
 * - Real cosine similarity search with score ranking.
 * - Document-level metadata filtering (e.g., query a single PDF or all documents).
 * - Document registry to track active documents and chunk counts.
 */
export class DocuChatVectorStore extends VectorStore {
  declare FilterType: VectorFilter;
  private entries: StoredEntry[] = [];
  private documentRegistry: Map<string, DocumentMetadata> = new Map();

  constructor(embeddings: EmbeddingsInterface) {
    super(embeddings, {});
    this.loadFromDisk();
  }

  _vectorstoreType(): string {
    return "docuchat_persistent_store";
  }

  /**
   * Loads serialized vectors and document registry from disk if available.
   */
  private loadFromDisk(): void {
    try {
      if (fs.existsSync(PERSISTENCE_FILE)) {
        const raw = fs.readFileSync(PERSISTENCE_FILE, "utf-8");
        const data = JSON.parse(raw);
        if (Array.isArray(data.entries)) {
          this.entries = data.entries.map((e: { id: string; vector: number[]; document: { pageContent: string; metadata: Record<string, unknown> } }) => ({
            id: e.id,
            vector: e.vector,
            document: new Document({
              pageContent: e.document.pageContent,
              metadata: e.document.metadata,
            }),
          }));
        }
        if (Array.isArray(data.registry)) {
          this.documentRegistry = new Map(data.registry);
        }
      }
    } catch {
      // Ignore initial load if file does not exist or format differs
    }
  }

  /**
   * Persists vectors and document registry to disk.
   */
  private saveToDisk(): void {
    try {
      const data = {
        entries: this.entries.map((e) => ({
          id: e.id,
          vector: e.vector,
          document: {
            pageContent: e.document.pageContent,
            metadata: e.document.metadata,
          },
        })),
        registry: Array.from(this.documentRegistry.entries()),
      };
      fs.writeFileSync(PERSISTENCE_FILE, JSON.stringify(data), "utf-8");
    } catch (err) {
      console.warn("Could not save vector store to disk:", err);
    }
  }

  /**
   * Adds precomputed vectors and documents to the vector store.
   */
  async addVectors(
    vectors: number[][],
    documents: DocumentInterface[]
  ): Promise<string[]> {
    const ids: string[] = [];

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const vector = vectors[i];
      const entryId = (doc.metadata?.chunkId as string) || `chunk_${Date.now()}_${i}`;

      this.entries.push({
        id: entryId,
        vector,
        document: new Document({
          pageContent: doc.pageContent,
          metadata: { ...doc.metadata, chunkId: entryId },
        }),
      });

      ids.push(entryId);
    }

    this.saveToDisk();
    return ids;
  }

  /**
   * Embeds documents using the configured embeddings model and saves them.
   */
  async addDocuments(
    documents: DocumentInterface[]
  ): Promise<string[]> {
    if (documents.length === 0) return [];
    const texts = documents.map((doc) => doc.pageContent);
    const vectors = await this.embeddings.embedDocuments(texts);
    return this.addVectors(vectors, documents);
  }

  /**
   * Performs semantic similarity search using a query vector.
   * Returns matching documents sorted by similarity score (descending).
   */
  async similaritySearchVectorWithScore(
    query: number[],
    k = 3,
    filter?: VectorFilter
  ): Promise<[DocumentInterface, number][]> {
    if (this.entries.length === 0) {
      return [];
    }

    // Filter candidate entries if a documentId or custom filter is specified
    const candidates = filter?.documentId
      ? this.entries.filter(
          (entry) => entry.document.metadata?.documentId === filter.documentId
        )
      : this.entries;

    if (candidates.length === 0) {
      return [];
    }

    // Calculate cosine similarity for all candidates
    const scored = candidates.map((entry) => {
      const score = cosineSimilarity(query, entry.vector);
      return [entry.document, score] as [DocumentInterface, number];
    });

    // Sort by highest score first
    scored.sort((a, b) => b[1] - a[1]);

    return scored.slice(0, k);
  }

  /**
   * Registers document metadata in the store's catalogue.
   */
  registerDocument(metadata: DocumentMetadata): void {
    this.documentRegistry.set(metadata.id, metadata);
    this.saveToDisk();
  }

  /**
   * Retrieves the list of all registered documents.
   */
  getDocumentsList(): DocumentMetadata[] {
    return Array.from(this.documentRegistry.values());
  }

  /**
   * Deletes a document and all of its associated vector chunks.
   */
  deleteDocument(documentId: string): boolean {
    this.entries = this.entries.filter(
      (entry) => entry.document.metadata?.documentId !== documentId
    );
    const deleted = this.documentRegistry.delete(documentId);
    this.saveToDisk();
    return deleted;
  }

  /**
   * Total number of stored chunks.
   */
  get totalChunks(): number {
    return this.entries.length;
  }

  /**
   * Clears all stored vectors and registered documents.
   */
  clear(): void {
    this.entries = [];
    this.documentRegistry.clear();
    try {
      if (fs.existsSync(PERSISTENCE_FILE)) {
        fs.unlinkSync(PERSISTENCE_FILE);
      }
    } catch {
      // Ignore
    }
  }
}

// Global singleton across Next.js API calls
const globalForVectorStore = globalThis as unknown as {
  docuChatVectorStore?: DocuChatVectorStore;
};

/**
 * Returns the singleton instance of the DocuChatVectorStore.
 */
export function getVectorStore(): DocuChatVectorStore {
  if (!globalForVectorStore.docuChatVectorStore) {
    const embeddings = getEmbeddingsModel();
    globalForVectorStore.docuChatVectorStore = new DocuChatVectorStore(embeddings);
  }
  return globalForVectorStore.docuChatVectorStore;
}
