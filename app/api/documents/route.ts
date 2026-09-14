import { NextRequest, NextResponse } from "next/server";
import { processDocument } from "@/lib/documents/processor";
import { getVectorStore } from "@/lib/vector-store";

export const dynamic = "force-dynamic";

/**
 * POST /api/documents
 * Receives an uploaded PDF or text file, extracts text, chunks it,
 * generates embeddings, and indexes it into the vector store.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided in request." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await processDocument({
      buffer,
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      fileSize: file.size,
    });

    return NextResponse.json({
      success: true,
      document: result.document,
      chunksCount: result.chunksCount,
    });
  } catch (error: unknown) {
    console.error("Document ingestion error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process document.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * GET /api/documents
 * Returns the list of all currently indexed documents and vector chunk stats.
 */
export async function GET() {
  try {
    const store = getVectorStore();
    const documents = store.getDocumentsList();
    return NextResponse.json({
      documents,
      totalChunks: store.totalChunks,
    });
  } catch (error: unknown) {
    console.error("Failed to list documents:", error);
    return NextResponse.json(
      { error: "Failed to retrieve documents." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents?id=...
 * Deletes a document and all of its vector embeddings from the vector store.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("id");

    if (!documentId) {
      return NextResponse.json(
        { error: "Missing document id parameter." },
        { status: 400 }
      );
    }

    const store = getVectorStore();
    const deleted = store.deleteDocument(documentId);

    return NextResponse.json({
      success: deleted,
      message: deleted
        ? "Document and vectors deleted successfully."
        : "Document not found.",
    });
  } catch (error: unknown) {
    console.error("Failed to delete document:", error);
    return NextResponse.json(
      { error: "Failed to delete document." },
      { status: 500 }
    );
  }
}
