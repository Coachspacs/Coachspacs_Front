"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isAr?: boolean;
}

export function CatalogPagination({
  currentPage,
  totalPages,
  onPageChange,
  isAr = false,
}: CatalogPaginationProps) {
  const t = useTranslations("catalog.pagination");

  if (totalPages <= 1) return null;

  // Generate array of page numbers
  const pageNumbers: (number | string)[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    pageNumbers.push(1);
    if (currentPage > 3) {
      pageNumbers.push("...");
    }
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      if (!pageNumbers.includes(i)) {
        pageNumbers.push(i);
      }
    }
    if (currentPage < totalPages - 2) {
      pageNumbers.push("...");
    }
    if (!pageNumbers.includes(totalPages)) {
      pageNumbers.push(totalPages);
    }
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 py-8 mt-6">
      
      {/* Previous Button */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="flex items-center justify-center h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label={t("previous")}
      >
        {isAr ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Numerical Page Buttons */}
      {pageNumbers.map((p, idx) => {
        if (p === "...") {
          return (
            <span key={`ellipsis-${idx}`} className="text-slate-400 text-xs font-bold px-1">
              ...
            </span>
          );
        }

        const pageNum = p as number;
        const isActive = currentPage === pageNum;

        return (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            className={`flex items-center justify-center h-8 w-8 rounded-lg text-xs font-bold transition-all ${
              isActive
                ? "bg-[#0F5244] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        type="button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label={t("next")}
      >
        {isAr ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

    </div>
  );
}
