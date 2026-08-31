"use client";

import React, { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  ImageIcon,
  FolderTree,
  FileVideo,
  PlaySquare,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
} from "lucide-react";

export interface IncompleteItem {
  id: "cover" | "sections" | "lessons" | "videos";
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
  descriptionEn: string;
  isComplete: boolean;
}

export interface CourseIncompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle?: string;
  missingItems?: IncompleteItem[];
  onAction?: () => void;
}

export function CourseIncompleteModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  missingItems = [],
  onAction,
}: CourseIncompleteModalProps) {
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const t = useTranslations("courseIncompleteModal");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const defaultChecklist: IncompleteItem[] = [
    {
      id: "cover",
      labelAr: t("coverLabel"),
      labelEn: t("coverLabel"),
      descriptionAr: t("coverDesc"),
      descriptionEn: t("coverDesc"),
      isComplete: !missingItems.some((m) => m.id === "cover" && !m.isComplete),
    },
    {
      id: "sections",
      labelAr: t("sectionsLabel"),
      labelEn: t("sectionsLabel"),
      descriptionAr: t("sectionsDesc"),
      descriptionEn: t("sectionsDesc"),
      isComplete: !missingItems.some((m) => m.id === "sections" && !m.isComplete),
    },
    {
      id: "lessons",
      labelAr: t("lessonsLabel"),
      labelEn: t("lessonsLabel"),
      descriptionAr: t("lessonsDesc"),
      descriptionEn: t("lessonsDesc"),
      isComplete: !missingItems.some((m) => m.id === "lessons" && !m.isComplete),
    },
    {
      id: "videos",
      labelAr: t("videosLabel"),
      labelEn: t("videosLabel"),
      descriptionAr: t("videosDesc"),
      descriptionEn: t("videosDesc"),
      isComplete: !missingItems.some((m) => m.id === "videos" && !m.isComplete),
    },
  ];

  const itemsToRender = missingItems.length > 0 ? missingItems : defaultChecklist;

  const handleNavigateToStudio = () => {
    onClose();
    if (onAction) {
      onAction();
      return;
    }
    if (courseId) {
      router.push(`/${locale}/instructor/courses/create?id=${courseId}`);
    } else {
      router.push(`/${locale}/instructor/courses/new`);
    }
  };

  const getIcon = (id: string) => {
    switch (id) {
      case "cover":
        return <ImageIcon className="w-3.5 h-3.5" />;
      case "sections":
        return <FolderTree className="w-3.5 h-3.5" />;
      case "lessons":
        return <PlaySquare className="w-3.5 h-3.5" />;
      case "videos":
        return <FileVideo className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  const getItemLabel = (item: IncompleteItem) => {
    if (item.id === "cover") return t("coverLabel");
    if (item.id === "sections") return t("sectionsLabel");
    if (item.id === "lessons") return t("lessonsLabel");
    if (item.id === "videos") return t("videosLabel");
    return isAr ? item.labelAr : item.labelEn;
  };

  const getItemDesc = (item: IncompleteItem) => {
    if (item.id === "cover") return t("coverDesc");
    if (item.id === "sections") return t("sectionsDesc");
    if (item.id === "lessons") return t("lessonsDesc");
    if (item.id === "videos") return t("videosDesc");
    return isAr ? item.descriptionAr : item.descriptionEn;
  };

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-100/90 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150 relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 rtl:left-4 ltr:right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Hero */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs mt-0.5">
            <AlertCircle className="h-4.5 w-4.5 text-amber-600" />
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              {t("title")}
            </h3>
            {courseTitle && (
              <p className="text-xs text-slate-500 font-medium truncate max-w-[280px]">
                {courseTitle}
              </p>
            )}
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-xs text-slate-500 font-normal leading-relaxed">
          {t("subtitle")}
        </p>

        {/* Sleek Minimalist Checklist Rows (No heavy boxes) */}
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/40 overflow-hidden">
          {itemsToRender.map((item) => (
            <div
              key={item.id}
              className="p-3 flex items-center justify-between gap-3 bg-white/60 hover:bg-white transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    item.isComplete
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {getIcon(item.id)}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {getItemLabel(item)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal truncate">
                    {getItemDesc(item)}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {item.isComplete ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>{t("statusReady")}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{t("statusRequired")}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Sleek Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {t("closeBtn")}
          </button>

          <button
            type="button"
            onClick={handleNavigateToStudio}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>{t("completeBtn")}</span>
            {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CourseIncompleteModal;


