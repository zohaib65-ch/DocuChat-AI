"use client";

import { useRef, useEffect } from "react";
import { ChatMessage } from "@/types";
import { ChatMessageItem } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ThinkingIndicator } from "./thinking-indicator";
import { Sparkles} from "lucide-react";

interface ChatContainerProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  hasDocuments: boolean;
  selectedDocumentName?: string;
  onSelectPrompt?: (prompt: string) => void;
}

export function ChatContainer({
  messages,
  isLoading,
  onSendMessage,
  hasDocuments,
  selectedDocumentName,
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
