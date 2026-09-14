"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  onConfirm?: () => void;
  confirmVariant?: "default" | "destructive";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmText,
  onConfirm,
  confirmVariant = "default",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {description}
            </p>
          )}
        </div>

        {children && <div className="py-2 text-sm">{children}</div>}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          {confirmText && onConfirm && (
            <Button
              variant={confirmVariant}
              size="sm"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="text-xs"
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
