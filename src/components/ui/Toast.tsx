"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
  message: string | null;
  type?: ToastType;
  onClose?: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "success",
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 max-w-sm w-full pointer-events-auto select-none"
        >
          <div
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all ${
              type === "success"
                ? "bg-slate-900/95 border-emerald-500/30 text-white"
                : type === "error"
                ? "bg-rose-950/95 border-rose-500/30 text-white"
                : "bg-slate-900/95 border-slate-700 text-white"
            }`}
          >
            <div className="shrink-0">
              {type === "success" && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              {type === "error" && (
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              {type === "info" && (
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-100 leading-snug">
                {message}
              </p>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;
