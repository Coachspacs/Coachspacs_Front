"use client";

import React from "react";
import {
  ChevronDown,
  Copy,
  Trash2,
  AlertCircle,
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
import { AnimatePresence, motion } from "framer-motion";
import { LegalSectionData } from "@/types/cms";
import { LegalRichTextEditor } from "./LegalRichTextEditor";
import { stripLeadingNumber } from "./legalUtils";

export const LEGAL_ICON_OPTIONS = [
  { id: "Shield", label: "درع (Shield)", icon: Shield },
  { id: "Database", label: "قاعدة بيانات (Database)", icon: Database },
  { id: "UserCheck", label: "مستخدم موثق (UserCheck)", icon: UserCheck },
  { id: "Lock", label: "قفل وأمان (Lock)", icon: Lock },
  { id: "Eye", label: "عين وخصوصية (Eye)", icon: Eye },
  { id: "FileText", label: "مستند (FileText)", icon: FileText },
  { id: "CheckCircle2", label: "علامة تحقق (CheckCircle)", icon: CheckCircle2 },
  { id: "BookOpen", label: "كتاب وترخيص (BookOpen)", icon: BookOpen },
  { id: "Award", label: "شهادة وتقدير (Award)", icon: Award },
  { id: "ShieldAlert", label: "تنبيه وقواعد (ShieldAlert)", icon: ShieldAlert },
];

export const LEGAL_ICON_MAP: Record<string, LucideIcon> = {
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

interface LegalClauseCardProps {
  clause: LegalSectionData;
  index: number;
  totalClauses: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (field: keyof LegalSectionData, value: string) => void;
  onDuplicate: () => void;
  onDeleteRequest: () => void;
  isAr?: boolean;
  hasErrors?: boolean;
}

export function LegalClauseCard({
  clause,
  index,
  totalClauses: _totalClauses,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDuplicate,
  onDeleteRequest,
  isAr = true,
  hasErrors = false,
}: LegalClauseCardProps) {
  const IconComp = (clause.icon && LEGAL_ICON_MAP[clause.icon]) || Shield;

  const displayTitleAr = stripLeadingNumber(clause.title_ar);
  const displayTitleEn = stripLeadingNumber(clause.title_en);

  const isArTitleEmpty = !clause.title_ar?.trim();
  const isEnTitleEmpty = !clause.title_en?.trim();
  const isArBodyEmpty = !clause.content_ar?.trim();
  const isEnBodyEmpty = !clause.content_en?.trim();

  const hasMissingAr = isArTitleEmpty || isArBodyEmpty;
  const hasMissingEn = isEnTitleEmpty || isEnBodyEmpty;

  const handleTitleArChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const stripped = stripLeadingNumber(rawVal);
    onUpdate("title_ar", stripped);
  };

  const handleTitleEnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const stripped = stripLeadingNumber(rawVal);
    onUpdate("title_en", stripped);
  };

  return (
    <div
      className={`rounded-3xl border transition-all duration-200 bg-white shadow-2xs overflow-hidden ${
        hasErrors
          ? "border-rose-300 ring-2 ring-rose-200/50"
          : isExpanded
          ? "border-[#0F5244]/40 ring-2 ring-[#0F5244]/5"
          : "border-slate-200/90 hover:border-slate-300"
      }`}
    >
      {/* Clause Header / Summary Row (Collapsible Trigger) */}
      <div
        dir={isAr ? "rtl" : "ltr"}
        className={`flex items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer select-none transition-colors ${
          isExpanded ? "bg-slate-50/70 border-b border-slate-100" : "hover:bg-slate-50/50"
        }`}
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Auto-Number Badge */}
          <span
            className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0F5244] border border-emerald-200/80 font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-2xs"
            title={`Clause #${index + 1}`}
          >
            {index + 1}
          </span>

          {/* Icon Badge */}
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60 hidden sm:flex">
            <IconComp className="w-4 h-4 text-[#0F5244]" />
          </div>

          {/* Titles in Collapsed Mode */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                {displayTitleAr || displayTitleEn || (isAr ? "بند جديد بدون عنوان" : "Untitled Clause")}
              </span>
              {displayTitleAr && displayTitleEn && (
                <span className="text-slate-400 text-xs hidden md:inline truncate max-w-xs">
                  • {displayTitleEn}
                </span>
              )}
            </div>

            {/* Validation warning badges if any language is missing */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {hasMissingAr && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800">
                  <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                  <span>{isAr ? "العربية غير مكتملة" : "Arabic Incomplete"}</span>
                </span>
              )}
              {hasMissingEn && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800">
                  <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                  <span>{isAr ? "الإنجليزية غير مكتملة" : "English Incomplete"}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Duplicate Button */}
          <button
            type="button"
            onClick={onDuplicate}
            title={isAr ? "تكرار هذا البند" : "Duplicate Clause"}
            className="p-2 rounded-xl text-slate-500 hover:text-[#0F5244] hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={onDeleteRequest}
            title={isAr ? "حذف هذا البند" : "Delete Clause"}
            className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Expand/Collapse Chevron Button */}
          <button
            type="button"
            onClick={onToggleExpand}
            aria-expanded={isExpanded}
            title={isExpanded ? (isAr ? "طي" : "Collapse") : (isAr ? "توسيع" : "Expand")}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? "rotate-180 text-[#0F5244]" : "rotate-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Animated Expanded Details Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="clause-expanded-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-6 space-y-5 bg-white border-t border-slate-100">
              {/* Icon Selection & Guidance */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white text-[#0F5244] flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {isAr ? "أيقونة البند القانوني" : "Clause Icon"}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {isAr ? "اختر الأيقونة الدالة على محتوى وطبيعة هذا البند" : "Visual icon displayed beside the clause title"}
                    </span>
                  </div>
                </div>

                <select
                  value={clause.icon || "Shield"}
                  onChange={(e) => onUpdate("icon", e.target.value)}
                  className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#0F5244] cursor-pointer shadow-2xs"
                >
                  {LEGAL_ICON_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Titles (AR & EN) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-right">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <span>{isAr ? "عنوان البند (عربي)" : "Clause Title (Arabic)"}</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200/60 leading-none">
                      {isAr ? "الترقيم تلقائي" : "Auto-numbered"}
                    </span>
                  </div>
                  <input
                    type="text"
                    dir="rtl"
                    value={displayTitleAr}
                    onChange={handleTitleArChange}
                    placeholder="مثال: جمع البيانات واستخدامها"
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-bold ${
                      isArTitleEmpty ? "border-amber-300 bg-amber-50/20" : "border-slate-200/90"
                    }`}
                  />
                  <p className="text-[10px] text-slate-400">
                    {isAr ? "لا داعي لكتابة رقم البند (سيتم توليده تلقائياً كشارة)" : "Leading numbers are stripped and auto-generated as a badge"}
                  </p>
                </div>

                <div className="space-y-1.5 text-left">
                  <div className="flex items-center gap-2" dir="ltr">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <span>Clause Title (English)</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200/60 leading-none">
                      Auto-numbered
                    </span>
                  </div>
                  <input
                    type="text"
                    dir="ltr"
                    value={displayTitleEn}
                    onChange={handleTitleEnChange}
                    placeholder="e.g. Data Collection & Usage"
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-bold ${
                      isEnTitleEmpty ? "border-amber-300 bg-amber-50/20" : "border-slate-200/90"
                    }`}
                  />
                  <p className="text-[10px] text-slate-400">
                    Numbers are generated automatically based on clause position
                  </p>
                </div>
              </div>

              {/* Rich Text Bodies (AR & EN) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Arabic Rich Body */}
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-900 block">
                    {isAr ? "نص وتفاصيل البند (عربي)" : "Clause Body (Arabic)"}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <LegalRichTextEditor
                    dir="rtl"
                    value={clause.content_ar || ""}
                    onChange={(html) => onUpdate("content_ar", html)}
                    placeholder="اكتب تفاصيل وبنود السياسة هنا..."
                    className={isArBodyEmpty ? "border-amber-300" : ""}
                  />
                  <p className="text-[10px] text-slate-400">
                    {isAr ? "يدعم التنسيق الغامق، المائل، القوائم النقطية والرقمية، والروابط" : "Supports bold, italic, bullet/numbered lists, and links"}
                  </p>
                </div>

                {/* English Rich Body */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-900 block" dir="ltr">
                    Clause Body (English) <span className="text-rose-500">*</span>
                  </label>
                  <LegalRichTextEditor
                    dir="ltr"
                    value={clause.content_en || ""}
                    onChange={(html) => onUpdate("content_en", html)}
                    placeholder="Write clause content, rules, and policy terms here..."
                    className={isEnBodyEmpty ? "border-amber-300" : ""}
                  />
                  <p className="text-[10px] text-slate-400">
                    RTL/LTR aware rich formatting with auto-growing height
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
