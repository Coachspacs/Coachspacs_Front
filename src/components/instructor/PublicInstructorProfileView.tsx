"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  BookOpen,
  Share2,
  Globe,
  Linkedin,
  Twitter,
  Github,
  Mail,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowRight,
  Quote,
  MapPin,
  ExternalLink,
  Star,
  Layers,
  Clock,
  ShoppingCart,
  Image as ImageIcon,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { addToCart } from "@/features/cart/cartSlice";
import { instructorCourseService } from "@/services/instructorCourseService";
import { courseService } from "@/services/courseService";
import { PublicInstructor } from "@/types/publicInstructor";
import { CourseCard } from "@/components/catalog/CourseCard";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import {
  getSavedInstructorOverrides,
  getLocalizedName,
  getLocalizedHeadline,
  getLocalizedBio,
  getLocalizedSpecialization,
  getLocalizedSkill,
  normalizeInstructorSlug,
} from "@/lib/mockInstructors";

interface CompactCourseCardProps {
  course: any;
  isAr: boolean;
  locale: string;
}

function CompactInstructorCourseCard({ course, isAr, locale }: CompactCourseCardProps) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart?.items || []);
  const isInCart = cartItems.some(
    (item: any) => String(item.course?.id || item.courseId || item.id) === String(course.id)
  );

  const [imgSrc, setImgSrc] = useState(
    course.coverImage || course.image || ""
  );

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInCart) {
      dispatch(addToCart(course));
    }
  };

  const coursePath = `/${locale}/courses/${course.id}`;
  const isFree = Boolean(course.isFree || course.price === 0 || course.priceFormatted === "Free" || course.priceFormatted === "مجاني");

  return (
    <Link href={coursePath} className="block group h-full select-none">
      <div className="flex flex-col justify-between h-full rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-[#0F5244]/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer">
        {/* Compact Thumbnail */}
        <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden flex items-center justify-center">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={isAr ? (course.titleAr || course.title || "") : (course.title || course.titleAr || "")}
              fill
              sizes="(max-width: 768px) 50vw, 240px"
              onError={() => setImgSrc("")}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 gap-1 p-2 text-center">
              <ImageIcon className="w-5 h-5 text-slate-300" />
              <span className="text-[10px] font-bold text-slate-400">
                {isAr ? "بدون غلاف" : "No cover"}
              </span>
            </div>
          )}
          {course.badge && (
            <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2">
              <span className="inline-block px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-wider bg-[#38BDF8] text-slate-900 shadow-2xs">
                {course.badge}
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="flex flex-col flex-1 p-3.5 justify-between space-y-2.5">
          <div className="space-y-1.5">
            <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-[#0F5244] bg-[#E8F3F1] px-2 py-0.5 rounded-md truncate max-w-full">
              {isAr ? course.categoryAr || course.category : course.category}
            </span>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#0F5244] transition-colors line-clamp-2 leading-snug tracking-tight">
              {isAr ? course.titleAr || course.title : course.title || course.titleAr}
            </h4>
          </div>

          {/* Footer: Price & Add to Cart */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center">
              <span className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                {isFree ? (
                  <span className="text-emerald-600 font-extrabold">{isAr ? "مجاني" : "Free"}</span>
                ) : (
                  course.priceFormatted || `$${Number(course.price || 0).toFixed(2)}`
                )}
              </span>
            </div>

            {!isFree && (
              <button
                type="button"
                onClick={handleCartClick}
                title={isInCart ? (isAr ? "في السلة" : "In Cart") : (isAr ? "إضافة إلى السلة" : "Add to Cart")}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center text-xs font-extrabold shadow-2xs active:scale-95 ${
                  isInCart
                    ? "bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-600 hover:text-white"
                }`}
              >
                {isInCart ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <ShoppingCart className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

interface PublicInstructorProfileViewProps {
  instructor: PublicInstructor;
}

export function PublicInstructorProfileView({ instructor: initialInstructor }: PublicInstructorProfileViewProps) {
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const t = useTranslations("publicInstructorProfile");
  const authUser = useSelector((state: RootState) => state.auth.user);

  const [instructor, setInstructor] = useState<PublicInstructor>(initialInstructor || ({} as any));
  const [copied, setCopied] = useState(false);

  // Single-Row Slider Controls & Drag-to-Scroll
  const coursesScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  // Mouse Drag State
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const [isCursorGrabbing, setIsCursorGrabbing] = useState(false);

  const checkScroll = useCallback(() => {
    const el = coursesScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    const currentScroll = Math.abs(scrollLeft);
    setCanScrollPrev(currentScroll > 10);
    setCanScrollNext(currentScroll < maxScroll - 10);
  }, []);

  const handleScroll = (dir: "prev" | "next") => {
    const el = coursesScrollRef.current;
    if (!el) return;
    
    // Get actual width of first card + gap
    const firstCard = el.querySelector<HTMLElement>("[data-course-card]");
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 320;
    const scrollStep = cardWidth + 16; // card width + gap-4 (16px)

    const scrollAmount = dir === "next" ? scrollStep : -scrollStep;

    if (isAr) {
      el.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }

    setTimeout(checkScroll, 350);
  };

  // Mouse Drag Events
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = coursesScrollRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    setIsCursorGrabbing(true);
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const el = coursesScrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }
    el.scrollLeft = scrollLeftRef.current - walk;
    checkScroll();
  };

  const handleMouseUpOrLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsCursorGrabbing(false);
      checkScroll();
    }
  };

  // Sync client profile state and dynamically fetch public instructor courses from Backend API
  useEffect(() => {
    if (!initialInstructor) return;
    const overrides = getSavedInstructorOverrides(initialInstructor.id || initialInstructor.slug || "");
    const merged = { ...overrides };

    if (Object.keys(merged).length > 0) {
      setInstructor((prev) => ({
        ...prev,
        ...merged,
        name: merged.name || prev.name,
        nameAr: merged.nameAr || merged.name || prev.nameAr,
        headline: merged.headline !== undefined ? merged.headline : prev.headline,
        headlineAr: merged.headlineAr !== undefined ? merged.headlineAr : prev.headlineAr,
        specialization: merged.specialization !== undefined ? merged.specialization : prev.specialization,
        specializationAr: merged.specializationAr !== undefined ? merged.specializationAr : prev.specializationAr,
        experienceYears: merged.experienceYears !== undefined ? merged.experienceYears : prev.experienceYears,
        bio: merged.bio !== undefined ? merged.bio : prev.bio,
        bioAr: merged.bioAr !== undefined ? merged.bioAr : prev.bioAr,
        skills: merged.skills !== undefined ? merged.skills : prev.skills,
        skillsAr: merged.skillsAr !== undefined ? merged.skillsAr : prev.skillsAr,
        avatar: merged.avatar !== undefined ? merged.avatar : prev.avatar,
        hourlyRate: merged.hourlyRate !== undefined ? merged.hourlyRate : prev.hourlyRate,
        hourlyRateAr: merged.hourlyRateAr !== undefined ? merged.hourlyRateAr : prev.hourlyRateAr,
        location: merged.location !== undefined ? merged.location : prev.location,
        locationAr: merged.locationAr !== undefined ? merged.locationAr : prev.locationAr,
        socials: {
          ...(prev.socials || {}),
          ...(merged.socials || {}),
        },
      }));
    }

    let isSubscribed = true;

    // Helper to format course object into CourseCard format
    const formatCourse = (c: any, instName: string, instNameAr: string, instAvatar?: string) => {
      const catName = typeof c.category === "object" ? (c.category?.name || "General") : (typeof c.category === "string" ? c.category : (c.category_name || "General"));
      const catNameAr = typeof c.category === "object" && c.category?.name_ar ? c.category.name_ar : (c.category_ar || catName);
      const priceNum = Number(c.price) || 0;
      const durationNum = Number(c.duration_hours || c.duration || 0);

      return {
        id: String(c.id),
        title: c.title || c.title_en || "Course",
        titleAr: c.title_ar || c.title || "دورة",
        titleEn: c.title_en || c.title || "Course",
        slug: String(c.id),
        description: c.description || c.description_en || "",
        descriptionAr: c.description_ar || c.description || "",
        instructorName: instName,
        instructorNameAr: instNameAr,
        instructorAvatar: instAvatar || (typeof c.instructor === "object" ? c.instructor?.avatar : undefined) || "",
        category: catName,
        categoryAr: catNameAr,
        level: c.level === "beginner" ? "Beginner" : c.level === "intermediate" ? "Intermediate" : c.level === "advanced" ? "Advanced" : (c.level || "Beginner"),
        price: priceNum,
        priceFormatted: priceNum === 0 ? "Free" : `$${priceNum.toFixed(2)}`,
        isFree: Boolean(c.is_free || priceNum === 0),
        language: c.language === "ar" ? "Arabic" : "English",
        rating: Number(c.rating || 0),
        reviewsCount: Number(c.reviews_count || 0),
        reviewsCountFormatted: String(Number(c.reviews_count || 0)),
        studentsCount: Number(c.students_count || 0),
        durationHours: durationNum > 0 ? durationNum : 10,
        durationFormatted: `${durationNum > 0 ? durationNum : 10} hours`,
        coverImage: c.cover_image || c.coverImage || (typeof c.image === "string" && !c.image.includes("unsplash.com/photo-1516321318423") ? c.image : ""),
        image: c.cover_image || c.coverImage || (typeof c.image === "string" && !c.image.includes("unsplash.com/photo-1516321318423") ? c.image : ""),
        badge: c.is_new ? "New" : c.is_bestseller ? "Bestseller" : undefined,
      };
    };

    // 1. Fetch public catalog courses (available to all roles: student, guest, instructor)
    async function loadInstructorCourses() {
      try {
        const data = await courseService.getCourses({ page_size: 100 }, locale);
        const results = Array.isArray(data) ? data : data?.results || [];

        if (!isSubscribed) return;

        const targetSlug = normalizeInstructorSlug(initialInstructor.slug || initialInstructor.name || "");
        const targetName = (initialInstructor.name || "").toLowerCase().trim();
        const targetNameAr = (initialInstructor.nameAr || "").toLowerCase().trim();
        const targetId = String(initialInstructor.id || "").replace(/^inst-/, "");

        // Filter courses matching this instructor
        const matchingPublicCourses = results.filter((c: any) => {
          const instObj = typeof c.instructor === "object" ? c.instructor : null;
          const instFullName = (instObj?.full_name || instObj?.name || (typeof c.instructor === "string" ? c.instructor : (c.instructorName || ""))).toLowerCase().trim();
          const instId = String(instObj?.id || c.instructor_id || "");
          const courseSlug = normalizeInstructorSlug(instFullName);

          // Match by instructor ID
          if (targetId && instId && (targetId === instId || `inst-${instId}` === initialInstructor.id)) {
            return true;
          }
          // Match by slug
          if (targetSlug && courseSlug && (targetSlug === courseSlug || courseSlug.includes(targetSlug) || targetSlug.includes(courseSlug))) {
            return true;
          }
          // Match by English / Arabic full name
          if (targetName && instFullName && (targetName === instFullName || instFullName.includes(targetName) || targetName.includes(instFullName))) {
            return true;
          }
          if (targetNameAr && instFullName && (targetNameAr === instFullName || instFullName.includes(targetNameAr))) {
            return true;
          }
          return false;
        });

        let discoveredAvatar: string | undefined = undefined;
        for (const c of matchingPublicCourses) {
          if (typeof c.instructor === "object" && c.instructor?.avatar) {
            discoveredAvatar = c.instructor.avatar;
            break;
          }
        }

        setInstructor((prev) => {
          const instName = prev.name || initialInstructor.name || "Instructor";
          const instNameAr = prev.nameAr || initialInstructor.nameAr || instName;
          const instAvatar = prev.avatar || discoveredAvatar || initialInstructor.avatar;

          const formattedPublicCourses = matchingPublicCourses.map((c: any) =>
            formatCourse(c, instName, instNameAr, instAvatar)
          );

          return {
            ...prev,
            avatar: instAvatar,
            courses: formattedPublicCourses.length > 0 ? formattedPublicCourses : (prev.courses?.length ? prev.courses : []),
          };
        });

        // 2. If the logged in user is this instructor, also fetch authenticated studio courses
        const isCurrentInstructor = Boolean(
          authUser &&
          ((authUser.role || "").toLowerCase() === "instructor" || (authUser.role || "").toLowerCase() === "coach") &&
          (authUser.fullName === initialInstructor.name ||
           authUser.name === initialInstructor.name ||
           normalizeInstructorSlug(authUser.fullName || authUser.name || "") === targetSlug ||
           initialInstructor.slug === "mohammed-katanani" ||
           initialInstructor.id === "inst-mohammed-katanani")
        );

        if (isCurrentInstructor) {
          try {
            const studioData = await instructorCourseService.getMyCourses();
            const studioList = Array.isArray(studioData) ? studioData : studioData?.results || [];
            if (studioList.length > 0 && isSubscribed) {
              setInstructor((prev) => {
                const instName = prev.name || initialInstructor.name || "Instructor";
                const instNameAr = prev.nameAr || initialInstructor.nameAr || instName;
                const instAvatar = prev.avatar || discoveredAvatar || initialInstructor.avatar;

                const formattedStudioCourses = studioList.map((c: any) =>
                  formatCourse(c, instName, instNameAr, instAvatar)
                );

                const existingIds = new Set(formattedStudioCourses.map((c: any) => String(c.id)));
                const remainingPublic = (prev.courses || []).filter((c: any) => !existingIds.has(String(c.id)));
                const combined = [...formattedStudioCourses, ...remainingPublic];

                return {
                  ...prev,
                  courses: combined,
                };
              });
            }
          } catch (studioErr) {
            console.warn("Could not fetch authenticated instructor courses:", studioErr);
          }
        }
      } catch (err) {
        console.warn("Could not load public instructor courses:", err);
      }
    }

    loadInstructorCourses();

    return () => {
      isSubscribed = false;
    };
  }, [initialInstructor, authUser, locale]);

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (e) {
        console.error("Clipboard copy error:", e);
      }
    }
  };

  const courses = instructor.courses || [];
  const socials = instructor.socials;

  const displayName = getLocalizedName(instructor.name, instructor.nameAr, isAr);
  const displayHeadline = getLocalizedHeadline(
    isAr ? instructor.headlineAr || instructor.headline : instructor.headline,
    isAr,
    true
  );
  const displaySpecialization = getLocalizedSpecialization(
    isAr ? instructor.specializationAr || instructor.specialization : instructor.specialization,
    isAr
  );
  
  const rawLocation = isAr ? (instructor.locationAr || instructor.location) : (instructor.location || instructor.locationAr);
  const displayLocation = rawLocation?.trim() || "";

  const rawHourlyRate = isAr ? (instructor.hourlyRateAr || instructor.hourlyRate) : (instructor.hourlyRate || instructor.hourlyRateAr);
  const displayHourlyRate = rawHourlyRate?.trim() || "";

  const displayBio = getLocalizedBio(
    instructor.bio,
    instructor.bioAr,
    isAr
  );

  const displaySkills = (
    (isAr ? instructor.skillsAr : instructor.skills) ||
    instructor.skills ||
    []
  )
    .filter(Boolean)
    .map((s) => getLocalizedSkill(s, isAr));

  const initialLetter = (displayName || "U").trim().charAt(0).toUpperCase();

  const hasSocials = Boolean(
    socials?.github || socials?.linkedin || socials?.website || socials?.email || socials?.twitter
  );

  const hasCourses = courses.length > 0;
  const hasQuickStats = hasCourses;
  const hasSidebar = Boolean(hasQuickStats || hasSocials);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-800 font-sans" dir={isAr ? "rtl" : "ltr"}>
      
      {/* ================= BREADCRUMBS ================= */}
      <div className="border-b border-slate-200/70 bg-white sticky top-0 z-30 shadow-2xs backdrop-blur-md bg-white/95">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link href={`/${locale}`} className="hover:text-[#0F5244] transition-colors">
              {t("breadcrumbHome")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180 text-slate-300 shrink-0" />
            <Link href={`/${locale}/courses`} className="hover:text-[#0F5244] transition-colors">
              {t("breadcrumbCatalog")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180 text-slate-300 shrink-0" />
            <span className="text-slate-400">{t("breadcrumbInstructors")}</span>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180 text-slate-300 shrink-0" />
            <span suppressHydrationWarning className="text-[#0F5244] font-bold truncate max-w-xs sm:max-w-md">
              {displayName}
            </span>
          </nav>
        </div>
      </div>

      {/* ================= MAIN PROFILE CONTAINER ================= */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Master Profile Container Card */}
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
          
          {/* 1. TOP PROFILE HEADER */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Left/Start: Avatar + Details */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-slate-50 border-2 border-slate-200/80 overflow-hidden flex items-center justify-center shadow-xs">
                    {instructor.avatar ? (
                      <div className="w-full h-full relative">
                        <Image
                          src={instructor.avatar}
                          alt={displayName}
                          fill
                          sizes="112px"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-[#E6F3EF] to-[#D5EDE6] flex items-center justify-center text-[#0F5244]">
                        <span suppressHydrationWarning className="text-3xl sm:text-4xl font-extrabold select-none">
                          {initialLetter}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Name, Verified Badge & Location */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 suppressHydrationWarning className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {displayName}
                    </h1>
                    <VerifiedBadge size="sm" tooltipText={t("verifiedTooltip")} />
                  </div>

                  {/* Headline or Specialization */}
                  {Boolean(displayHeadline || displaySpecialization) && (
                    <p suppressHydrationWarning className="text-xs sm:text-sm font-semibold text-slate-600">
                      {displayHeadline || displaySpecialization}
                    </p>
                  )}

                  {/* Location & Optional Hourly Rate */}
                  <div className="flex items-center gap-3 pt-0.5 flex-wrap">
                    {displayLocation && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span suppressHydrationWarning>{displayLocation}</span>
                      </div>
                    )}

                    {displayHourlyRate && (
                      <span suppressHydrationWarning className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-emerald-50 text-[#0F5244] text-[11px] font-bold border border-emerald-200">
                        {displayHourlyRate}
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Right/End Actions: Share & Explore Courses */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto self-stretch md:self-center">
                <button
                  onClick={handleShare}
                  type="button"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700">{t("copied")}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5 text-slate-500" />
                      <span>{t("share")}</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/${locale}/courses`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                >
                  <BookOpen className="h-3.5 w-3.5 text-[#45D1B4]" />
                  <span>{t("exploreCourses")}</span>
                </Link>
              </div>

            </div>
          </div>

          {/* 2. TWO-COLUMN SPLIT LAYOUT (Sticky Sidebar + Main Content) */}
          <div className={`grid grid-cols-1 ${hasSidebar ? "lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x rtl:lg:divide-x-reverse divide-slate-100" : ""}`}>
            
            {/* ================= MODULAR SIDEBAR COLUMN ================= */}
            {hasSidebar && (
              <aside className="lg:col-span-4 p-5 sm:p-7 space-y-4 bg-slate-50/50">
                <div className="lg:sticky lg:top-24 space-y-4">
                  
                  {/* Modular Card 1: Key Quick Stats */}
                  {hasQuickStats && (
                    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 sm:p-5 shadow-xs space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-[#0F5244]" />
                        <span>{t("quickHighlights")}</span>
                      </h4>

                      <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                        <span className="text-slate-400 font-medium block text-[11px]">
                          {t("activeCourses")}
                        </span>
                        <span className="text-base font-extrabold text-slate-900 tracking-tight mt-0.5 block">
                          {courses.length}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Modular Card: Linked Accounts & Direct Contact */}
                  {hasSocials && (
                    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 sm:p-5 shadow-xs space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-[#0F5244]" />
                        <span>{t("linkedAccounts")}</span>
                      </h4>
                      <div className="space-y-2">
                        {socials?.github && (
                          <a
                            href={socials.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-[#E6F3EF] border border-slate-200/70 hover:border-[#A7E2D4] flex items-center justify-between transition-all shadow-2xs group cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Github className="h-4 w-4 text-slate-800" />
                              <span className="font-bold text-xs text-slate-800">GitHub</span>
                            </div>
                            <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-[#0F5244] transition-colors" />
                          </a>
                        )}

                        {socials?.linkedin && (
                          <a
                            href={socials.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-[#E6F3EF] border border-slate-200/70 hover:border-[#A7E2D4] flex items-center justify-between transition-all shadow-2xs group cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Linkedin className="h-4 w-4 text-[#0077B5]" />
                              <span className="font-bold text-xs text-slate-800">LinkedIn</span>
                            </div>
                            <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-[#0F5244] transition-colors" />
                          </a>
                        )}

                        {socials?.twitter && (
                          <a
                            href={socials.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-[#E6F3EF] border border-slate-200/70 hover:border-[#A7E2D4] flex items-center justify-between transition-all shadow-2xs group cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                              <span className="font-bold text-xs text-slate-800">Twitter / X</span>
                            </div>
                            <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-[#0F5244] transition-colors" />
                          </a>
                        )}

                        {socials?.website && (
                          <a
                            href={socials.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-[#E6F3EF] border border-slate-200/70 hover:border-[#A7E2D4] flex items-center justify-between transition-all shadow-2xs group cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-[#0F5244]" />
                              <span className="font-bold text-xs text-slate-800">{t("website")}</span>
                            </div>
                            <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-[#0F5244] transition-colors" />
                          </a>
                        )}

                        {socials?.email && (
                          <a
                            href={`mailto:${socials.email}`}
                            className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-[#E6F3EF] border border-slate-200/70 hover:border-[#A7E2D4] flex items-center justify-between transition-all shadow-2xs group cursor-pointer"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Mail className="h-4 w-4 text-[#0F5244] shrink-0" />
                              <span className="font-bold text-xs text-slate-800 truncate">{socials.email}</span>
                            </div>
                            <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-[#0F5244] transition-colors shrink-0" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </aside>
            )}

            {/* ================= RIGHT MAIN CONTENT COLUMN ================= */}
            <section className={`${hasSidebar ? "lg:col-span-8" : "lg:col-span-12"} min-w-0 max-w-full overflow-hidden p-6 sm:p-8 space-y-8 bg-white`}>
              
              {/* Bio / About Overview */}
              {displayBio && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Quote className="h-4 w-4 text-[#0F5244]" />
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {t("aboutCoach")}
                    </h3>
                  </div>
                  <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 leading-relaxed font-normal space-y-2.5">
                    {displayBio.split("\n").map((paragraph, idx) =>
                      paragraph.trim() ? (
                        <p key={idx} suppressHydrationWarning>
                          {paragraph}
                        </p>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {/* ================= COURSES SECTION ================= */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#0F5244]" />
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {t("coursesTitle", { count: courses.length })}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Navigation Buttons for Single-Row Carousel */}
                    {courses.length > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleScroll("prev")}
                          disabled={!canScrollPrev}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 hover:border-[#A7E2D4] hover:bg-[#E6F3EF] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-slate-200 text-slate-700 transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed shadow-2xs active:scale-95"
                          aria-label="Previous Course"
                        >
                          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleScroll("next")}
                          disabled={!canScrollNext}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 hover:border-[#A7E2D4] hover:bg-[#E6F3EF] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-slate-200 text-slate-700 transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed shadow-2xs active:scale-95"
                          aria-label="Next Course"
                        >
                          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {courses.length === 0 ? (
                  /* Compact & Clean Empty state for courses */
                  <div className="rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/50 p-6 sm:p-7 text-center space-y-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#0F5244] border border-emerald-100 flex items-center justify-center mx-auto shadow-2xs">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                        {t("noCoursesTitle")}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        {t("noCoursesDesc")}
                      </p>
                    </div>
                    <Link
                      href={`/${locale}/courses`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold transition-all shadow-2xs active:scale-95"
                    >
                      <span>{t("browseCatalog")}</span>
                      <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                    </Link>
                  </div>
                ) : (
                  /* Single-Row Horizontal Carousel of Published Courses */
                  <div
                    ref={coursesScrollRef}
                    onScroll={checkScroll}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    onClickCapture={(e) => {
                      if (hasDraggedRef.current) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                    className={`flex gap-4 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-proximity select-none scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                      isCursorGrabbing ? "cursor-grabbing" : "cursor-grab"
                    }`}
                  >
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        data-course-card
                        className="w-[205px] sm:w-[220px] md:w-[230px] shrink-0 snap-start transition-transform hover:-translate-y-0.5 duration-150"
                      >
                        <CompactInstructorCourseCard course={course} isAr={isAr} locale={locale} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ================= SKILLS SECTION ================= */}
              {displaySkills.length > 0 && (
                <div className="space-y-3.5 pt-1">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Layers className="h-4 w-4 text-[#0F5244]" />
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {t("skillsTitle")}
                    </h3>
                  </div>

                  {/* Modern Refined Badges */}
                  <div className="flex flex-wrap gap-2">
                    {displaySkills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/70 text-emerald-800 border border-emerald-200/60 hover:border-emerald-300 text-xs font-medium transition-all duration-150 shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= REVIEWS SECTION ================= */}
              {instructor.reviews && instructor.reviews.length > 0 && (
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        {t("reviewsTitle", { count: instructor.reviews.length })}
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-800">
                      <span>{instructor.rating || 5.0}</span>
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    </span>
                  </div>

                  <div className="space-y-3">
                    {instructor.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl border border-slate-200/70 bg-[#FBFDFB] space-y-2 shadow-2xs hover:border-slate-300/80 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              {isAr ? rev.studentNameAr : rev.studentName}
                            </span>
                            <div className="flex items-center text-amber-400">
                              {[...Array(rev.rating || 5)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-current" />
                              ))}
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400">{isAr ? rev.dateAr : rev.date}</span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed italic font-normal">
                          &ldquo;{isAr ? rev.commentAr : rev.comment}&rdquo;
                        </p>

                        <div className="text-[11px] text-slate-400 font-semibold pt-1">
                          {t("courseLabel", { title: isAr ? rev.courseTitleAr || rev.courseTitle : rev.courseTitle || rev.courseTitleAr })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </section>

          </div>

        </div>

      </main>

    </div>
  );
}
