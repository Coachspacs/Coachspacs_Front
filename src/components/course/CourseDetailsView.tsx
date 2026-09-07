"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import { 
  Users, 
  PlayCircle, 
  Lock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Clock, 
  FileText, 
  Tv, 
  Award, 
  ShoppingCart, 
  Check, 
  Play,
  User as UserIcon,
  ExternalLink,
  ShieldCheck,
  Award as AwardIcon
} from "lucide-react";
import { Course } from "@/types/catalog";
import { RootState } from "@/lib/store";
import { addToCart, syncCartFromStorage } from "@/features/cart/cartSlice";
import { Toast } from "@/components/ui/Toast";
import { VideoPreviewModal } from "./VideoPreviewModal";
import { LockedLessonModal } from "./LockedLessonModal";
import { normalizeInstructorSlug, getPublicInstructorByIdOrSlug } from "@/lib/instructorProfile";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

interface CourseDetailsViewProps {
  course: Course;
}

export function CourseDetailsView({ course }: CourseDetailsViewProps) {
  const t = useTranslations("course");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const router = useRouter();
  const dispatch = useDispatch();

  const instructorId =
    course.instructorId ||
    (typeof course.instructor === "object" ? course.instructor?.id : undefined) ||
    (course as any).instructor_id;
  const instructorTarget = instructorId ? String(instructorId) : normalizeInstructorSlug(course.instructorName || "");
  const instructorObj = instructorTarget ? getPublicInstructorByIdOrSlug(instructorTarget) : null;

  // Redux Auth & Cart states
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart?.items || []);

  // State checks: STRICTLY ID-BASED
  const isInstructor = Boolean(isAuthenticated && ((user?.role || "").toLowerCase() === "instructor" || (user?.role || "").toLowerCase() === "coach"));
  const isOwner = Boolean(
    isInstructor &&
      user?.id &&
      instructorId &&
      String(instructorId) === String(user.id)
  );
  const isFree = course.price === 0 || course.priceFormatted === "Free" || course.priceFormatted === "مجاني";
  const isInCart = cartItems.some(
    (item: any) =>
      String(item.course?.id || item.courseId || item.id) === String(course.id) ||
      (course.slug && String(item.course?.slug || item.slug) === String(course.slug))
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync cart state from storage on mount
  useEffect(() => {
    dispatch(syncCartFromStorage());
  }, [dispatch]);

  // Enrolled check from API response (GET /api/catalog/courses/:id returns is_enrolled) or localStorage
  const [isEnrolled, setIsEnrolled] = useState(Boolean(course.is_enrolled || (course as any).isEnrolled));

  // Sync with local enrolled courses storage
  useEffect(() => {
    if (typeof window !== "undefined" && course?.id) {
      try {
        const saved = localStorage.getItem("coachspace_enrolled_courses");
        if (saved) {
          const list = JSON.parse(saved);
          if (Array.isArray(list) && list.some((c: any) => String(c.id) === String(course.id))) {
            setIsEnrolled(true);
          }
        }
      } catch (err) {
        console.warn("[CourseDetailsView] Could not check enrollment from storage:", err);
      }
    }
  }, [course?.id]);

  // Tabs state
  const [activeTab, setActiveTab] = useState<"curriculum" | "description" | "instructor">("curriculum");

  // Accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    section1: true,
    section2: false,
    section3: false,
  });

  // Modal states
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | undefined>(undefined);
  const [lockedModalOpen, setLockedModalOpen] = useState(false);
  const [lockedLessonTitle, setLockedLessonTitle] = useState("");

  const toggleSection = (secId: string) => {
    setOpenSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  const handleAddToCart = () => {
    dispatch(addToCart(course as any));
    setToastMessage(isAr ? "تمت إضافة الدورة إلى سلة التسوق" : "Course added to cart successfully");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBuyNow = () => {
    if (!isInCart) {
      dispatch(addToCart(course as any));
    }
    router.push(`/${locale}/student/checkout`);
  };

  const handleFreeEnroll = () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login?redirect=/${locale}/courses/${course.id}`);
      return;
    }

    // Persist enrolled course to localStorage so student dashboard & course details stay synchronized
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("coachspace_enrolled_courses");
        const list = saved ? JSON.parse(saved) : [];
        if (!list.some((c: any) => String(c.id) === String(course.id))) {
          list.unshift({
            id: String(course.id),
            title: isAr ? course.titleAr || course.title : course.title,
            instructor: isAr
              ? instructorObj?.nameAr || course.instructorNameAr || course.instructorName
              : instructorObj?.name || course.instructorName,
            image:
              course.coverImage ||
              course.image ||
              "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
            progress: 0,
            isCompleted: false,
            enrolledAt: new Date().toISOString(),
            certificateId: `CERT-${Math.floor(100000 + Math.random() * 900000)}`,
          });
          localStorage.setItem("coachspace_enrolled_courses", JSON.stringify(list));
        }
      } catch (e) {
        console.warn("Failed to save enrollment:", e);
      }
    }

    setIsEnrolled(true);
    // Direct immediately to the interactive learning classroom player!
    router.push(`/${locale}/student/learn/${course.id}`);
  };

  const handleGoToCourse = () => {
    router.push(`/${locale}/student/learn/${course.id}`);
  };

  const handleOpenPreview = (title: string, videoUrl?: string) => {
    setPreviewTitle(title);
    setPreviewVideoUrl(videoUrl);
    setPreviewModalOpen(true);
  };

  const handleOpenLocked = (title: string) => {
    setLockedLessonTitle(title);
    setLockedModalOpen(true);
  };

  // Curriculum Data Structure strictly from real API response
  const curriculumSections = Array.isArray(course.sections) ? course.sections : [];

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="w-full bg-[#FAFBFB] min-h-screen py-6 sm:py-10">
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      
      {/* Modals */}
      <VideoPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={previewTitle}
        videoUrl={previewVideoUrl}
      />

      <LockedLessonModal
        isOpen={lockedModalOpen}
        onClose={() => setLockedModalOpen(false)}
        onEnroll={() => {
          handleBuyNow();
        }}
        lessonTitle={lockedLessonTitle}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* 1. Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 mb-6">
          <Link href={`/${locale}/courses`} className="hover:text-[#0F5244] transition-colors">
            {t("browseCourses")}
          </Link>
          <span>/</span>
          <span className="hover:text-[#0F5244] transition-colors">
            {isAr ? course.categoryAr || course.category : course.category}
          </span>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">
            {isAr ? course.titleAr || course.title : course.title}
          </span>
        </nav>

        {/* Main Grid: Left Main Content (Col 8) & Right Sidebar (Col 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ================= LEFT MAIN CONTENT ================= */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Main Video / Banner Preview Container */}
            <div className="relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200/80 group">
              <Image
                src={course.coverImage || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"}
                alt={(isAr ? course.titleAr || course.title : course.title) || "Course Cover"}
                width={1200}
                height={675}
                priority
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
              
              {/* Play Overlay Button */}
              <button
                type="button"
                onClick={() => {
                  const firstPreviewLesson = curriculumSections
                    .flatMap((s: any) => s.lessons || [])
                    .find((l: any) => l.isPreview && (l.videoUrl || l.video_url));
                  handleOpenPreview(
                    t("coursePreview"),
                    firstPreviewLesson?.videoUrl || firstPreviewLesson?.video_url
                  );
                }}
                className="absolute inset-0 flex items-center justify-center group/btn cursor-pointer"
                aria-label="Play Preview"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 text-[#0F5244] shadow-2xl flex items-center justify-center group-hover/btn:scale-110 group-hover/btn:bg-white transition-all duration-300 backdrop-blur-xs">
                  <Play className="h-7 w-7 sm:h-9 sm:w-9 fill-[#0F5244] ml-1 rtl:mr-1 rtl:ml-0" />
                </div>
              </button>
            </div>

            {/* Course Meta Info */}
            <div className="space-y-4">
              {/* Badges */}
              <div className="flex items-center gap-2.5">
                {course.badge && (
                  <span className="bg-[#45D1B4] text-slate-900 text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider shadow-2xs">
                    {course.badge}
                  </span>
                )}
                {course.isRealBackend && (
                  <span className="bg-emerald-100 text-[#0F5244] text-xs font-black px-3 py-1 rounded-md tracking-wider">
                    {t("verifiedCourse")}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {isAr ? course.titleAr || course.title : course.title}
              </h1>

              {/* Subtitle / Real Course Description */}
              {(course.description || course.descriptionAr) && (
                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                  {isAr ? course.descriptionAr || course.description : course.description || course.descriptionAr}
                </p>
              )}

              {/* Instructor & Rating Row */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm text-slate-600 font-medium">
                {/* Instructor Link */}
                <Link
                  href={`/${locale}/instructors/${instructorTarget}`}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/${locale}/instructors/${instructorTarget}`);
                  }}
                  className="flex items-center gap-2.5 group/inst hover:opacity-90 transition-all cursor-pointer"
                  title={t("viewInstructorProfile")}
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-50 overflow-hidden relative border border-emerald-200/80 group-hover/inst:ring-2 group-hover/inst:ring-[#0F5244] group-hover/inst:scale-105 transition-all flex items-center justify-center text-xs font-black text-[#0F5244]">
                    {instructorObj?.avatar || course.instructorAvatar ? (
                      <Image
                        src={instructorObj?.avatar || course.instructorAvatar || ""}
                        alt={isAr ? (instructorObj?.nameAr || course.instructorNameAr || course.instructorName || "") : (instructorObj?.name || course.instructorName || "")}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{((isAr ? (instructorObj?.nameAr || course.instructorNameAr || course.instructorName) : (instructorObj?.name || course.instructorName)) || "U").trim().charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-900 block leading-none group-hover/inst:text-[#0F5244] group-hover/inst:underline transition-colors">
                        {isAr ? (instructorObj?.nameAr || course.instructorNameAr || course.instructorName) : (instructorObj?.name || course.instructorName)}
                      </span>
                      <VerifiedBadge size="xs" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium group-hover/inst:text-slate-600 transition-colors">
                      {isAr ? (course.instructorRoleAr || instructorObj?.headlineAr || t("leadRole")) : (course.instructorRole || instructorObj?.headline || t("leadRole"))}
                    </span>
                  </div>
                </Link>



                {/* Enrolled Count */}
                <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span>
                    {`${course.studentsCount || 0} ${t("enrolled")}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-slate-200 pt-4">
              <div className="flex items-center gap-8">
                <button
                  type="button"
                  onClick={() => setActiveTab("curriculum")}
                  className={`pb-3 text-sm sm:text-base font-extrabold transition-all relative ${
                    activeTab === "curriculum"
                      ? "text-[#0F5244]"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t("curriculum")}
                  {activeTab === "curriculum" && (
                    <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#0F5244] rounded-t-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("description")}
                  className={`pb-3 text-sm sm:text-base font-extrabold transition-all relative ${
                    activeTab === "description"
                      ? "text-[#0F5244]"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t("description")}
                  {activeTab === "description" && (
                    <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#0F5244] rounded-t-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("instructor")}
                  className={`pb-3 text-sm sm:text-base font-extrabold transition-all relative ${
                    activeTab === "instructor"
                      ? "text-[#0F5244]"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t("instructor")}
                  {activeTab === "instructor" && (
                    <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#0F5244] rounded-t-full" />
                  )}
                </button>


              </div>
            </div>

            {/* Tab 1: CURRICULUM SECTION */}
            {activeTab === "curriculum" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {curriculumSections.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                    <Tv className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-extrabold text-slate-800">
                      {t("noCurriculumLessons")}
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      {t("curriculumComingSoon")}
                    </p>
                  </div>
                ) : (
                  curriculumSections.map((sec: any) => {
                    const isOpen = openSections[sec.id] ?? true;
                    return (
                      <div
                        key={sec.id}
                        className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs transition-all"
                      >
                        {/* Section Accordion Header */}
                        <button
                          type="button"
                          onClick={() => toggleSection(sec.id)}
                          className="w-full p-4 sm:p-5 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-left rtl:text-right"
                        >
                          <div>
                            <h3 className="text-sm sm:text-base font-black text-slate-900">
                              {isAr ? sec.titleAr || sec.titleEn || sec.title : sec.titleEn || sec.titleAr || sec.title}
                            </h3>
                            <p className="text-xs font-semibold text-slate-400 mt-0.5">
                              {isAr ? sec.durationAr || t("lessonsCount", { count: sec.lessons?.length || 0 }) : sec.durationEn || t("lessonsCount", { count: sec.lessons?.length || 0 })}
                            </p>
                          </div>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-slate-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-500" />
                          )}
                        </button>

                        {/* Lesson Items */}
                        {isOpen && (
                          <div className="divide-y divide-slate-100 border-t border-slate-100">
                            {(sec.lessons || []).length === 0 ? (
                              <div className="p-4 text-center text-xs text-slate-400 font-medium">
                                {t("noLessonsInSection")}
                              </div>
                            ) : (
                              sec.lessons.map((lesson: any) => (
                                <div
                                  key={lesson.id}
                                  className="p-4 sm:p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                  onClick={() => {
                                    if (lesson.isPreview) {
                                      handleOpenPreview(
                                        isAr ? lesson.titleAr || lesson.titleEn || lesson.title : lesson.titleEn || lesson.titleAr || lesson.title,
                                        lesson.videoUrl || lesson.video_url
                                      );
                                    } else {
                                      handleOpenLocked(
                                        isAr ? lesson.titleAr || lesson.titleEn || lesson.title : lesson.titleEn || lesson.titleAr || lesson.title
                                      );
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    {lesson.isPreview ? (
                                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#0F5244] flex items-center justify-center shrink-0">
                                        <Play className="h-4 w-4 fill-[#0F5244] ml-0.5 rtl:mr-0.5 rtl:ml-0" />
                                      </div>
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                        <Lock className="h-4 w-4" />
                                      </div>
                                    )}

                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#0F5244] transition-colors">
                                          {isAr ? lesson.titleAr || lesson.titleEn || lesson.title : lesson.titleEn || lesson.titleAr || lesson.title}
                                        </span>
                                        {lesson.isPreview && (
                                          <span className="bg-[#E8F3F1] text-[#0F5244] text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-[#0F5244]/10">
                                            {t("previewBadge")}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[11px] font-medium text-slate-400">
                                        {t("videoLabel")} • {lesson.duration}
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    className="text-xs font-bold text-[#0F5244] hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    {lesson.isPreview ? t("playPreview") : t("lockedLesson")}
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 2: DESCRIPTION */}
            {activeTab === "description" && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4 text-slate-600 text-sm leading-relaxed animate-in fade-in duration-200">
                <h3 className="text-lg font-bold text-slate-900">
                  {t("description")}
                </h3>
                <p>
                  {isAr
                    ? (course.descriptionAr || course.description || t("defaultDescription"))
                    : (course.description || course.descriptionAr || t("defaultDescription"))}
                </p>
                {/* Only display learning points if provided by backend data */}
                {Boolean(isAr ? course?.whatYouWillLearnAr?.length : course?.whatYouWillLearn?.length) && (
                  <div className="pt-3 border-t border-slate-100">
                    <h4 className="text-sm font-extrabold text-slate-900 mb-2">{t("whatYouWillLearn")}</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {((isAr ? course?.whatYouWillLearnAr : course?.whatYouWillLearn) || []).map((item: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: INSTRUCTOR PROFILE SPOTLIGHT */}
            {activeTab === "instructor" && (
              <div className="bg-gradient-to-br from-white via-emerald-50/20 to-white rounded-3xl p-6 sm:p-8 border border-emerald-950/10 shadow-sm space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                  <Link
                    href={`/${locale}/instructors/${instructorTarget}`}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/${locale}/instructors/${instructorTarget}`);
                    }}
                    className="flex items-center gap-4 sm:gap-5 group/tabinst cursor-pointer"
                    title={t("viewInstructorProfile")}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 overflow-hidden relative border-2 border-emerald-500/30 shadow-md shrink-0 ring-4 ring-emerald-500/10 group-hover/tabinst:ring-emerald-500/30 group-hover/tabinst:scale-105 transition-all duration-300 flex items-center justify-center">
                      {instructorObj?.avatar || course.instructorAvatar ? (
                        <Image
                          src={instructorObj?.avatar || course.instructorAvatar || ""}
                          alt={isAr ? (instructorObj?.nameAr || course.instructorNameAr || course.instructorName || "") : (instructorObj?.name || course.instructorName || "")}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-100/70 flex items-center justify-center border border-emerald-100/80 text-xl sm:text-2xl font-black text-[#0F5244]">
                          {((isAr ? (instructorObj?.nameAr || course.instructorNameAr || course.instructorName) : (instructorObj?.name || course.instructorName)) || "U").trim().charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-2xl font-black text-slate-900 group-hover/tabinst:text-[#0F5244] group-hover/tabinst:underline transition-colors tracking-tight">
                          {isAr ? (instructorObj?.nameAr || course.instructorNameAr || course.instructorName) : (instructorObj?.name || course.instructorName)}
                        </h3>
                        <VerifiedBadge size="sm" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-500">
                        {isAr ? (course.instructorRoleAr || instructorObj?.headlineAr || t("leadRole")) : (course.instructorRole || instructorObj?.headline || t("leadRole"))}
                      </p>
                      <div className="flex flex-wrap items-center gap-2.5 pt-0.5 text-xs text-slate-600 font-bold">

                        <span className="inline-flex items-center gap-1 text-[#0F5244] bg-[#E8F3F1] px-2 py-0.5 rounded-md">
                          <Users className="h-3.5 w-3.5" />
                          <span>
                            {t("studentsCount", { count: course.studentsCount || 0 })}
                          </span>
                        </span>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href={`/${locale}/instructors/${instructorTarget}`}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/${locale}/instructors/${instructorTarget}`);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer group/btn"
                  >
                    <span>{t("viewFullProfile")}</span>
                    <ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover/btn:translate-x-0.5 rtl:group-hover/btn:-translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="space-y-3 text-sm text-slate-700 font-medium leading-relaxed bg-white/70 p-4 sm:p-5 rounded-2xl border border-slate-100">
                  <p>
                    {isAr
                      ? (instructorObj?.bioAr || t("defaultInstructorBio"))
                      : (instructorObj?.bio || t("defaultInstructorBio"))}
                  </p>
                </div>
              </div>
            )}


          </div>


          {/* ================= RIGHT STICKY SIDEBAR ================= */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Primary Pricing & Checkout Card */}
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xl space-y-6">
              
              {/* Price Header */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {isFree ? (
                    <span className="text-emerald-600 font-extrabold">{t("free")}</span>
                  ) : (
                    course.priceFormatted || `$${course.price}`
                  )}
                </span>
                {course.originalPrice && course.originalPrice > course.price && (
                  <span className="text-base font-semibold text-slate-400 line-through">
                    ${course.originalPrice}
                  </span>
                )}
              </div>

              {/* DYNAMIC ACTION BUTTON STATES (BASED ON USER RULES) */}
              <div className="space-y-3">
                
                {/* CASE 0: User is logged in as Instructor */}
                {isInstructor ? (
                  isOwner ? (
                    <div className="w-full py-4 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2.5">
                      <p className="text-xs font-bold text-emerald-900">
                        {t("youAreInstructor")}
                      </p>
                      <Link
                        href={`/${locale}/instructor/courses/${course.id}/edit`}
                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-[#0F5244] text-white text-xs font-bold hover:bg-[#07382E] transition-colors shadow-xs cursor-pointer"
                      >
                        <span>{t("editInStudio")}</span>
                        <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                      </Link>
                    </div>
                  ) : (
                    <div className="w-full py-4 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                      <p className="text-xs font-bold text-emerald-900">
                        {t("loggedInAsInstructorNotice")}
                      </p>
                      <Link
                        href={`/${locale}/instructor/dashboard`}
                        className="inline-block px-4 py-2 rounded-lg bg-[#0F5244] text-white text-xs font-bold hover:bg-[#07382E] transition-colors cursor-pointer"
                      >
                        {t("goToInstructorDashboard")}
                      </Link>
                    </div>
                  )
                ) : isEnrolled ? (
                  /* CASE 1: Student already enrolled in this course */
                  <button
                    type="button"
                    onClick={handleGoToCourse}
                    className="w-full py-4 px-6 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-base font-extrabold shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t("goToCourse")}</span>
                    <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                  </button>
                ) : isFree ? (
                  /* CASE 2: Free course (Logged in or Guest) -> "Enroll for Free" */
                  <button
                    type="button"
                    onClick={handleFreeEnroll}
                    className="w-full py-4 px-6 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-base font-extrabold shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t("enrollFree")}</span>
                  </button>
                ) : (
                  /* Paid course -> Dynamic Add to Cart / In Cart + Buy Now */
                  <>
                    {isInCart ? (
                      <button
                        type="button"
                        onClick={() => router.push(`/${locale}/student/cart`)}
                        className="w-full py-3.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-base font-extrabold shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer ring-2 ring-emerald-500/30"
                      >
                        <Check className="h-5 w-5" />
                        <span>{isAr ? "في السلة (الانتقال إلى السلة)" : "In Cart (Go to Cart)"}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="w-full py-3.5 px-6 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-base font-extrabold shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        <span>{t("addToCart")}</span>
                      </button>
                    )}
                  </>
                )}

              </div>

              {/* Subtitle Guarantee */}
              <p className="text-center text-xs font-semibold text-slate-400">
                {t("moneyBack")}
              </p>

              {/* Course Includes Checklist */}
              <div className="pt-4 border-t border-slate-100 space-y-3.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  {t("includes")}
                </h4>
                
                <ul className="space-y-2.5 text-xs font-semibold text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#45D1B4] shrink-0" />
                    <span>{t("hoursVideo")}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#45D1B4] shrink-0" />
                    <span>{t("downloadableResources")}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#45D1B4] shrink-0" />
                    <span>{t("lifetimeAccess")}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#45D1B4] shrink-0" />
                    <span>{t("mobileAccess")}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#45D1B4] shrink-0" />
                    <span>{t("certificate")}</span>
                  </li>
                </ul>
              </div>

            </div>

            {/* Need Extra Guidance / Mentor Banner Box (Dark Forest Green) */}
            <div className="rounded-3xl bg-[#0F5244] text-white p-6 shadow-lg space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#45D1B4]/10 rounded-full blur-xl pointer-events-none" />

              <h4 className="text-base font-extrabold tracking-tight">
                {t("needGuidance")}
              </h4>
              <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
                {t("bookSession")}
              </p>
              
              <Link
                href={`/${locale}/mentors`}
                className="inline-flex items-center gap-1.5 text-xs font-black text-[#45D1B4] hover:underline pt-1 group"
              >
                <span>{t("findMentor")}</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
