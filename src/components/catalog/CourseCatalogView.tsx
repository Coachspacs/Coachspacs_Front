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

  const [totalResultsCount, setTotalResultsCount] = useState<number>(0);

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

  // Debounce search query changes to prevent excessive API requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveFilters((prev) => {
        if (prev.searchQuery === filters.searchQuery) return prev;
        return { ...prev, searchQuery: filters.searchQuery };
      });
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [filters.searchQuery]);

  // Fetch live courses from Backend API using active filters and pagination
  useEffect(() => {
    let isSubscribed = true;

    async function loadCatalog() {
      setIsLoading(true);
      setError(null);
      try {
        const apiParams: any = {
          page: currentPage,
          page_size: ITEMS_PER_PAGE,
        };

        // 1. Search Query
        if (activeFilters.searchQuery.trim()) {
          apiParams.search = activeFilters.searchQuery.trim();
        }

        // 2. Category ID
        if (activeFilters.selectedCategories.length > 0) {
          apiParams.category = activeFilters.selectedCategories[0];
        }

        // 3. Level (beginner | intermediate | advanced)
        if (activeFilters.selectedLevel && activeFilters.selectedLevel !== "All Levels") {
          apiParams.level = activeFilters.selectedLevel.toLowerCase();
        }

        // 4. Language (ar | en)
        if (activeFilters.selectedLanguage === "Arabic") {
          apiParams.language = "ar";
        } else if (activeFilters.selectedLanguage === "English") {
          apiParams.language = "en";
        }

        // 5. Price range
        if (activeFilters.selectedPrice === "Free") {
          apiParams.price_min = 0;
          apiParams.price_max = 0;
        } else if (activeFilters.selectedPrice === "Paid") {
          apiParams.price_min = 1;
        } else if (activeFilters.selectedPrice === "Under $50") {
          apiParams.price_min = 0;
          apiParams.price_max = 50;
        } else if (activeFilters.selectedPrice === "$50 - $100") {
          apiParams.price_min = 50;
          apiParams.price_max = 100;
        } else if (activeFilters.selectedPrice === "$100+") {
          apiParams.price_min = 100;
        }

        // 6. Sort (newest | price | popular)
        if (activeFilters.sortBy === "newest") {
          apiParams.sort = "newest";
        } else if (activeFilters.sortBy === "price_low_to_high") {
          apiParams.sort = "price";
        } else if (activeFilters.sortBy === "most_popular" || activeFilters.sortBy === "highest_rated") {
          apiParams.sort = "popular";
        }

        const data = await courseService.getCourses(apiParams, locale);
        const results = Array.isArray(data) ? data : data?.results || [];
        const count = typeof data?.count === "number" ? data.count : results.length;

        if (isSubscribed) {
          setTotalResultsCount(count);

          if (results.length > 0) {
            const liveCourses: CatalogCourse[] = results.map((c: any) => {
              const instName = typeof c.instructor === "object" ? (c.instructor?.full_name || c.instructor?.name || "") : (typeof c.instructor === "string" ? c.instructor : "");
              const instId = typeof c.instructor === "object" ? c.instructor?.id : c.instructor_id;
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
                instructor: c.instructor,
                instructorId: instId ? String(instId) : undefined,
                instructorName: instName,
                instructorNameAr: typeof c.instructor === "object" && c.instructor?.full_name_ar ? c.instructor.full_name_ar : instName,
                instructorAvatar: (typeof c.instructor === "object" ? c.instructor?.avatar : undefined) || "",
                category: catName,
                categoryAr: catNameAr,
                level: c.level === "beginner" ? "Beginner" : c.level === "intermediate" ? "Intermediate" : c.level === "advanced" ? "Advanced" : "All Levels",
                price: priceNum,
                priceFormatted: priceNum === 0 ? "Free" : `$${priceNum.toFixed(2)}`,
                isFree: Boolean(c.is_free || priceNum === 0),
                language: c.language === "ar" ? "Arabic" : "English",
                rating: Number(c.rating || 0),
                reviewsCount: Number(c.reviews_count || c.reviewsCount || 0),
                reviewsCountFormatted: String(Number(c.reviews_count || c.reviewsCount || 0)),
                studentsCount: Number(c.students_count || c.studentsCount || 0),
                durationHours: durationNum > 0 ? durationNum : 10,
                durationFormatted: `${durationNum > 0 ? durationNum : 10} hours`,
                coverImage: c.cover_image || c.coverImage || c.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
                image: c.cover_image || c.coverImage || c.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
                badge: c.is_new ? "New" : c.is_bestseller ? "Bestseller" : undefined,
              };
            });

            // If user selected descending price sort, sort the current batch descending
            if (activeFilters.sortBy === "price_high_to_low") {
              liveCourses.sort((a, b) => b.price - a.price);
            }

            setAllCourses(liveCourses);
          } else {
            setAllCourses([]);
          }
        }
      } catch (err: any) {
        console.warn("Could not fetch live catalog courses:", err);
        if (isSubscribed) {
          setAllCourses([]);
          setTotalResultsCount(0);
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
  }, [fetchTrigger, locale, currentPage, activeFilters]);

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
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  // Instant Sort change
  const handleSortChange = (sortOption: SortOption) => {
    setFilters((prev) => ({ ...prev, sortBy: sortOption }));
    setActiveFilters((prev) => ({ ...prev, sortBy: sortOption }));
    setCurrentPage(1);
  };

  // Total Pages calculated from API total count
  const totalPages = Math.max(1, Math.ceil(totalResultsCount / ITEMS_PER_PAGE));



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
              courses={allCourses}
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
