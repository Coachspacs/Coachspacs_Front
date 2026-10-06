"use client";

import React from "react";
import {
  Keyboard,
  X,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: any;
}

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
  t,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-xl select-none">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[var(--color-primary-main)]" />
            <h3 className="text-sm font-bold text-slate-900">
              {t("keyboardShortcuts")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {[
            { keyNode: <span>Space / K</span>, desc: t("shortcutPlayPause") },
            {
              keyNode: (
                <span className="inline-flex items-center gap-1">
                  <ArrowLeft size={10} className="inline" /> / <ArrowRight size={10} className="inline" />
                </span>
              ),
              desc: t("shortcutSeek5"),
            },
            { keyNode: <span>J / L</span>, desc: t("shortcutSeek10") },
            {
              keyNode: (
                <span className="inline-flex items-center gap-1">
                  <ArrowUp size={10} className="inline" /> / <ArrowDown size={10} className="inline" />
                </span>
              ),
              desc: t("shortcutVolume"),
            },
            { keyNode: <span>M</span>, desc: t("shortcutMute") },
            { keyNode: <span>0 - 9</span>, desc: t("shortcutJump") },
            { keyNode: <span>F</span>, desc: t("shortcutFullscreen") },
            { keyNode: <span>Double Click</span>, desc: t("shortcutDoubleClick") },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100 text-xs"
            >
              <span className="font-medium text-slate-700">{item.desc}</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 text-[var(--color-primary-main)] font-mono text-[10px] font-bold shadow-xs">
                {item.keyNode}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-brand-dark hover:bg-[#07382E] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
