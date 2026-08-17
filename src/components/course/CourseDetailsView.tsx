"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import { 
  Star, 
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
  User as UserIcon
} from "lucide-react";
import { Course } from "@/types/catalog";
import { RootState } from "@/lib/store";
import { addToCart } from "@/features/cart/cartSlice";
import { VideoPreviewModal } from "./VideoPreviewModal";
import { LockedLessonModal } from "./LockedLessonModal";

interface CourseDetailsViewProps {
  course: Course;
}

export function CourseDetailsView({ course }: CourseDetailsViewProps) {
  const t = useTranslations("course");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const router = useRouter();
  const dispatch = useDispatch();

  // Redux Auth & Cart states
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart?.items || []);

  // State checks
  const isFree = course.price === 0 || course.priceFormatted === "Free" || course.priceFormatted === "مجاني";
  const isInCart = cartItems.some((item: any) => (item.course?.id || item.courseId || item.id) === course.id);
  
  // Enrolled check (mock check: if user has enrolledCourses array containing this ID or user is enrolled)
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Tabs state
  const [activeTab, setActiveTab] = useState<"curriculum" | "description" | "reviews">("curriculum");

  // Accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    section1: true,
    section2: false,
    section3: false,
  });

  // Modal states
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [lockedModalOpen, setLockedModalOpen] = useState(false);
  const [lockedLessonTitle, setLockedLessonTitle] = useState("");

  const toggleSection = (secId: string) => {
    setOpenSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  const handleAddToCart = () => {
    dispatch(addToCart(course as any));
  };

  const handleBuyNow = () => {
    if (!isInCart) {
      dispatch(addToCart(course as any));
    }
  };

  const handleFreeEnroll = () => {
    setIsEnrolled(true);
    router.push(`/${locale}/account`);
  };

  const handleGoToCourse = () => {
    router.push(`/${locale}/account`);
  };

  const handleOpenPreview = (title: string) => {
    setPreviewTitle(title);
    setPreviewModalOpen(true);
  };

  const handleOpenLocked = (title: string) => {
    setLockedLessonTitle(title);
    setLockedModalOpen(true);
  };

  // Curriculum Data Structure
  const curriculumSections = [
    {
      id: "section1",
      titleEn: "Section 1: Getting Started",
      titleAr: "القسم الأول: البدء والأساسيات",
      durationEn: "3 lectures • 45 min",
      durationAr: "3 دروس • 45 دقيقة",
      lessons: [
        {
          id: "l-1",
          titleEn: "Introduction to Modern UI Patterns",
          titleAr: "مقدمة في أنماط واجهات المستخدم الحديثة",
          duration: "12:35",
          isPreview: true,
        },
        {
          id: "l-2",
          titleEn: "Setting up your Figma Workspace",
          titleAr: "إعداد ومواصفات مساحة العمل في فيجما",
          duration: "18:45",
          isPreview: true,
        },
        {
          id: "l-3",
          titleEn: "Understanding Design Tokens & Color Systems",
          titleAr: "فهم ترميز أنظمة الألوان ومتغيرات التصميم",
          duration: "14:10",
          isPreview: false,
        },
      ],
    },
    {
      id: "section2",
      titleEn: "Section 2: Core Concepts & Layout Architecture",
      titleAr: "القسم الثاني: المفاهيم الأساسية وهيكلة الواجهات",
      durationEn: "5 lectures • 1 hr 20 min",
      durationAr: "5 دروس • ساعة و20 دقيقة",
      lessons: [
        {
          id: "l-4",
          titleEn: "Mastering Auto-Layout & Dynamic Spacing",
          titleAr: "احتراف التخطيط التلقائي المسافات الديناميكية",
          duration: "22:15",
          isPreview: false,
        },
        {
          id: "l-5",
          titleEn: "Typography Hierarchies & Readability Rules",
          titleAr: "تسلسل الخطوط والطباعة وقواعد المقروئية",
          duration: "19:40",
          isPreview: false,
        },
      ],
    },
    {
      id: "section3",
      titleEn: "Section 3: Building a Real Project & Micro-interactions",
      titleAr: "القسم الثالث: بناء مشروع حقيقي والتفاعلات الدقيقة",
      durationEn: "4 lectures • 2 hrs 15 min",
      durationAr: "4 دروس • ساعتان و15 دقيقة",
      lessons: [
        {
          id: "l-6",
          titleEn: "Prototyping Complex Component States",
          titleAr: "بناء النماذج التفاعلية المعقدة للمكونات",
          duration: "35:10",
          isPreview: false,
        },
      ],
    },
  ];

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="w-full bg-[#FAFBFB] min-h-screen py-6 sm:py-10">
      
      {/* Modals */}
      <VideoPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={previewTitle}
      />

      <LockedLessonModal
        isOpen={lockedModalOpen}
        onClose={() => setLockedModalOpen(false)}
        onEnroll={handleAddToCart}
        lessonTitle={lockedLessonTitle}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* 1. Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 mb-6">
          <Link href={`/${locale}/catalog`} className="hover:text-[#0F5244] transition-colors">
            {isAr ? "تصفح الدورات" : "Browse"}
          </Link>
          <span>/</span>
          <span className="hover:text-[#0F5244] transition-colors">
            {isAr ? course.categoryAr : course.category}
          </span>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">
            {isAr ? course.titleAr : course.title}
          </span>
        </nav>

        {/* Main Grid: Left Main Content (Col 8) & Right Sidebar (Col 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ================= LEFT MAIN CONTENT ================= */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Main Video / Banner Preview Container */}
            <div className="relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200/80 group">
              <img
                src={course.coverImage || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"}
                alt={isAr ? course.titleAr : course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
              
              {/* Play Overlay Button */}
              <button
                type="button"
                onClick={() => handleOpenPreview(isAr ? "معاينة الدورة" : "Course Preview")}
                className="absolute inset-0 flex items-center justify-center group/btn"
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
                <span className="bg-[#45D1B4] text-slate-900 text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider shadow-2xs">
                  {isAr ? "الأكثر مبيعاً" : "Bestseller"}
                </span>
                <span className="bg-emerald-100 text-[#0F5244] text-xs font-black px-3 py-1 rounded-md tracking-wider">
                  {isAr ? "تحديث أكتوبر 2025" : "Updated Oct 2025"}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {isAr ? course.titleAr : course.title}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                {isAr
                  ? "احترف فن إنشاء واجهات مستخدم بديهية وعالية التحويل باستخدام المبادئ النفسية الحديثة وأنظمة التصميم المتقدمة."
                  : "Master the art of creating intuitive, high-converting user interfaces using modern psychological principles and cutting-edge design systems."}
              </p>

              {/* Instructor & Rating Row */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm text-slate-600 font-medium">
                {/* Instructor */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden relative border border-slate-300">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
                      alt={isAr ? course.instructorNameAr : course.instructorName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block leading-none">
                      {isAr ? course.instructorNameAr : course.instructorName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {isAr ? (course.instructorRoleAr || t("leadRole")) : (course.instructorRole || t("leadRole"))}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-lg">
                  <span className="font-extrabold text-slate-900">{course.rating.toFixed(1)}</span>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-slate-500 font-semibold text-xs">({course.reviewsCountFormatted} {t("reviewsCount")})</span>
                </div>

                {/* Enrolled Count */}
                <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span>15,302 {t("enrolled")}</span>
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
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-3 text-sm sm:text-base font-extrabold transition-all relative ${
                    activeTab === "reviews"
                      ? "text-[#0F5244]"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t("reviews")}
                  {activeTab === "reviews" && (
                    <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#0F5244] rounded-t-full" />
                  )}
                </button>
              </div>
            </div>

            {/* Tab 1: CURRICULUM SECTION */}
            {activeTab === "curriculum" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {curriculumSections.map((sec) => {
                  const isOpen = openSections[sec.id] ?? false;
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
                            {isAr ? sec.titleAr : sec.titleEn}
                          </h3>
                          <p className="text-xs font-semibold text-slate-400 mt-0.5">
                            {isAr ? sec.durationAr : sec.durationEn}
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
                          {sec.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="p-4 sm:p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group cursor-pointer"
                              onClick={() => {
                                if (lesson.isPreview) {
                                  handleOpenPreview(isAr ? lesson.titleAr : lesson.titleEn);
                                } else {
                                  handleOpenLocked(isAr ? lesson.titleAr : lesson.titleEn);
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
                                      {isAr ? lesson.titleAr : lesson.titleEn}
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
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: DESCRIPTION */}
            {activeTab === "description" && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4 text-slate-600 text-sm leading-relaxed animate-in fade-in duration-200">
                <h3 className="text-lg font-bold text-slate-900">
                  {t("whatYouWillLearn")}
                </h3>
                <p>
                  {isAr
                    ? (course.descriptionAr || t("defaultDescription"))
                    : (course.description || t("defaultDescription"))}
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {(isAr
                    ? (course.whatYouWillLearnAr || [
                        t("learnItem1"),
                        t("learnItem2"),
                        t("learnItem3"),
                        t("learnItem4"),
                      ])
                    : (course.whatYouWillLearn || [
                        t("learnItem1"),
                        t("learnItem2"),
                        t("learnItem3"),
                        t("learnItem4"),
                      ])
                  ).map((item: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tab 3: REVIEWS */}
            {activeTab === "reviews" && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-black text-slate-900">{course.rating.toFixed(1)}</div>
                  <div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {t("basedOnReviews")}
                    </span>
                  </div>
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
                    <span className="text-emerald-600 font-extrabold">{isAr ? "مجاني" : "Free"}</span>
                  ) : (
                    course.priceFormatted
                  )}
                </span>
                {!isFree && (
                  <span className="text-base font-semibold text-slate-400 line-through">
                    $199.99
                  </span>
                )}
              </div>

              {/* DYNAMIC ACTION BUTTON STATES (BASED ON USER RULES) */}
              <div className="space-y-3">
                
                {/* CASE 1: Student already enrolled in this course */}
                {isEnrolled ? (
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
                  /* Paid course -> Always show "Add to Cart" + "Buy Now" */
                  <>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-base font-extrabold shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span>{t("addToCart")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="w-full py-3 px-6 rounded-xl bg-white border-2 border-[#0F5244] text-[#0F5244] hover:bg-[#0F5244]/5 text-sm font-extrabold transition-all active:scale-98 flex items-center justify-center cursor-pointer"
                    >
                      <span>{t("buyNow")}</span>
                    </button>
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
