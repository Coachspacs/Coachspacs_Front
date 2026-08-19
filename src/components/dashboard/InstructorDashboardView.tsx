"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  BookOpen,
  Users,
  DollarSign,
  Star,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Archive,
  Send,
  Edit,
  Trash2,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  PlayCircle,
  FileText,
  AlertTriangle,
  Sparkles,
  X,
  Upload
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArchiveCourseModal } from "@/components/modals/ArchiveCourseModal";

export function InstructorDashboardView() {
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const tInst = useTranslations("instructorSettings");

  // Active Tab
  const [activeTab, setActiveTab] = useState<"courses" | "students" | "analytics">("courses");
  const [courseSearch, setCourseSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State for Course Editor & Curriculum Builder (US-08, US-09)
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [archiveModalCourseId, setArchiveModalCourseId] = useState<string | null>(null);

  // Instructor Courses State (US-08 Lifecycle: Draft, Pending Review, Published, Rejected, Archived)
  const [courses, setCourses] = useState([
    {
      id: "c-1",
      titleAr: "دورة احتراف React 19 و Next.js",
      titleEn: "React 19 & Next.js Masterclass",
      category: "Development",
      level: "Intermediate",
      price: 49.99,
      studentsCount: 340,
      rating: 4.9,
      status: "published", // published
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop",
      rejectionReason: "",
      sections: [
        {
          id: "sec-1",
          title: isAr ? "الفصل 1: الأساسيات والمثبتات" : "Section 1: Setup & Fundamentals",
          lessons: [
            { id: "les-1", title: isAr ? "مقدمة الدورة والمشروع" : "Course Overview", videoType: "mp4", isFreePreview: true },
            { id: "les-2", title: isAr ? "إعداد بيئة عمل Next.js 15" : "Next.js 15 Environment", videoType: "youtube", isFreePreview: false },
          ]
        }
      ]
    },
    {
      id: "c-2",
      titleAr: "تطبيقات الذكاء الاصطناعي بلغة Python",
      titleEn: "Applied AI with Python",
      category: "Data Science",
      level: "Advanced",
      price: 79.99,
      studentsCount: 120,
      rating: 4.8,
      status: "pending_review", // pending review
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop",
      rejectionReason: "",
      sections: []
    },
    {
      id: "c-3",
      titleAr: "دليل تصميم أنظمة UI/UX المتكاملة",
      titleEn: "Complete UI/UX Design System Guide",
      category: "Design",
      level: "Beginner",
      price: 39.99,
      studentsCount: 0,
      rating: 0.0,
      status: "rejected", // rejected (US-08)
      image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=600&auto=format&fit=crop",
      rejectionReason: isAr
        ? "يرجى إضافة فيديو تعريفي بجودة HD عالية وإضافة 3 دروس مجانية على الأقل للمعاينة قبل الاعتماد."
        : "Please upload HD promo video and add at least 3 free preview lessons.",
      sections: []
    },
    {
      id: "c-4",
      titleAr: "أساسيات البرمجة بلغة C++ للمبتدئين",
      titleEn: "C++ Programming Basics",
      category: "Development",
      level: "Beginner",
      price: 29.99,
      studentsCount: 85,
      rating: 4.5,
      status: "archived", // archived (US-08)
      image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=600&auto=format&fit=crop",
      rejectionReason: "",
      sections: []
    }
  ]);

  // Enrolled Students Data (US-17)
  const [students] = useState([
    { id: "s-1", name: isAr ? "أحمد المحمد" : "Ahmad Al-Mohammad", email: "ahmad@example.com", course: "React 19 & Next.js Masterclass", date: "2026-02-08", progress: 85 },
    { id: "s-2", name: isAr ? "سارة خالد" : "Sarah Khaled", email: "sarah@example.com", course: "React 19 & Next.js Masterclass", date: "2026-02-05", progress: 100 },
    { id: "s-3", name: isAr ? "عمر الفاروق" : "Omar Al-Farooq", email: "omar@example.com", course: "Applied AI with Python", date: "2026-01-28", progress: 40 },
    { id: "s-4", name: isAr ? "ريم السالم" : "Reem Al-Salem", email: "reem@example.com", course: "C++ Programming Basics", date: "2026-01-20", progress: 60 },
  ]);

  // Pagination for Students List (US-17)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Course Form State for Editor (US-08, US-09)
  const [courseForm, setCourseForm] = useState({
    titleAr: "",
    titleEn: "",
    category: "Development",
    level: "Beginner",
    price: 49.99,
    descriptionAr: "",
    descriptionEn: "",
  });

  const [courseSections, setCourseSections] = useState([
    {
      id: "sec-new-1",
      title: isAr ? "الفصل 1: مقدمة وتمهيد" : "Section 1: Introduction",
      lessons: [
        { id: "les-new-1", title: isAr ? "الدرس الأول: أهدافي من الدورة" : "Lesson 1: Objectives", videoType: "mp4", isFreePreview: true }
      ]
    }
  ]);

  // Handlers for Course Lifecycle (US-08)
  const handleSubmitForReview = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status: "pending_review", rejectionReason: "" } : c))
    );
    setToastMessage(tInst("courseSubmittedToast"));
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleArchiveCourse = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course && course.status !== "archived") {
      setArchiveModalCourseId(courseId);
    } else {
      confirmArchiveCourse(courseId);
    }
  };

  const confirmArchiveCourse = (courseId: string) => {
    const targetCourse = courses.find((c) => c.id === courseId);
    const isCurrentlyArchived = targetCourse?.status === "archived";

    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? { ...c, status: isCurrentlyArchived ? "published" : "archived" }
          : c
      )
    );

    if (isCurrentlyArchived) {
      setToastMessage(tInst("courseUnarchivedToast"));
    } else {
      setToastMessage(tInst("courseArchivedToast"));
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddLesson = (sectionId: string) => {
    const lessonTitle = prompt(isAr ? "أدخل عنوان الدرس الجديد:" : "Enter lesson title:");
    if (!lessonTitle) return;

    setCourseSections((prev) =>
      prev.map((sec) =>
        sec.id === sectionId
          ? {
              ...sec,
              lessons: [
                ...sec.lessons,
                {
                  id: `les-${Date.now()}`,
                  title: lessonTitle,
                  videoType: "mp4",
                  isFreePreview: false
                }
              ]
            }
          : sec
      )
    );
  };

  const handleSaveCourseForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourseId) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === editingCourseId
            ? {
                ...c,
                titleAr: courseForm.titleAr || c.titleAr,
                titleEn: courseForm.titleEn || c.titleEn,
                price: Number(courseForm.price),
                category: courseForm.category,
                sections: courseSections,
                status: c.status === "rejected" ? "draft" : c.status
              }
            : c
        )
      );
    } else {
      setCourses((prev) => [
        ...prev,
        {
          id: `c-${Date.now()}`,
          titleAr: courseForm.titleAr || "كورس جديد",
          titleEn: courseForm.titleEn || "New Course",
          category: courseForm.category,
          level: courseForm.level,
          price: Number(courseForm.price),
          studentsCount: 0,
          rating: 0.0,
          status: "draft",
          image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
          rejectionReason: "",
          sections: courseSections
        }
      ]);
    }

    setShowCourseModal(false);
    setToastMessage(tInst("courseSavedToast"));
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Students
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.course.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-[#FAFCFB] flex flex-col font-sans">
      <Header />

      <main className="flex-grow py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 flex items-center gap-3 bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-200">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-extrabold">{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer rounded-lg ml-1 rtl:ml-0 rtl:mr-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isAr ? "لوحة تحكم المدرب والإحصائيات" : "Instructor Dashboard & Analytics"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {isAr ? "متابعة الدورات، أداء الطلاب، وبناء وتطوير المنهج التعليمي." : "Track revenue, student growth, and manage your courses."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingCourseId(null);
              setCourseForm({ titleAr: "", titleEn: "", category: "Development", level: "Beginner", price: 49.99, descriptionAr: "", descriptionEn: "" });
              setShowCourseModal(true);
            }}
            className="px-5 py-3 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-extrabold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{isAr ? "إنشاء كورس جديد (Course Editor)" : "Create New Course"}</span>
          </button>
        </div>

        {/* Metric Cards (US-17) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isAr ? "إجمالي الكورسات" : "Total Courses"}
              </span>
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-[#0F5244]">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{courses.length}</div>
            <div className="text-xs text-slate-500 font-medium">
              {courses.filter((c) => c.status === "published").length} {isAr ? "منشور للعامة" : "published"}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isAr ? "الطلاب المسجلين" : "Enrolled Students"}
              </span>
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {courses.reduce((acc, curr) => acc + curr.studentsCount, 0)}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+18.4% {isAr ? "نمو هذا الشهر" : "this month"}</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isAr ? "إجمالي الأرباح" : "Total Revenue"}
              </span>
              <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-700">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">$24,850</div>
            <div className="text-xs text-slate-500 font-medium">{isAr ? "صافي تحويل البنك" : "Net payout"}</div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isAr ? "متوسط التقييمات" : "Average Rating"}
              </span>
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
                <Star className="h-5 w-5 fill-current" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">4.85 / 5</div>
            <div className="text-xs text-slate-500 font-medium">{isAr ? "من 540 تقييم طالب" : "From 540 reviews"}</div>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-1.5 shadow-2xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            
            <button
              type="button"
              onClick={() => setActiveTab("courses")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "courses"
                  ? "bg-[#E8F3F1] text-[#0F5244] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>{isAr ? "إدارة وتتبع الكورسات" : "Course Manager & Lifecycle"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("students")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "students"
                  ? "bg-[#E8F3F1] text-[#0F5244] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>{isAr ? "قائمة الطلاب المسجلين" : "Enrolled Students List"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                activeTab === "analytics"
                  ? "bg-[#E8F3F1] text-[#0F5244] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>{isAr ? "إحصائيات الأرباح" : "Earnings Growth"}</span>
            </button>

          </div>
        </div>

        {/* TAB 1: COURSE MANAGER & LIFECYCLE (US-08, US-09) */}
        {activeTab === "courses" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            <div className="grid grid-cols-1 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-start md:items-center gap-5 w-full md:w-auto">
                    <img
                      src={course.image}
                      alt={course.titleAr}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-2xs"
                    />
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                          {isAr ? course.titleAr : course.titleEn}
                        </h3>

                        {/* Status Badges (US-08) */}
                        {course.status === "published" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0F5244] text-[11px] font-black border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span>{isAr ? "منشور Published" : "Published"}</span>
                          </span>
                        )}
                        {course.status === "pending_review" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black border border-amber-200 inline-flex items-center gap-1">
                            <Clock className="h-3 w-3 text-amber-600 shrink-0" />
                            <span>{isAr ? "قيد المراجعة Pending Review" : "Pending Review"}</span>
                          </span>
                        )}
                        {course.status === "rejected" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black border border-rose-200 inline-flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-rose-600 shrink-0" />
                            <span>{isAr ? "مرفوض Rejected" : "Rejected"}</span>
                          </span>
                        )}
                        {course.status === "archived" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-black border border-slate-200 inline-flex items-center gap-1">
                            <Archive className="h-3 w-3 text-slate-500 shrink-0" />
                            <span>{isAr ? "مؤرشف Archived" : "Archived"}</span>
                          </span>
                        )}
                        {course.status === "draft" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black">
                            {isAr ? "مسودة Draft" : "Draft"}
                          </span>
                        )}
                      </div>

                      {/* Rejection Reason Alert Box (US-08) */}
                      {course.status === "rejected" && course.rejectionReason && (
                        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium space-y-1 max-w-2xl">
                          <div className="flex items-center gap-1.5 font-extrabold text-rose-800">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <span>{isAr ? "سبب الرفض والتغذية الراجعة من الآدمن:" : "Rejection Reason & Admin Feedback:"}</span>
                          </div>
                          <p className="leading-relaxed">{course.rejectionReason}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 flex-wrap pt-1">
                        <span>{isAr ? "السعر:" : "Price:"} <strong className="text-slate-900">${course.price}</strong></span>
                        <span>•</span>
                        <span>{isAr ? "الطلاب:" : "Students:"} <strong className="text-slate-900">{course.studentsCount}</strong></span>
                        <span>•</span>
                        <span>{isAr ? "التقييم:" : "Rating:"} <strong className="text-slate-900 inline-flex items-center gap-1">{course.rating} <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 inline shrink-0" /></strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions per Course (US-08) */}
                  <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    
                    {/* Submit for Review Button (US-08) */}
                    {(course.status === "draft" || course.status === "rejected") && (
                      <button
                        type="button"
                        onClick={() => handleSubmitForReview(course.id)}
                        className="px-4 py-2 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>{isAr ? "إرسال للمراجعة" : "Submit for Review"}</span>
                      </button>
                    )}

                    {/* Archive Button (US-08) */}
                    <button
                      type="button"
                      onClick={() => handleArchiveCourse(course.id)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title={isAr ? "أرشفة الكورس" : "Archive Course"}
                    >
                      <Archive className="h-3.5 w-3.5" />
                      <span>{course.status === "archived" ? (isAr ? "إلغاء الأرشفة" : "Unarchive") : (isAr ? "أرشفة" : "Archive")}</span>
                    </button>

                    {/* Edit Course & Curriculum (US-08, US-09) */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCourseId(course.id);
                        setCourseForm({
                          titleAr: course.titleAr,
                          titleEn: course.titleEn,
                          category: course.category,
                          level: course.level,
                          price: course.price,
                          descriptionAr: "",
                          descriptionEn: ""
                        });
                        setShowCourseModal(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#E8F3F1] hover:bg-emerald-100 text-[#0F5244] text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>{isAr ? "تعديل المنهج" : "Edit Course"}</span>
                    </button>

                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 2: ENROLLED STUDENTS LIST & PAGINATION (US-17) */}
        {activeTab === "students" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-4 p-6 animate-in fade-in duration-150">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-black text-slate-900">
                {isAr ? "بيانات الطلاب المسجلين بالدورات" : "Enrolled Students List"}
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={isAr ? "ابحث عن طالب..." : "Search student..."}
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 rtl:pl-3 rtl:pr-9 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F5244]"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-start text-xs font-semibold">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6 text-start">{isAr ? "اسم الطالب" : "Student Name"}</th>
                    <th className="py-3.5 px-6 text-start">{isAr ? "الدورة المسجل بها" : "Course"}</th>
                    <th className="py-3.5 px-6 text-start">{isAr ? "تاريخ التسجيل" : "Date"}</th>
                    <th className="py-3.5 px-6 text-start">{isAr ? "نسبة التقدم" : "Progress"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{student.name}</td>
                      <td className="py-4 px-6 text-slate-700">{student.course}</td>
                      <td className="py-4 px-6 text-slate-500">{student.date}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-[#0F5244] rounded-full"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-800">{student.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls (US-17) */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-medium">
                {isAr ? `عرض الصفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="p-2 rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="p-2 rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: EARNINGS ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6 animate-in fade-in duration-150">
            <h3 className="text-lg font-black text-slate-900">
              {isAr ? "تحليلات الأرباح ونمو المبيعات" : "Monthly Earnings Overview"}
            </h3>

            <div className="h-52 flex items-end gap-4 pt-8">
              {[
                { month: "Jan", val: 3400 },
                { month: "Feb", val: 4900 },
                { month: "Mar", val: 2800 },
                { month: "Apr", val: 5600 },
                { month: "May", val: 8100 },
              ].map((bar) => (
                <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[11px] text-slate-500 font-extrabold">${bar.val}</span>
                  <div
                    className="w-full bg-gradient-to-t from-[#0F5244] to-emerald-400 rounded-t-xl transition-all duration-300 hover:brightness-110"
                    style={{ height: `${(bar.val / 8100) * 100}%` }}
                  />
                  <span className="text-xs text-slate-600 font-bold">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* COURSE EDITOR & CURRICULUM BUILDER MODAL (US-08, US-09) */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-[#0F5244]">
                <Edit className="h-5 w-5" />
                <h3 className="text-lg font-black text-slate-900">
                  {isAr ? "محرر الكورس وبناء المنهج (Course & Curriculum Builder)" : "Course & Curriculum Builder"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCourseModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourseForm} className="space-y-6">
              
              {/* Basic Info (US-08) */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  1. {isAr ? "البيانات الأساسية" : "Basic Course Details"}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {isAr ? "عنوان الكورس بالعربية" : "Course Title (Arabic)"}
                    </label>
                    <input
                      type="text"
                      required
                      value={courseForm.titleAr}
                      onChange={(e) => setCourseForm((prev) => ({ ...prev, titleAr: e.target.value }))}
                      placeholder="مثال: دورة احتراف Next.js"
                      className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {isAr ? "عنوان الكورس بالإنجليزية" : "Course Title (English)"}
                    </label>
                    <input
                      type="text"
                      required
                      value={courseForm.titleEn}
                      onChange={(e) => setCourseForm((prev) => ({ ...prev, titleEn: e.target.value }))}
                      placeholder="e.g. Next.js Masterclass"
                      className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {isAr ? "الفئة / القسم" : "Category"}
                    </label>
                    <select
                      value={courseForm.category}
                      onChange={(e) => setCourseForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                    >
                      <option value="Development">Development</option>
                      <option value="Data Science">Data Science & AI</option>
                      <option value="Design">UI/UX Design</option>
                      <option value="Management">Management</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {isAr ? "السعر ($)" : "Price ($)"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={courseForm.price}
                      onChange={(e) => setCourseForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Curriculum Builder (US-09) */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    2. {isAr ? "بناء المنهج (Curriculum Builder)" : "Curriculum Builder"}
                  </h4>
                  <span className="text-[11px] text-[#0F5244] font-bold">
                    {isAr ? "يدعم سحب وإسقاط الدروس ومعاينة مجانية" : "Drag-and-drop & Free Preview supported"}
                  </span>
                </div>

                <div className="space-y-4">
                  {courseSections.map((section, sIdx) => (
                    <div key={section.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-3">
                      <div className="flex items-center justify-between font-bold text-xs text-slate-800">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-slate-400 cursor-grab" />
                          <span>{section.title}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddLesson(section.id)}
                          className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-[#0F5244] text-[11px] font-extrabold hover:bg-slate-100 cursor-pointer"
                        >
                          + {isAr ? "إضافة درس" : "Add Lesson"}
                        </button>
                      </div>

                      {/* Lessons List */}
                      <div className="space-y-2 pl-6 rtl:pl-0 rtl:pr-6">
                        {section.lessons.map((lesson) => (
                          <div key={lesson.id} className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs font-medium">
                            <div className="flex items-center gap-2">
                              <PlayCircle className="h-4 w-4 text-[#0F5244]" />
                              <span>{lesson.title}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={lesson.isFreePreview}
                                  onChange={() => {
                                    setCourseSections((prev) =>
                                      prev.map((sec) =>
                                        sec.id === section.id
                                          ? {
                                              ...sec,
                                              lessons: sec.lessons.map((l) =>
                                                l.id === lesson.id ? { ...l, isFreePreview: !l.isFreePreview } : l
                                              )
                                            }
                                          : sec
                                      )
                                    );
                                  }}
                                  className="rounded text-[#0F5244]"
                                />
                                <span>{isAr ? "معاينة مجانية" : "Free Preview"}</span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit / Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-5 py-2.5 rounded-2xl text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-extrabold shadow-sm cursor-pointer"
                >
                  {isAr ? "حفظ الكورس والمنهج" : "Save Course & Curriculum"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      <ArchiveCourseModal
        isOpen={!!archiveModalCourseId}
        onClose={() => setArchiveModalCourseId(null)}
        onConfirm={() => {
          if (archiveModalCourseId) {
            confirmArchiveCourse(archiveModalCourseId);
          }
        }}
        courseTitle={
          courses.find((c) => c.id === archiveModalCourseId)?.[isAr ? "titleAr" : "titleEn"]
        }
      />
    </div>
  );
}
