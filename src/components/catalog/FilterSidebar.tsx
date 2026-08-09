"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, Layers, DollarSign, Globe2, Grid, RotateCcw, Filter, X } from "lucide-react";
import { Category, Level, PriceFilter, CourseLanguage, FilterState } from "@/types/catalog";

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  isAr?: boolean;
}

export function FilterSidebar({
  filters,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  isAr = false,
}: FilterSidebarProps) {
  const t = useTranslations("catalog.filters");

  // Accordion collapsed state
  const [levelOpen, setLevelOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(true);

  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const categories: Category[] = [
    "Leadership",
    "Management",
    "Communication",
    "Strategy",
    "Marketing",
    "Design",
    "Development",
    "Data Science",
  ];

  const levels: { value: Level; labelKey: string }[] = [
    { value: "All Levels", labelKey: "allLevels" },
    { value: "Beginner", labelKey: "beginner" },
    { value: "Intermediate", labelKey: "intermediate" },
    { value: "Advanced", labelKey: "advanced" },
  ];

  const prices: { value: PriceFilter; labelKey: string }[] = [
    { value: "All", labelKey: "allPrices" },
    { value: "Free", labelKey: "free" },
    { value: "Paid", labelKey: "paid" },
    { value: "Under $50", labelKey: "under50" },
    { value: "$50 - $100", labelKey: "range50to100" },
    { value: "$100+", labelKey: "above100" },
  ];

  const languages: { value: CourseLanguage; labelKey: string }[] = [
    { value: "All", labelKey: "allLanguages" },
    { value: "English", labelKey: "english" },
    { value: "Arabic", labelKey: "arabic" },
  ];

  const handleCategoryToggle = (categoryName: string) => {
    const isSelected = filters.selectedCategories.includes(categoryName);
    let updatedCategories: string[];
    if (isSelected) {
      updatedCategories = filters.selectedCategories.filter((c) => c !== categoryName);
    } else {
      updatedCategories = [...filters.selectedCategories, categoryName];
    }
    onFilterChange({
      ...filters,
      selectedCategories: updatedCategories,
    });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between space-y-6">
      <div className="space-y-6">
        {/* Sidebar Header */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {t("title")}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t("subtitle")}
          </p>
        </div>

        {/* Filter Sections / Accordions */}
        <div className="space-y-3">
          
          {/* Level Accordion */}
          <div className="border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setLevelOpen(!levelOpen)}
              className="flex w-full items-center justify-between py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Layers className="h-4 w-4 text-slate-500" />
                <span>{t("level")}</span>
              </div>
              {levelOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>

            {levelOpen && (
              <div className="mt-2 space-y-1.5 pl-6 rtl:pl-0 rtl:pr-6 animate-in fade-in duration-150">
                {levels.map((lvl) => (
                  <label key={lvl.value} className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="levelFilter"
                      checked={filters.selectedLevel === lvl.value}
                      onChange={() => onFilterChange({ ...filters, selectedLevel: lvl.value })}
                      className="h-3.5 w-3.5 text-[#0F5244] focus:ring-[#0F5244] border-slate-300"
                    />
                    <span>{t(lvl.labelKey)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price Accordion */}
          <div className="border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setPriceOpen(!priceOpen)}
              className="flex w-full items-center justify-between py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="h-4 w-4 text-slate-500" />
                <span>{t("price")}</span>
              </div>
              {priceOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>

            {priceOpen && (
              <div className="mt-2 space-y-1.5 pl-6 rtl:pl-0 rtl:pr-6 animate-in fade-in duration-150">
                {prices.map((pr) => (
                  <label key={pr.value} className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="priceFilter"
                      checked={filters.selectedPrice === pr.value}
                      onChange={() => onFilterChange({ ...filters, selectedPrice: pr.value })}
                      className="h-3.5 w-3.5 text-[#0F5244] focus:ring-[#0F5244] border-slate-300"
                    />
                    <span>{t(pr.labelKey)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Language Accordion */}
          <div className="border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              className="flex w-full items-center justify-between py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Globe2 className="h-4 w-4 text-slate-500" />
                <span>{t("language")}</span>
              </div>
              {langOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>

            {langOpen && (
              <div className="mt-2 space-y-1.5 pl-6 rtl:pl-0 rtl:pr-6 animate-in fade-in duration-150">
                {languages.map((lng) => (
                  <label key={lng.value} className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="languageFilter"
                      checked={filters.selectedLanguage === lng.value}
                      onChange={() => onFilterChange({ ...filters, selectedLanguage: lng.value })}
                      className="h-3.5 w-3.5 text-[#0F5244] focus:ring-[#0F5244] border-slate-300"
                    />
                    <span>{t(lng.labelKey)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Category Accordion */}
          <div className="pb-3">
            <button
              type="button"
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="flex w-full items-center justify-between p-2.5 rounded-xl bg-[#E8F3F1] text-[#0F5244] font-bold text-sm transition-all shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <Grid className="h-4 w-4 text-[#0F5244]" />
                <span>{t("category")}</span>
              </div>
              {categoryOpen ? <ChevronUp className="h-4 w-4 text-[#0F5244]" /> : <ChevronDown className="h-4 w-4 text-[#0F5244]" />}
            </button>

            {categoryOpen && (
              <div className="mt-3 space-y-2.5 pl-3 rtl:pl-0 rtl:pr-3 animate-in fade-in duration-150">
                {categories.map((catKey) => {
                  const isChecked = filters.selectedCategories.includes(catKey);
                  return (
                    <label
                      key={catKey}
                      className="flex items-center gap-2.5 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer group py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCategoryToggle(catKey)}
                        className="h-4 w-4 rounded border-slate-300 text-[#0F5244] focus:ring-[#0F5244] transition-colors cursor-pointer accent-[#0F5244]"
                      />
                      <span className={isChecked ? "font-semibold text-[#0F5244]" : "text-slate-600 group-hover:text-slate-900"}>
                        {t(`categories.${catKey}`)}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Action Buttons at Bottom */}
      <div className="pt-6 border-t border-slate-100 space-y-3">
        <button
          type="button"
          onClick={() => {
            onApplyFilters();
            setMobileDrawerOpen(false);
          }}
          className="w-full py-3 px-4 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/40"
        >
          {t("applyFilters")}
        </button>

        <button
          type="button"
          onClick={onResetFilters}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{t("resetAll")}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (visible lg screens and up) */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs self-start sticky top-24">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Filter Toggle Floating Button */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0F5244] text-white px-4 py-2.5 text-sm font-bold shadow-md hover:bg-[#07382E] transition-all"
        >
          <Filter className="h-4 w-4" />
          <span>{t("showFilters")}</span>
          {filters.selectedCategories.length > 0 && (
            <span className="ml-1 rounded-full bg-white text-[#0F5244] px-1.5 py-0.5 text-xs font-black">
              {filters.selectedCategories.length}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Drawer Backdrop and Container */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative ml-auto rtl:ml-0 rtl:mr-auto w-full max-w-xs bg-white h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between z-10 animate-in slide-in-from-right rtl:slide-in-from-left duration-200">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 text-slate-500 hover:text-slate-800 rounded-full"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
