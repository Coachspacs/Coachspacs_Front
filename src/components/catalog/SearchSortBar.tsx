"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Search, ChevronDown, X, Check, ArrowUpDown, Filter } from "lucide-react";
import { SortOption } from "@/types/catalog";

interface SearchSortBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalResults: number;
  sortBy: SortOption;
  onSortChange: (option: SortOption) => void;
  isAr?: boolean;
  onOpenMobileFilters?: () => void;
  selectedFiltersCount?: number;
}

export function SearchSortBar({
  searchQuery,
  onSearchChange,
  totalResults,
  sortBy,
  onSortChange,
  isAr = false,
  onOpenMobileFilters,
  selectedFiltersCount = 0,
}: SearchSortBarProps) {
  const t = useTranslations("catalog.search");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptionsList: { value: SortOption; label: string }[] = [
    { value: "most_popular", label: t("sortOptions.most_popular") },
    { value: "highest_rated", label: t("sortOptions.highest_rated") },
    { value: "newest", label: t("sortOptions.newest") },
    { value: "price_low_to_high", label: t("sortOptions.price_low_to_high") },
    { value: "price_high_to_low", label: t("sortOptions.price_high_to_low") },
  ];

  const currentOption = sortOptionsList.find((opt) => opt.value === sortBy) || sortOptionsList[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs w-full">
      
      {/* Search Input */}
      <div className="relative w-full md:w-80 shrink-0">
        <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3.5 rtl:pl-0 rtl:pr-3.5">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("placeholder")}
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-9 rtl:pl-9 rtl:pr-10 text-[16px] sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 shadow-2xs transition-all"
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

      {/* Side-by-Side Controls Group: Filter Button + Results Count Badge + Sort Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-end w-full md:w-auto shrink-0 flex-wrap sm:flex-nowrap">
        
        {/* Mobile Filter Trigger Button (tightly aligned side-by-side) */}
        {onOpenMobileFilters && (
          <button
            type="button"
            onClick={onOpenMobileFilters}
            className="lg:hidden inline-flex items-center gap-1.5 rounded-xl bg-[#0F5244] text-white px-3 py-2 text-xs font-black shadow-2xs hover:bg-[#07382E] active:scale-98 transition-all shrink-0 cursor-pointer"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>{isAr ? "الفلترة" : "Filters"}</span>
            {selectedFiltersCount > 0 && (
              <span className="rounded-full bg-white text-[#0F5244] px-1.5 py-0.2 text-[10px] font-black">
                {selectedFiltersCount}
              </span>
            )}
          </button>
        )}

        {/* Dynamic Results Pill Badge */}
        <span className="inline-flex items-center px-3.5 py-2 rounded-full bg-[#E8F3F1] text-[#0F5244] text-xs font-black tracking-tight shrink-0 whitespace-nowrap">
          {t("resultsFound", { count: totalResults })}
        </span>

        {/* Custom Modern Sort Dropdown Menu */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden xl:flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            {t("sortBy")}
          </span>

          <div className="relative inline-block w-40 sm:w-48" ref={dropdownRef}>
            {/* Custom Trigger Button */}
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              className="w-full flex items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-white py-2 px-3 text-xs font-extrabold text-slate-800 hover:border-[#0F5244] hover:shadow-2xs focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 transition-all cursor-pointer"
            >
              <span className="truncate">{currentOption.label}</span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-[#0F5244]" : ""
                }`}
              />
            </button>

            {/* Custom Floating Popover Dropdown Menu */}
            {isOpen && (
              <div
                role="listbox"
                className="absolute top-full mt-2 left-0 right-0 z-50 rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
              >
                {sortOptionsList.map((option) => {
                  const isSelected = option.value === sortBy;
                  return (
                    <button
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                      type="button"
                      onClick={() => {
                        onSortChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#E8F3F1] text-[#0F5244]"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-bold"
                      }`}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-[#0F5244] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
