"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileUp, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadProgress?: number;
}

export function DocumentUpload({
  onUpload,
  isUploading,
  uploadProgress = 0,
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setError(null);

    // Validate file type
    const validTypes = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "text/csv",
    ];
    const isExtensionValid = /\.(pdf|txt|md|csv)$/i.test(file.name);

    if (!validTypes.includes(file.type) && !isExtensionValid) {
      setError("Please upload a PDF, TXT, or MD document.");
      return;
    }

    // Limit to 20MB for local uploads
    if (file.size > 20 * 1024 * 1024) {
      setError("File size exceeds 20MB limit.");
      return;
    }

    try {
      await onUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to process document");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.md,.csv"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {/* Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
            : "border-slate-200 dark:border-slate-800 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-900/40"
        } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
      >
        {isUploading ? (
          <div className="w-full py-2 flex flex-col items-center space-y-2 text-center">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Chunking & generating embeddings...
            </span>
            <Progress value={uploadProgress || 65} className="w-4/5 h-1.5" />
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-1.5">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Click to upload or drag & drop
              </p>
              <p className="text-[11px] text-slate-400">
                PDF, TXT, or MD (up to 20MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2 rounded-lg border border-red-200 dark:border-red-900/50">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
