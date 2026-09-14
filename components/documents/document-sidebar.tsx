"use client";

import React from "react";
import { DocumentMetadata } from "@/types";
import { DocumentUpload } from "./document-upload";
import { DocumentList } from "./document-list";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Sparkles, Database, Bot, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DocumentSidebarProps {
  documents: DocumentMetadata[];
  selectedDocumentId: string | null;
  onSelectDocument: (id: string | null) => void;
  onUploadDocument: (file: File) => Promise<void>;
  onDeleteDocument: (id: string) => void;
  onNewChat: () => void;
  isUploading: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function DocumentSidebar({
  documents,
  selectedDocumentId,
  onSelectDocument,
  onUploadDocument,
  onDeleteDocument,
  onNewChat,
  isUploading,
  isOpenMobile = false,
  onCloseMobile,
}: DocumentSidebarProps) {
  const totalChunks = documents.reduce((acc, doc) => acc + doc.totalChunks, 0);

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-80 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xs text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight">
                  DocuChat AI
                </span>
              </div>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 space-y-3">
          <Button
            onClick={onNewChat}
            variant="outline"
            className="w-full justify-start gap-2 border-slate-200 dark:border-slate-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:text-blue-600 hover:border-blue-300 font-medium text-xs h-9"
          >
            <Plus className="h-4 w-4 text-blue-600" />
            <span>New Conversation</span>
          </Button>

          {/* Document Upload Area */}
          <DocumentUpload onUpload={onUploadDocument} isUploading={isUploading} />
        </div>

        <Separator className="opacity-50" />

        {/* Scrollable Document List */}
        <div className="flex-1 overflow-y-auto p-4">
          <DocumentList
            documents={documents}
            selectedDocumentId={selectedDocumentId}
            onSelectDocument={(id) => {
              onSelectDocument(id);
              if (onCloseMobile) onCloseMobile();
            }}
            onDeleteDocument={onDeleteDocument}
          />
        </div>

      </aside>
    </>
  );
}
