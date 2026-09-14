"use client";

import React, { useState } from "react";
import { ChatMessage as ChatMessageType } from "@/types";
import { Bot, User, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { ThinkingIndicator } from "./thinking-indicator";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessageItem({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  // If assistant is preparing the response and no tokens have arrived yet, show the thinking indicator
  if (!isUser && message.isStreaming && !message.content.trim()) {
    return <ThinkingIndicator />;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "group flex w-full gap-3 py-4 px-4 rounded-xl transition-colors",
        isUser
          ? "bg-slate-100/70 dark:bg-slate-800/40"
          : "bg-transparent hover:bg-slate-50/50 dark:hover:bg-slate-900/40"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg text-sm font-semibold shadow-xs",
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gradient-to-br from-indigo-600 to-blue-600 text-white"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isUser ? "You" : "DocuChat Assistant"}
          </span>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
              title="Copy message"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
            <span className="text-[10px] text-slate-400">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Formatted Markdown Content */}
        {isUser ? (
          <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
            {message.content}
          </div>
        ) : (
          <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 break-words space-y-1">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-base font-bold mt-3 mb-1.5 text-slate-900 dark:text-slate-100">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-sm font-bold mt-2.5 mb-1 text-slate-900 dark:text-slate-100">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xs font-bold uppercase tracking-wide mt-2.5 mb-1 text-blue-600 dark:text-blue-400">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="my-1 leading-relaxed text-slate-800 dark:text-slate-200">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="my-1.5 space-y-1 list-disc list-inside pl-1 text-slate-700 dark:text-slate-300">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-1.5 space-y-1 list-decimal list-inside pl-1 text-slate-700 dark:text-slate-300">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-slate-900 dark:text-slate-100">
                    {children}
                  </strong>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-700 font-medium"
                  >
                    {children}
                  </a>
                ),
                code: ({ children }) => (
                  <code className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-blue-600 dark:text-blue-400">
                    {children}
                  </code>
                ),
                hr: () => (
                  <hr className="my-2 border-slate-200 dark:border-slate-800" />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
            {message.isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-blue-600 animate-pulse align-middle" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
