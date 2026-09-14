import { Document } from "@langchain/core/documents";
import { extractText } from "unpdf";

export interface LoaderOptions {
  documentId: string;
  fileName: string;
  fileType: string;
}

/**
 * Parses raw file buffers (PDF, TXT, MD, CSV) into standardized LangChain Document objects.
 * 
 * Uses `unpdf` for universal, worker-free, cross-runtime PDF parsing.
 * Supports page-by-page text extraction with precise page numbering metadata.
 */
export async function loadDocumentFromBuffer(
  buffer: Buffer,
  options: LoaderOptions
): Promise<Document[]> {
  const { documentId, fileName, fileType } = options;

  if (fileType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
    return loadPdfDocument(buffer, options);
  }

  // Text, Markdown, CSV formats
  const text = buffer.toString("utf-8");
  if (!text.trim()) {
    throw new Error(`The uploaded file "${fileName}" appears to be empty.`);
  }

  return [
    new Document({
      pageContent: text,
      metadata: {
        documentId,
        fileName,
        fileType,
        pageNumber: 1,
        totalPages: 1,
      },
    }),
  ];
}

/**
 * Extracts text from a PDF buffer page-by-page using unpdf.
 * Never requires pdf.worker.mjs or external canvas binaries.
 */
async function loadPdfDocument(
  buffer: Buffer,
  options: LoaderOptions
): Promise<Document[]> {
  const { documentId, fileName, fileType } = options;

  try {
    const uint8Array = new Uint8Array(buffer);
    const { text: pages, totalPages } = await extractText(uint8Array, {
      mergePages: false,
    });

    if (!pages || pages.length === 0 || pages.every((p) => !p || !p.trim())) {
      throw new Error(
        `Could not extract text from "${fileName}". The PDF may be scanned, image-only, or empty.`
      );
    }

    const documents: Document[] = [];

    pages.forEach((pageText, idx) => {
      const trimmed = (pageText || "").trim();
      if (trimmed.length > 0) {
        documents.push(
          new Document({
            pageContent: trimmed,
            metadata: {
              documentId,
              fileName,
              fileType,
              pageNumber: idx + 1,
              totalPages: totalPages || pages.length,
            },
          })
        );
      }
    });

    if (documents.length === 0) {
      throw new Error(`No readable text found in "${fileName}".`);
    }

    return documents;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`PDF Parsing Error in "${fileName}": ${error.message}`);
    }
    throw new Error(`Failed to parse PDF document "${fileName}".`);
  }
}
