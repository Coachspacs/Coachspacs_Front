"use client";

import React, { useState } from "react";
import {
  GripVertical,
  X,
  RotateCcw,
  Check,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  ExternalLink,
  type LucideIcon,
  HelpCircle,
  MessageSquare,
  Compass,
  Award,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { LandingSectionKey, LandingSectionsData, TargetAudienceView } from "@/types/cms";
import { DEFAULT_SECTION_ORDER } from "@/lib/cmsDefaults";

interface SectionMeta {
  key: LandingSectionKey;
  titleAr: string;
  titleEn: string;
  icon: LucideIcon;
  descAr: string;
}

const SECTION_METAS: Record<LandingSectionKey, SectionMeta> = {
  hero: {
    key: "hero",
    titleAr: "قسم البداية (Hero)",
    titleEn: "Hero Section",
    icon: Sparkles,
    descAr: "واجهة الصفحة الرئيسية مع العنوان العريض والصورة والشارات",
  },
  top_categories: {
    key: "top_categories",
    titleAr: "أبرز المجالات والتصنيفات",
    titleEn: "Top Categories",
    icon: Compass,
    descAr: "عرض مسارات التخصص والتصنيفات الأكثر طلباً",
  },
  master_craft: {
    key: "master_craft",
    titleAr: "إتقان المهارات (Master Your Craft)",
    titleEn: "Master Your Craft",
    icon: Award,
    descAr: "مميزات التعلم التطبيقي والمشاريع العملية",
  },
  why_stands_out: {
    key: "why_stands_out",
    titleAr: "لماذا كوتش سبيس؟",
    titleEn: "Why Coach Space Stands Out",
    icon: Layers,
    descAr: "المزايا التنافسية والقيم الفارقة للمنصة",
  },
  real_stories: {
    key: "real_stories",
    titleAr: "قصص النجاح والآراء",
    titleEn: "Real Stories & Reviews",
    icon: MessageSquare,
    descAr: "آراء الطلاب وتقييمات خريجي الدورات",
  },
  faq: {
    key: "faq",
    titleAr: "الأسئلة الشائعة (FAQ)",
    titleEn: "Frequently Asked Questions",
    icon: HelpCircle,
    descAr: "إجابات الأسئلة المتكررة للمتعلمين والمدربين",
  },
  join_future: {
    key: "join_future",
    titleAr: "دعوة التسجيل (Join Future CTA)",
    titleEn: "Call to Action",
    icon: BookOpen,
    descAr: "شريط الدعوة النهائي لبدء التسجيل الفوري",
  },
};

interface SectionReorderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sectionsData: LandingSectionsData;
  isAr?: boolean;
  targetView?: TargetAudienceView;
  onSaveOrder: (newOrder: LandingSectionKey[]) => void;
  onSelectTab?: (tab: LandingSectionKey) => void;
}

export function SectionReorderDrawer({
  isOpen,
  onClose,
  sectionsData,
  isAr = true,
  targetView,
  onSaveOrder,
  onSelectTab,
}: SectionReorderDrawerProps) {
  const initialOrder =
    sectionsData.section_order && sectionsData.section_order.length > 0
      ? sectionsData.section_order
      : DEFAULT_SECTION_ORDER;

  const [order, setOrder] = useState<LandingSectionKey[]>(initialOrder);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync if initialOrder changes externally
  React.useEffect(() => {
    const current =
      sectionsData.section_order && sectionsData.section_order.length > 0
        ? sectionsData.section_order
        : DEFAULT_SECTION_ORDER;
    setOrder(current);
    setHasChanges(false);
  }, [sectionsData.section_order, isOpen]);

  const handleReorder = (newOrder: LandingSectionKey[]) => {
    setOrder(newOrder);
    setHasChanges(true);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newOrder = [...order];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    setOrder(newOrder);
    setHasChanges(true);
  };

  const handleMoveDown = (index: number) => {
    if (index >= order.length - 1) return;
    const newOrder = [...order];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    setOrder(newOrder);
    setHasChanges(true);
  };

  const handleReset = () => {
    setOrder(DEFAULT_SECTION_ORDER);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSaveOrder(order);
    setHasChanges(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0F5244] text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-snug">
                {isAr ? "إعادة ترتيب أقسام الصفحة الرئيسية" : "Reorder Landing Sections"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isAr
                  ? "اسحب وأفلت الأقسام لتغيير ترتيب ظهورها للزوار والطلاب"
                  : "Drag and drop sections to rearrange the homepage sequence"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drag Instructions and Quick Actions */}
        <div className="px-5 py-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            <GripVertical className="w-4 h-4 text-emerald-600" />
            <span>
              {isAr
                ? "اسحب القسم للأعلى أو الأسفل بواسطة المقبض"
                : "Drag items up or down using the handle"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-[#0F5244] font-black underline cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? "استعادة الترتيب الافتراضي" : "Reset Default"}</span>
          </button>
        </div>

        {/* Reorderable List */}
        <div className="p-5 overflow-y-auto space-y-2 flex-1">
          <Reorder.Group axis="y" values={order} onReorder={handleReorder} className="space-y-2.5">
            {order.map((key, index) => {
              const meta = SECTION_METAS[key] || {
                key,
                titleAr: key,
                titleEn: key,
                icon: Layers,
                descAr: "",
              };
              const Icon = meta.icon;
              const sectionData = sectionsData[key] as any;
              const isVisible =
                sectionData?.is_visible !== false &&
                (!targetView ||
                  !Array.isArray(sectionData?.hidden_in_views) ||
                  !sectionData?.hidden_in_views.includes(targetView));

              return (
                <Reorder.Item
                  key={key}
                  value={key}
                  className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 cursor-grab active:cursor-grabbing select-none group"
                >
                  {/* Left: Drag Handle & Rank Badge & Icon */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1 text-slate-300 group-hover:text-slate-500 transition-colors">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-[#0F5244] group-hover:text-white text-slate-700 font-black text-xs flex items-center justify-center shrink-0 transition-colors">
                      {index + 1}
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0F5244] flex items-center justify-center shrink-0 border border-emerald-100">
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 text-start">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">
                          {isAr ? meta.titleAr : meta.titleEn}
                        </span>
                        {isVisible ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                            <Eye className="w-2.5 h-2.5" />
                            <span>{isAr ? "نشط" : "Visible"}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                            <EyeOff className="w-2.5 h-2.5" />
                            <span>{isAr ? "مخفي" : "Hidden"}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {isAr ? meta.descAr : meta.titleEn}
                      </p>
                    </div>
                  </div>

                  {/* Right: Quick Up/Down buttons + Jump to tab */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveUp(index);
                      }}
                      disabled={index === 0}
                      aria-label="Move Up"
                      className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveDown(index);
                      }}
                      disabled={index === order.length - 1}
                      aria-label="Move Down"
                      className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {onSelectTab && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTab(key);
                          onClose();
                        }}
                        title={isAr ? "تعديل هذا القسم الآن" : "Edit Section"}
                        className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#0F5244] flex items-center justify-center transition-colors cursor-pointer border border-emerald-200 ms-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {hasChanges
              ? isAr
                ? "تم تغيير الترتيب، اضغط حفظ لتطبيق الترتيب الجديد."
                : "Sequence modified. Click save to apply."
              : isAr
              ? "الترتيب الحالي محفوظ."
              : "Current sequence is synchronized."}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white cursor-pointer transition-colors"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-black shadow-xs hover:shadow-sm cursor-pointer transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isAr ? "حفظ الترتيب" : "Save Sequence"}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
