import React from "react";
import { DocumentSourceChunk } from "@/types";
import { FileText, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SourceCardProps {
  source: DocumentSourceChunk;
  index: number;
}

export function SourceCard({ source, index }: SourceCardProps) {
  return (
    <div className="rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-3 text-xs transition-all hover:border-blue-400/50 hover:shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200 truncate">
          <FileText className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <span className="truncate" title={source.documentName}>
            {source.documentName}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {source.pageNumber && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              Page {source.pageNumber}
            </Badge>
          )}
          {source.score !== undefined && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-emerald-600 dark:text-emerald-400">
              {Math.round(source.score * 100)}% match
            </Badge>
          )}
        </div>
      </div>
      <p className="text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed font-mono text-[11px] bg-slate-50 dark:bg-slate-950/60 p-2 rounded border border-slate-100 dark:border-slate-800/50">
        "{source.content}"
      </p>
    </div>
  );
}
