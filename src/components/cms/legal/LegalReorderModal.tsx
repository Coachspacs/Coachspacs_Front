"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ArrowUpDown,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Check,
  RotateCcw,
  Shield,
  Database,
  UserCheck,
  Lock,
  Eye,
  FileText,
  CheckCircle2,
  BookOpen,
  Award,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import { LegalSectionData } from "@/types/cms";
import { stripLeadingNumber } from "./legalUtils";

const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  Database,
  UserCheck,
  Lock,
  Eye,
  FileText,
  CheckCircle2,
  BookOpen,
  Award,
  ShieldAlert,
};

interface LegalReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: LegalSectionData[];
  onApply: (reorderedSections: LegalSectionData[]) => void;
  isAr?: boolean;
}

export function LegalReorderModal({
  isOpen,
  onClose,
  sections,
  onApply,
  isAr = true,
}: LegalReorderModalProps) {
  const [items, setItems] = useState<LegalSectionData[]>([]);
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);

  // Initialize or reset internal list when modal opens
  useEffect(() => {
    if (isOpen) {
      setItems([...sections]);
      setActiveDraggingId(null);
    }
  }, [isOpen, sections]);

  if (!isOpen) return null;

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    setItems(newItems);
  };

  const handleReset = () => {
    setItems([...sections]);
  };

  const handleSave = () => {
    onApply(items);
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          dir={isAr ? "rtl" : "ltr"}
          className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#0F5244] border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                <ArrowUpDown className="w-5 h-5 text-[#0F5244]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {isAr ? "إعادة ترتيب وتنظيم البنود" : "Reorder & Organize Clauses"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {isAr
                    ? "اسحب أي بند بالماوس أو الإصبع لتغيير مكانه، أو استخدم الأسهم"
                    : "Drag items to reorder or use quick arrow buttons"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body: Lightweight & Snappy Draggable list */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-2 flex-1">
            <Reorder.Group
              axis="y"
              values={items}
              onReorder={setItems}
              className="space-y-2"
            >
              {items.map((clause, idx) => {
                const itemId = clause.id || `clause-${idx}`;
                const IconComp = (clause.icon && ICON_MAP[clause.icon]) || Shield;
                const titleAr = stripLeadingNumber(clause.title_ar) || "بند بدون عنوان";
                const titleEn = stripLeadingNumber(clause.title_en) || "Untitled Clause";
                const isDraggingThis = activeDraggingId === itemId;

                return (
                  <Reorder.Item
                    key={itemId}
                    value={clause}
                    onDragStart={() => setActiveDraggingId(itemId)}
                    onDragEnd={() => setActiveDraggingId(null)}
                    whileDrag={{
                      scale: 1.02,
                      zIndex: 99999,
                      boxShadow: "0 20px 30px -8px rgba(15, 82, 68, 0.35), 0 8px 12px -4px rgba(0, 0, 0, 0.12)",
                      cursor: "grabbing",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 600,
                      damping: 45,
                      mass: 0.5,
                    }}
                    className={`relative flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl border transition-colors select-none cursor-grab active:cursor-grabbing ${
                      isDraggingThis
                        ? "bg-emerald-50/95 border-[#0F5244] ring-2 ring-[#0F5244]/20 shadow-md"
                        : "bg-white border-slate-200/90 hover:border-emerald-300 hover:bg-slate-50/70 shadow-2xs"
                    }`}
                    style={{ touchAction: "none" }}
                  >
                    {/* Left: Grip handle + Index + Icon + Titles */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Grip Handle */}
                      <div
                        className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                          isDraggingThis ? "text-[#0F5244] bg-emerald-100" : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Number Badge */}
                      <span
                        className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 shadow-2xs transition-colors ${
                          isDraggingThis
                            ? "bg-[#0F5244] text-white border border-[#0F5244]"
                            : "bg-emerald-50 text-[#0F5244] border border-emerald-200/80"
                        }`}
                      >
                        {idx + 1}
                      </span>

                      {/* Icon */}
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 hidden sm:flex">
                        <IconComp className="w-3.5 h-3.5 text-[#0F5244]" />
                      </div>

                      {/* Titles */}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {isAr ? titleAr : titleEn}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {isAr ? titleEn : titleAr}
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Up / Down Arrow buttons */}
                    <div
                      className="flex items-center gap-1 shrink-0"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "up")}
                        disabled={idx === 0}
                        title={isAr ? "تحريك لأعلى" : "Move Up"}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "down")}
                        disabled={idx === items.length - 1}
                        title={isAr ? "تحريك لأسفل" : "Move Down"}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>{isAr ? "إعادة ضبط" : "Reset Order"}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-black transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>{isAr ? "تطبيق الترتيب" : "Apply Order"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
