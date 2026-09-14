"use client";

import React, { useState, useEffect } from "react";
import { Bot, Sparkles, Search, Brain, Zap } from "lucide-react";

const THINKING_STEPS = [
  { icon: Search, label: "Scanning document chunks..." },
  { icon: Zap, label: "Evaluating semantic similarity..." },
  { icon: Brain, label: "Synthesizing answer with Gemini..." },
];

export function ThinkingIndicator() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % THINKING_STEPS.length);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  const currentStep = THINKING_STEPS[stepIndex];
  const StepIcon = currentStep.icon;

  return (
    <div className="flex w-full gap-3 py-4 px-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 animate-in fade-in duration-200">
      {/* Animated Glowing Bot Avatar */}
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-blue-500/20">
        <Bot className="h-4 w-4 animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
        </span>
      </div>

      {/* Content Area with Dynamic Thinking Status and Skeleton Shimmer */}
      <div className="flex-1 space-y-3">
        {/* Step Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            DocuChat Assistant
          </span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 transition-all duration-300">
            <StepIcon className="h-3 w-3 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="animate-fade">{currentStep.label}</span>
          </div>
        </div>

        {/* Shimmer Skeleton Lines */}
        <div className="space-y-2 pt-1 max-w-lg">
          <div className="h-2.5 w-4/5 rounded-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 animate-pulse" />
          <div className="h-2.5 w-3/5 rounded-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 animate-pulse [animation-delay:200ms]" />
          <div className="h-2.5 w-2/5 rounded-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 animate-pulse [animation-delay:400ms]" />
        </div>
      </div>
    </div>
  );
}
