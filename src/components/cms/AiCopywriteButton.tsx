"use client";

import React, { useState } from "react";
import {
  Sparkles,
  X,
  Check,
  Copy,
  RefreshCw,
  Zap,
  Briefcase,
  Target,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CopywritingTone, CopywritingSuggestion } from "@/services/cms/aiCopywritingService";

interface AiCopywriteButtonProps {
  sectionKey: string;
  fieldType?: "title" | "description" | "badge" | "cta" | "general";
  currentTextAr?: string;
  currentTextEn?: string;
  isAr?: boolean;
  onApply: (suggestion: {
    titleAr?: string;
    titleEn?: string;
    descAr?: string;
    descEn?: string;
  }) => void;
}

export function AiCopywriteButton({
  sectionKey,
  fieldType = "general",
  currentTextAr = "",
  currentTextEn = "",
  isAr = true,
  onApply,
}: AiCopywriteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tone, setTone] = useState<CopywritingTone>("inspiring");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CopywritingSuggestion[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const fetchSuggestions = async (selectedTone = tone) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cms/ai-copywrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionKey,
          fieldType,
          currentTextAr,
          currentTextEn,
          tone: selectedTone,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      console.warn("Failed to generate AI copy:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (suggestions.length === 0) {
      fetchSuggestions(tone);
    }
  };

  const handleToneChange = (newTone: CopywritingTone) => {
    setTone(newTone);
    fetchSuggestions(newTone);
  };

  const handleCopy = (s: CopywritingSuggestion) => {
    const textToCopy = `${s.text_ar}\n${s.text_en}${
      s.description_ar ? `\n\n${s.description_ar}\n${s.description_en}` : ""
    }`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleApply = (s: CopywritingSuggestion) => {
    onApply({
      titleAr: s.text_ar,
      titleEn: s.text_en,
      descAr: s.description_ar,
      descEn: s.description_en,
    });
    setAppliedId(s.id);
    setTimeout(() => {
      setAppliedId(null);
      setIsOpen(false);
    }, 600);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-[#0F5244] border border-emerald-200/90 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
      >
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform animate-pulse" />
        <span>{isAr ? "اقترح صياغة احترافية" : "Suggest Professional Copy"}</span>
      </button>

      {/* Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0F5244] text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-snug">
                      {isAr
                        ? "مولّد النصوص الذكي (AI Copywriting Assistant)"
                        : "AI Copywriting Assistant"}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {isAr
                        ? "صياغات تسويقية احترافية ومقنعة مخصصة للمنصات التعليمية"
                        : "High-converting, bilingual marketing copy for educational leaders"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tone Selection Bar */}
              <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-400 ms-1 me-1">
                    {isAr ? "نبرة المحتوى:" : "Tone:"}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToneChange("inspiring")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tone === "inspiring"
                        ? "bg-[#0F5244] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>{isAr ? "حماسي وملهم" : "Inspiring"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToneChange("professional")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tone === "professional"
                        ? "bg-[#0F5244] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Briefcase className="w-3 h-3" />
                    <span>{isAr ? "مهني موثوق" : "Professional"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToneChange("direct")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tone === "direct"
                        ? "bg-[#0F5244] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Target className="w-3 h-3" />
                    <span>{isAr ? "مباشر وسريع" : "Direct"}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => fetchSuggestions(tone)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-600 hover:text-[#0F5244] hover:bg-emerald-50 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#0F5244]" : ""}`} />
                  <span>{isAr ? "توليد بدائل أخرى" : "Regenerate"}</span>
                </button>
              </div>

              {/* Suggestions List */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                {isLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin" />
                    <p className="text-xs font-bold text-slate-500">
                      {isAr ? "جاري صياغة مقترحات تسويقية مبتكرة..." : "Generating creative suggestions..."}
                    </p>
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    {isAr ? "لا توجد اقتراحات حالية. اضغط على توليد البدائل." : "No suggestions found."}
                  </div>
                ) : (
                  suggestions.map((s, idx) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition-all group"
                    >
                      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                        <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-lg">
                          {isAr ? `الخيار #${idx + 1}` : `Option #${idx + 1}`}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopy(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            {copiedId === s.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>{isAr ? "تم النسخ" : "Copied"}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>{isAr ? "نسخ" : "Copy"}</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApply(s)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                              appliedId === s.id
                                ? "bg-emerald-600 text-white"
                                : "bg-[#0F5244] hover:bg-[#07382E] text-white shadow-xs"
                            }`}
                          >
                            {appliedId === s.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>{isAr ? "تم التطبيق!" : "Applied!"}</span>
                              </>
                            ) : (
                              <>
                                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                                <span>{isAr ? "تطبيق على الحقول" : "Apply to Fields"}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Content Comparison */}
                      <div className="space-y-2.5 text-start">
                        {/* Arabic */}
                        <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                            العربية:
                          </span>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 mb-1 leading-snug">
                            {s.text_ar}
                          </h4>
                          {s.description_ar && (
                            <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
                              {s.description_ar}
                            </p>
                          )}
                        </div>

                        {/* English */}
                        <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                            English:
                          </span>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 mb-1 leading-snug">
                            {s.text_en}
                          </h4>
                          {s.description_en && (
                            <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
                              {s.description_en}
                            </p>
                          )}
                        </div>

                        {/* Marketing Rationale */}
                        <div className="text-[11px] text-slate-400 font-medium px-1 flex items-center gap-1.5">
                          <span className="font-bold text-slate-500">{isAr ? "الهدف التسويقي:" : "Strategic Goal:"}</span>
                          <span>{isAr ? s.rationale_ar : s.rationale_en}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
