"use client";

import React, { useRef, useEffect } from "react";
import { ChatMessage } from "@/types";
import { ChatMessageItem } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ThinkingIndicator } from "./thinking-indicator";
import { Sparkles, FileText, HelpCircle, ArrowRight, ShieldCheck, Zap } from "lucide-react";

interface ChatContainerProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  hasDocuments: boolean;
  selectedDocumentName?: string;
  onSelectPrompt?: (prompt: string) => void;
}

const STARTER_PROMPTS = [
  "What are the main topics discussed in this document?",
  "Give me a bullet-point executive summary.",
  "What key findings or metrics are highlighted?",
  "Are there any deadlines or action items mentioned?",
];

export function ChatContainer({
  messages,
  isLoading,
  onSendMessage,
  hasDocuments,
  selectedDocumentName,
  onSelectPrompt,
}: ChatContainerProps) {
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            /* Empty State / Welcome Screen */
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20 mb-6">
                <Sparkles className="h-8 w-8 text-white" />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Welcome to DocuChat AI
              </h2>
              <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                Upload your PDFs and documents to the sidebar, then ask questions to get instant answers backed by citations and retrieved source text.
              </p>

             

              {/* Starter Question Chips */}
              <div className="mt-8 w-full max-w-lg">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  {hasDocuments ? "Try asking a question:" : "Sample questions you can ask once documents are uploaded:"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {STARTER_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (hasDocuments) {
                          onSendMessage(prompt);
                        } else if (onSelectPrompt) {
                          onSelectPrompt(prompt);
                        }
                      }}
                      className="group flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                    >
                      <span className="line-clamp-2 pr-2">{prompt}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-blue-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active Messages List */
            <>
              {messages.map((message) => (
                <ChatMessageItem key={message.id} message={message} />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <ThinkingIndicator />
              )}
            </>
          )}
          <div ref={scrollEndRef} />
        </div>
      </div>

      {/* Chat Input Bar */}
      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        hasDocuments={hasDocuments}
        placeholder={
          selectedDocumentName
            ? `Ask about ${selectedDocumentName}...`
            : "Ask a question about your documents..."
        }
      />
    </div>
  );
}
