"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import { FilterSidebar } from "./FilterSidebar";
import { SearchSortBar } from "./SearchSortBar";
import { CourseGrid } from "./CourseGrid";
import { CatalogPagination } from "./CatalogPagination";
import { FilterState, SortOption, CatalogCourse } from "@/types/catalog";
import { courseService } from "@/services/courseService";
import { Compass, Sparkles } from "lucide-react";

const ITEMS_PER_PAGE = 9;

const INITIAL_FILTERS: FilterState = {
  searchQuery: "",
  selectedCategories: [], // All categories displayed by default
  selectedLevel: "All Levels",
  selectedPrice: "All",
  selectedLanguage: "All",
  sortBy: "most_popular",
};

export function CourseCatalogView() {
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const [allCourses, setAllCourses] = useState<CatalogCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [activeFilters, setActiveFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Sync with initial URL search params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const catParam = sp.get("category");
      const searchParam = sp.get("search") || sp.get("q");
      if (catParam || searchParam) {
        const initialWithParams: FilterState = {
          ...INITIAL_FILTERS,
          selectedCategories: catParam ? [catParam] : [],
          searchQuery: searchParam || "",
        };
        setFilters(initialWithParams);
        setActiveFilters(initialWithParams);
      }
    }
  }, []);

  // Fetch live courses from Backend API
  useEffect(() => {
    let isSubscribed = true;

    async function loadCatalog() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await courseService.getCourses({ page_size: 50 }, locale);
        const results = Array.isArray(data) ? data : data?.results || [];

        if (isSubscribed) {
          if (results.length > 0) {
            const liveCourses: CatalogCourse[] = results.map((c: any) => {
              const instName = typeof c.instructor === "object" ? (c.instructor?.full_name || c.instructor?.name || "") : (typeof c.instructor === "string" ? c.instructor : "");
              const catName = typeof c.category === "object" ? (c.category?.name || "") : (typeof c.category === "string" ? c.category : "");
              const catNameAr = typeof c.category === "object" && c.category?.name_ar ? c.category.name_ar : (c.category_ar || catName);
              const priceNum = Number(c.price) || 0;
              const durationNum = Number(c.duration_hours || c.duration || 0);

              return {
                id: String(c.id),
                title: c.title || c.title_en || "Course",
                titleAr: c.title_ar || c.title || "دورة",
                description: c.description || c.description_en || "",
                descriptionAr: c.description_ar || c.description || "",
                instructorName: instName,
                instructorNameAr: typeof c.instructor === "object" && c.instructor?.full_name_ar ? c.instructor.full_name_ar : instName,
                instructorAvatar: (typeof c.instructor === "object" ? c.instructor?.avatar : undefined) || "",
                category: catName,
                categoryAr: catNameAr,
                level: c.level === "beginner" ? "Beginner" : c.level === "intermediate" ? "Intermediate" : c.level === "advanced" ? "Advanced" : "All Levels",
                price: priceNum,
                priceFormatted: priceNum === 0 ? (isAr ? "مجاني" : "Free") : `$${priceNum.toFixed(2)}`,
                isFree: Boolean(c.is_free || priceNum === 0),
                language: c.language === "ar" ? "Arabic" : "English",
                rating: Number(c.rating) || 5.0,
                reviewsCount: Number(c.reviews_count || c.reviewsCount || 0),
                reviewsCountFormatted: String(Number(c.reviews_count || c.reviewsCount || 0)),
                studentsCount: Number(c.students_count || c.studentsCount || 0),
                durationHours: durationNum > 0 ? durationNum : 10,
                durationFormatted: durationNum > 0 ? `${durationNum} ${isAr ? "ساعات" : "hours"}` : `10 ${isAr ? "ساعات" : "hours"}`,
                coverImage: c.cover_image || c.coverImage || c.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
                image: c.cover_image || c.coverImage || c.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
                badge: c.is_new ? "New" : c.is_bestseller ? "Bestseller" : undefined,
              };
            });

            // Set exclusively the live courses from the API database
            setAllCourses(liveCourses);
          } else {
            setAllCourses([]);
          }
        }
      } catch (err: any) {
        console.warn("Could not fetch live catalog courses:", err);
        if (isSubscribed) {
          setAllCourses([]);
          setError(err?.message || "Failed to load courses");
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      isSubscribed = false;
    };
  }, [fetchTrigger, locale, isAr]);

  // Instant Filter change handler
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setActiveFilters(newFilters);
    setCurrentPage(1);
  };

  // Apply filters handler
  const handleApplyFilters = () => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  // Reset filters handler
  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setActiveFilters(INITIAL_FILTERS);
    setCurrentPage(1);
  };

  // Instant Search change
  const handleSearchChange = (query: string) => {
    const updated = { ...filters, searchQuery: query };
    setFilters(updated);
    setActiveFilters(updated);
    setCurrentPage(1);
  };

  // Instant Sort change
  const handleSortChange = (sortOption: SortOption) => {
    const updated = { ...filters, sortBy: sortOption };
    setFilters(updated);
    setActiveFilters(updated);
  };

  // Filter & Sort logic
  const filteredCourses = useMemo(() => {
    let result = [...allCourses];

    // 1. Search Query
    if (activeFilters.searchQuery.trim()) {
      const q = activeFilters.searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          (c.title || "").toLowerCase().includes(q) ||
          (c.titleAr || "").includes(q) ||
          (c.instructorName || "").toLowerCase().includes(q) ||
          (c.instructorNameAr || "").includes(q) ||
          (c.category || "").toLowerCase().includes(q)
      );
    }

    // 2. Categories
    if (activeFilters.selectedCategories.length > 0) {
      result = result.filter((c) =>
        activeFilters.selectedCategories.includes(c.category) ||
        (Boolean(c.categoryAr) && activeFilters.selectedCategories.includes(c.categoryAr!))
      );
    }

    // 3. Level
    if (activeFilters.selectedLevel !== "All Levels") {
      result = result.filter((c) => c.level === activeFilters.selectedLevel);
    }

    // 4. Price
    if (activeFilters.selectedPrice !== "All") {
      if (activeFilters.selectedPrice === "Free") {
        result = result.filter((c) => c.price === 0);
      } else if (activeFilters.selectedPrice === "Paid") {
        result = result.filter((c) => c.price > 0);
      } else if (activeFilters.selectedPrice === "Under $50") {
        result = result.filter((c) => c.price < 50);
      } else if (activeFilters.selectedPrice === "$50 - $100") {
        result = result.filter((c) => c.price >= 50 && c.price <= 100);
      } else if (activeFilters.selectedPrice === "$100+") {
        result = result.filter((c) => c.price > 100);
      }
    }

    // 5. Language
    if (activeFilters.selectedLanguage !== "All") {
      result = result.filter((c) => (c.language || "English") === activeFilters.selectedLanguage);
    }

    // 6. Sorting
    if (activeFilters.sortBy === "most_popular") {
      result.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (activeFilters.sortBy === "highest_rated") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (activeFilters.sortBy === "newest") {
      result.sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0));
    } else if (activeFilters.sortBy === "price_low_to_high") {
      result.sort((a, b) => a.price - b.price);
    } else if (activeFilters.sortBy === "price_high_to_low") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [allCourses, activeFilters]);

  // Dynamic Total Count matching actual filtered results
  const totalResultsCount = filteredCourses.length;

  // Dynamic Total Pages calculation
  const totalPages = Math.max(1, Math.ceil(totalResultsCount / ITEMS_PER_PAGE));

  // Current Page Slice
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCourses.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCourses, currentPage]);



  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10"
    >
      {/* Catalog Main Layout (Sidebar + Content) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
            isAr={isAr}
            mobileDrawerOpen={mobileDrawerOpen}
            onMobileDrawerOpenChange={setMobileDrawerOpen}
          />

          {/* Main Catalog Content */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Search & Sort Bar Container */}
            <SearchSortBar
              searchQuery={filters.searchQuery}
              onSearchChange={handleSearchChange}
              totalResults={totalResultsCount}
              isLoading={isLoading}
              sortBy={filters.sortBy}
              onSortChange={handleSortChange}
              isAr={isAr}
              onOpenMobileFilters={() => setMobileDrawerOpen(true)}
              selectedFiltersCount={filters.selectedCategories.length}
            />

            {/* Course Cards Grid */}
            <CourseGrid
              courses={paginatedCourses}
              isLoading={isLoading}
              error={error}
              onRetry={() => setFetchTrigger((prev) => prev + 1)}
              onResetFilters={handleResetFilters}
              isAr={isAr}
            />

            {/* Dynamic Pagination Component */}
            {totalResultsCount > 0 && totalPages > 1 && (
              <CatalogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                isAr={isAr}
              />
            )}

          </div>

        </div>
    </div>
  );
}
