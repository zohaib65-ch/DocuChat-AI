"use client";

import React from "react";
import { DocumentMetadata } from "@/types";
import { FileText, Trash2, CheckCircle2, AlertTriangle, Clock, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DocumentListProps {
  documents: DocumentMetadata[];
  selectedDocumentId: string | null;
  onSelectDocument: (id: string | null) => void;
  onDeleteDocument: (id: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentList({
  documents,
  selectedDocumentId,
  onSelectDocument,
  onDeleteDocument,
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20">
        <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-2">
          <FileText className="h-5 w-5" />
        </div>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          No documents added yet
        </p>
        <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
          Uploaded PDFs will appear here with chunk statistics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Option to query all documents */}
      <div
        onClick={() => onSelectDocument(null)}
        className={cn(
          "flex items-center justify-between p-2.5 rounded-lg text-xs font-medium cursor-pointer transition-all border",
          selectedDocumentId === null
            ? "border-blue-500/50 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-2xs"
            : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
        )}
      >
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-600 shrink-0" />
          <span>Search across all documents</span>
        </div>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
          {documents.length}
        </Badge>
      </div>

      <div className="pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
        Uploaded Files ({documents.length})
      </div>

      {documents.map((doc) => {
        const isSelected = selectedDocumentId === doc.id;
        return (
          <div
            key={doc.id}
            onClick={() => onSelectDocument(doc.id)}
            className={cn(
              "group relative flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all",
              isSelected
                ? "border-blue-500/80 bg-blue-50/50 dark:bg-blue-950/30 shadow-2xs"
                : "border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
            )}
          >
            <div className="flex items-start gap-2.5 min-w-0 pr-2">
              <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-800 dark:text-slate-200 truncate" title={doc.name}>
                  {doc.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                  <span>{formatFileSize(doc.size)}</span>
                  <span>•</span>
                  <span>{doc.totalChunks} chunks</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {doc.status === "ready" && (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              )}
              {doc.status === "processing" && (
                <Clock className="h-3.5 w-3.5 text-amber-500 animate-spin shrink-0" />
              )}
              {doc.status === "error" && (
                <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDocument(doc.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 text-slate-400 transition-all ml-1 cursor-pointer"
                title="Delete document"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
