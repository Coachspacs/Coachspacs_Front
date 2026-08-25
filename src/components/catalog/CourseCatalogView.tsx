"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useLocale } from "next-intl";
import { FilterSidebar } from "./FilterSidebar";
import { SearchSortBar } from "./SearchSortBar";
import { CourseGrid } from "./CourseGrid";
import { CatalogPagination } from "./CatalogPagination";
import { MOCK_COURSES } from "@/lib/mockCatalogData";
import { FilterState, SortOption, CatalogCourse } from "@/types/catalog";
import { courseService } from "@/services/courseService";
import { Compass, Sparkles } from "lucide-react";

const ITEMS_PER_PAGE = 6;

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

  const [allCourses, setAllCourses] = useState<CatalogCourse[]>(MOCK_COURSES);
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [activeFilters, setActiveFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Fetch live courses from Backend API
  useEffect(() => {
    async function loadCatalog() {
      setIsLoading(true);
      try {
        const data = await courseService.getCourses();
        const results = Array.isArray(data) ? data : data?.results || [];

        if (results.length > 0) {
          const liveCourses: CatalogCourse[] = results.map((c: any) => ({
            id: String(c.id),
            title: c.title || "Course",
            titleAr: c.title_ar || c.title || "دورة",
            description: c.description || "",
            descriptionAr: c.description_ar || c.description || "",
            instructorName: c.instructor?.full_name || "Mohammed Katanani",
            instructorNameAr: c.instructor?.full_name_ar || c.instructor?.full_name || "محمد قطناني",
            instructorAvatar: c.instructor?.avatar || "",
            category: c.category?.name || "Business Coaching",
            level: c.level === "beginner" ? "Beginner" : c.level === "intermediate" ? "Intermediate" : c.level === "advanced" ? "Advanced" : "All Levels",
            price: Number(c.price) || 0,
            isFree: Boolean(c.is_free || Number(c.price) === 0),
            language: c.language === "ar" ? "Arabic" : "English",
            rating: c.rating || 4.9,
            reviewsCount: c.reviews_count || 120,
            studentsCount: c.students_count || 0,
            image: c.cover_image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
            badge: c.is_new ? "New" : undefined,
          }));

          // Merge live courses with sample mock courses
          const mockFallback = MOCK_COURSES.filter(
            (mc) => !liveCourses.some((lc) => lc.id === mc.id || lc.title.toLowerCase() === mc.title.toLowerCase())
          );

          setAllCourses([...liveCourses, ...mockFallback]);
        }
      } catch (err) {
        console.warn("Could not fetch live catalog courses, using sample catalog:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalog();
  }, []);

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
        activeFilters.selectedCategories.includes(c.category)
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
  }, [activeFilters]);

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
    <div dir={isAr ? "rtl" : "ltr"} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
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
              sortBy={filters.sortBy}
              onSortChange={handleSortChange}
              isAr={isAr}
              onOpenMobileFilters={() => setMobileDrawerOpen(true)}
              selectedFiltersCount={filters.selectedCategories.length}
            />

            {/* Course Cards Grid */}
            <CourseGrid
              courses={paginatedCourses}
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
