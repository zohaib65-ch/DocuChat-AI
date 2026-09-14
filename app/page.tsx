"use client";

import React, { useState, useEffect } from "react";
import { DocumentMetadata, ChatMessage, DocumentSourceChunk } from "@/types";
import { DocumentSidebar } from "@/components/documents/document-sidebar";
import { ChatContainer } from "@/components/chat/chat-container";
import { Menu, Layers, Sparkles, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";

export default function Home() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Load existing documents from vector store on mount
  useEffect(() => {
    async function loadDocuments() {
      try {
        const res = await fetch("/api/documents");
        if (res.ok) {
          const data = await res.json();
          if (data.documents && Array.isArray(data.documents)) {
            setDocuments(data.documents);
          }
        }
      } catch (err) {
        console.error("Failed to load existing documents:", err);
      }
    }
    loadDocuments();
  }, []);

  // Find currently selected document metadata
  const selectedDoc = documents.find((doc) => doc.id === selectedDocumentId);

  // Reset conversation to fresh state
  const handleNewChat = () => {
    setMessages([]);
    toast.info("Conversation cleared", {
      description: "Ready for your next question.",
    });
  };

  // Upload and process a document
  const handleUploadDocument = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process document");
      }

      const newDoc: DocumentMetadata = data.document;
      setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
      setSelectedDocumentId(newDoc.id);

      toast.success(`"${newDoc.name}" uploaded successfully!`, {
        description: `Split into ${newDoc.totalChunks} chunks and indexed for Q&A.`,
      });

      // Add a helpful assistant notification
      const notifyMessage: ChatMessage = {
        id: `msg_${Date.now()}_system`,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, notifyMessage]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Upload error";
      toast.error("Upload Failed", {
        description: errorMsg,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Delete document
  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const deletedDoc = documents.find((d) => d.id === id);
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        if (selectedDocumentId === id) {
          setSelectedDocumentId(null);
        }
        toast.info(`Deleted "${deletedDoc?.name || "Document"}"`, {
          description: "Removed from library and vector store.",
        });
      }
    } catch  {
      toast.error("Failed to delete document");
    }
  };

  // Send message and stream the RAG response
  const handleSendMessage = async (text: string) => {
    if (isLoading) return;

    const userMessageId = `msg_${Date.now()}_user`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const assistantMessageId = `msg_${Date.now() + 1}_assistant`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: Date.now() + 1,
      isStreaming: true,
      sources: [],
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          documentId: selectedDocumentId || undefined,
          history: messages.slice(-6).map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) {
        throw new Error("No response body received for stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedText = "";
      let retrievedSources: DocumentSourceChunk[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6);
            try {
              const event = JSON.parse(dataStr);

              if (event.type === "sources") {
                retrievedSources = event.data;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, sources: retrievedSources }
                      : msg
                  )
                );
              } else if (event.type === "token") {
                streamedText += event.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: streamedText }
                      : msg
                  )
                );
              } else if (event.type === "error") {
                streamedText += `\n\n⚠️ ${event.message}`;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: streamedText, isStreaming: false }
                      : msg
                  )
                );
              } else if (event.type === "done") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, isStreaming: false }
                      : msg
                  )
                );
              }
            } catch {
              // Ignore partial JSON parsing glitches during streaming
            }
          }
        }
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Error generating answer";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: `⚠️ **Error**: ${errorMsg}`,
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Left Sidebar */}
      <DocumentSidebar
        documents={documents}
        selectedDocumentId={selectedDocumentId}
        onSelectDocument={setSelectedDocumentId}
        onUploadDocument={handleUploadDocument}
        onDeleteDocument={handleDeleteDocument}
        onNewChat={handleNewChat}
        isUploading={isUploading}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-14 items-center justify-between px-4 md:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden cursor-pointer"
              title="Open document menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Scope Indicator */}
            <div className="flex items-center gap-2 truncate">
              {selectedDoc ? (
                <>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {selectedDoc.name}
                  </span>
                  <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">
                    {selectedDoc.totalChunks} chunks
                  </Badge>
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                  <Layers className="h-3.5 w-3.5 text-blue-600" />
                  <span>Searching All Documents</span>
                  {documents.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                      {documents.length} files
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewChat}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 h-8 gap-1.5"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Clear Chat</span>
              </Button>
            )}
          </div>
        </header>

        {/* Chat Body & Input Container */}
        <div className="flex-1 overflow-hidden relative">
          <ChatContainer
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            hasDocuments={documents.length > 0}
            selectedDocumentName={selectedDoc?.name}
          />
        </div>
      </main>
    </div>
  );
}
