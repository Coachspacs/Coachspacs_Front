"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Search, ChevronDown, X } from "lucide-react";
import { SortOption } from "@/types/catalog";

interface SearchSortBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalResults: number;
  sortBy: SortOption;
  onSortChange: (option: SortOption) => void;
  isAr?: boolean;
}

export function SearchSortBar({
  searchQuery,
  onSearchChange,
  totalResults,
  sortBy,
  onSortChange,
  isAr = false,
}: SearchSortBarProps) {
  const t = useTranslations("catalog.search");

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs w-full">
      
      {/* Left: Search Input with Clear Button */}
      <div className="relative w-full sm:w-72 md:w-80">
        <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3.5 rtl:pl-0 rtl:pr-3.5">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("placeholder")}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-9 rtl:pl-9 rtl:pr-10 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 shadow-2xs transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center pr-3 rtl:pr-0 rtl:pl-3 text-slate-400 hover:text-slate-700"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Center: Dynamic Results Pill Badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#E8F3F1] text-[#0F5244] text-xs font-black tracking-tight">
          {t("resultsFound", { count: totalResults })}
        </span>
      </div>

      {/* Right: Sort Dropdown */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
          {t("sortBy")}
        </span>
        <div className="relative inline-block w-44">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3.5 pr-8 rtl:pl-8 rtl:pr-3.5 text-xs font-bold text-slate-700 hover:border-slate-300 focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 shadow-2xs cursor-pointer transition-all"
          >
            <option value="most_popular">{t("sortOptions.most_popular")}</option>
            <option value="highest_rated">{t("sortOptions.highest_rated")}</option>
            <option value="newest">{t("sortOptions.newest")}</option>
            <option value="price_low_to_high">{t("sortOptions.price_low_to_high")}</option>
            <option value="price_high_to_low">{t("sortOptions.price_high_to_low")}</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center pr-2.5 rtl:pr-0 rtl:pl-2.5">
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

    </div>
  );
}
