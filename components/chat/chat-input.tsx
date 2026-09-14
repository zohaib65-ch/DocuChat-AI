"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, CornerDownLeft, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  hasDocuments?: boolean;
}

export function ChatInput({
  onSendMessage,
  isLoading,
  placeholder = "Ask a question (English, Roman Urdu, اردو)...",
  hasDocuments = false,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    onSendMessage(input.trim());
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-adjust height up to 160px
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4">
      <form
        onSubmit={handleSubmit}
        className="relative max-w-4xl mx-auto flex items-end gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all shadow-xs"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={hasDocuments ? placeholder : "Upload a document first to start chatting..."}
          rows={1}
          disabled={isLoading}
          className="w-full resize-none bg-transparent px-3 py-2 text-sm focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-50 min-h-[40px] max-h-[160px]"
        />

        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
          className="h-9 w-9 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-30 transition-all"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </Button>
      </form>
      <div className="max-w-4xl mx-auto mt-2 flex items-center justify-end text-[11px] text-slate-400 px-2">
        
        <span>
          Press <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">Enter</kbd> to send, <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">Shift + Enter</kbd> for newline
        </span>
      </div>
    </div>
  );
}
