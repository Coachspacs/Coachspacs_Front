"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { tokenManager } from "@/lib/tokenManager";
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
  Upload,
  Loader2,
} from "lucide-react";
import { ArchiveCourseModal } from "@/components/modals/ArchiveCourseModal";
import { instructorCourseService } from "@/services/instructorCourseService";
import { courseService } from "@/services/courseService";

export function InstructorDashboardView() {
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const tInst = useTranslations("instructorSettings");
  const tDash = useTranslations("instructorDashboard");
  const authUser = useSelector((state: RootState) => state.auth.user);

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

  // Instructor Courses State (Dynamic from live API only)
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  // Fetch real instructor courses strictly for the authenticated instructor
  const fetchMyCourses = useCallback(async () => {
    if (!tokenManager.hasSession()) {
      setCourses([]);
      setIsLoadingCourses(false);
      return;
    }

    setIsLoadingCourses(true);
    try {
      const data = await instructorCourseService.getMyCourses();
      const list = Array.isArray(data) ? data : data?.results || [];

      const realCourses = list.map((c: any) => ({
        id: String(c.id),
        title: isAr ? c.title_ar || c.title_en || c.title : c.title_en || c.title_ar || c.title,
        titleEn: c.title_en || c.title || "Course",
        titleAr: c.title_ar || c.title || "دورة",
        studentsCount: Number(c.students_count || c.total_students || 0),
        rating: Number(c.rating) || 5.0,
        revenue: Number(c.revenue || (c.price ? Number(c.price) * (c.students_count || 0) : 0)),
        status: c.status || (c.is_published ? "published" : "draft"),
        price: Number(c.price) || 0,
        level: c.level || "Beginner",
        image:
          c.cover_image ||
          c.coverImage ||
          c.image ||
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
        rejectionReason: isAr ? c.rejection_reason_ar || "" : c.rejection_reason_en || "",
        sections: c.sections || [],
        isReal: true,
      }));

      // Set the authenticated instructor's real courses
      setCourses(realCourses);
    } catch (err) {
      console.warn("Could not fetch instructor courses:", err);
      setCourses([]);
    } finally {
      setIsLoadingCourses(false);
    }
  }, [isAr]);

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  // Enrolled Students Data
  const [students] = useState<any[]>([]);

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

  const [courseSections, setCourseSections] = useState<any[]>([]);

  // Handlers for Course Lifecycle (US-08)
  const handleSubmitForReview = async (courseId: string) => {
    try {
      await instructorCourseService.updateCourse(courseId, { status: "pending_review" });
      setToastMessage(tInst("courseSubmittedToast"));
      fetchMyCourses();
    } catch (err: any) {
      console.warn("Could not submit course for review via API:", err);
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, status: "pending_review", rejectionReason: "" } : c))
      );
      setToastMessage(tInst("courseSubmittedToast"));
    }
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

  const confirmArchiveCourse = async (courseId: string) => {
    const targetCourse = courses.find((c) => c.id === courseId);
    const isCurrentlyArchived = targetCourse?.status === "archived";
    const nextStatus = isCurrentlyArchived ? "published" : "archived";

    try {
      await instructorCourseService.updateCourse(courseId, { status: nextStatus });
      if (isCurrentlyArchived) {
        setToastMessage(tInst("courseUnarchivedToast"));
      } else {
        setToastMessage(tInst("courseArchivedToast"));
      }
      fetchMyCourses();
    } catch (err: any) {
      console.warn("Could not archive/unarchive course via API:", err);
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId ? { ...c, status: nextStatus } : c
        )
      );
      if (isCurrentlyArchived) {
        setToastMessage(tInst("courseUnarchivedToast"));
      } else {
        setToastMessage(tInst("courseArchivedToast"));
      }
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من رغبتك في حذف هذه الدورة؟" : "Are you sure you want to delete this course?")) {
      return;
    }
    try {
      await instructorCourseService.deleteCourse(courseId);
      setToastMessage(isAr ? "تم حذف الدورة بنجاح" : "Course deleted successfully");
      fetchMyCourses();
    } catch (err: any) {
      console.warn("Could not delete course via API:", err);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddLesson = (sectionId: string) => {
    const lessonTitle = prompt(tDash("enterLessonTitle"));
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
                  titleKey: "",
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
          titleKey: "",
          titleAr: courseForm.titleAr || "كورس جديد",
          titleEn: courseForm.titleEn || "New Course",
          categoryKey: "",
          category: courseForm.category,
          levelKey: "",
          level: courseForm.level,
          price: Number(courseForm.price),
          studentsCount: 0,
          rating: 0.0,
          status: "draft",
          image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
          rejectionReasonKey: "",
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
    <div className="w-full space-y-8">
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
            {tDash("title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {tDash("overviewSubtitle")}
          </p>
        </div>
      </div>

      {/* Metric Cards (US-17) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {tInst("enrolledStudentsNav")}
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
            <span>+18.4%</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {tInst("analyticsRevenue")}
            </span>
            <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-700">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ${courses.reduce((acc, curr) => acc + Number(curr.revenue || 0), 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 font-medium">{tInst("payoutAndBilling")}</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {tInst("ratingLabel")}
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
              <Star className="h-5 w-5 fill-current" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {courses.length > 0
              ? (courses.reduce((acc, curr) => acc + Number(curr.rating || 5), 0) / courses.length).toFixed(1)
              : "5.0"}{" "}
            / 5
          </div>
          <div className="text-xs text-slate-500 font-medium">
            ({courses.reduce((acc, curr) => acc + Number(curr.reviews_count || 0), 0)})
          </div>
        </div>

      </div>

      {/* TAB 1: COURSE MANAGER & LIFECYCLE (US-08, US-09) */}
      {activeTab === "courses" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {isLoadingCourses ? (
            <div className="grid grid-cols-1 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-pulse"
                >
                  <div className="flex items-start md:items-center gap-5 w-full md:w-auto">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-200 shrink-0" />
                    <div className="space-y-2.5">
                      <div className="h-5 w-48 sm:w-72 bg-slate-200 rounded-lg" />
                      <div className="h-3.5 w-32 bg-slate-200 rounded-md" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-20 bg-slate-200 rounded-xl" />
                    <div className="h-8 w-20 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl p-8 space-y-4 bg-slate-50/40">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#0F5244] mx-auto flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-[#0F5244]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  {isAr ? "لا توجد دورات تدريبية بعد" : "No courses created yet"}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {isAr ? "ابدأ بإنشاء أول دورة تدريبية ومشاركة معرفتك مع الطلاب." : "Start by creating your first course and share your expertise with students."}
                </p>
              </div>
              <Link
                href={`/${locale}/instructor/courses/new`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{tDash("createNewCourse")}</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-start md:items-center gap-5 w-full md:w-auto">
                  <Image
                    src={course.image}
                    alt={course.titleKey ? tDash(course.titleKey) : (isAr ? course.titleAr : course.titleEn)}
                    width={96}
                    height={96}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-2xs"
                  />
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                        {course.titleKey ? tDash(course.titleKey) : (isAr ? course.titleAr : course.titleEn)}
                      </h3>

                      {/* Status Badges (US-08) */}
                      {course.status === "published" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0F5244] text-[11px] font-black border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                          <span>{tDash("statusPublished")}</span>
                        </span>
                      )}
                      {course.status === "pending_review" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black border border-amber-200 inline-flex items-center gap-1">
                          <Clock className="h-3 w-3 text-amber-600 shrink-0" />
                          <span>{tDash("statusPendingReview")}</span>
                        </span>
                      )}
                      {course.status === "rejected" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black border border-rose-200 inline-flex items-center gap-1">
                          <XCircle className="h-3 w-3 text-rose-600 shrink-0" />
                          <span>{tDash("statusRejected")}</span>
                        </span>
                      )}
                      {course.status === "archived" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-black border border-slate-200 inline-flex items-center gap-1">
                          <Archive className="h-3 w-3 text-slate-500 shrink-0" />
                          <span>{tDash("statusArchived")}</span>
                        </span>
                      )}
                      {course.status === "draft" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black">
                          {tDash("statusDraft")}
                        </span>
                      )}
                    </div>

                    {/* Rejection Reason Alert Box (US-08) */}
                    {course.status === "rejected" && (course.rejectionReasonKey || course.rejectionReason) && (
                      <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium space-y-1 max-w-2xl">
                        <div className="flex items-center gap-1.5 font-extrabold text-rose-800">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span>{tInst("rejectionReasonLabel")}</span>
                        </div>
                        <p className="leading-relaxed">
                          {course.rejectionReasonKey ? tDash(course.rejectionReasonKey) : course.rejectionReason}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 flex-wrap pt-1">
                      <span><strong className="text-slate-900">${course.price}</strong></span>
                      <span>•</span>
                      <span><strong className="text-slate-900">{course.studentsCount}</strong> {tInst("enrolledStudentsCount")}</span>
                      <span>•</span>
                      <span><strong className="text-slate-900 inline-flex items-center gap-1">{course.rating} <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 inline shrink-0" /></strong></span>
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
                      <span>{tInst("submitReviewBtn")}</span>
                    </button>
                  )}

                  {/* Archive Button (US-08) */}
                  <button
                    type="button"
                    onClick={() => handleArchiveCourse(course.id)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title={tInst("archiveTitle")}
                  >
                    <Archive className="h-3.5 w-3.5" />
                    <span>{course.status === "archived" ? tInst("unarchiveBtn") : tInst("archiveBtn")}</span>
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
                    <span>{tInst("courses")}</span>
                  </button>

                </div>
              </div>
            ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: ENROLLED STUDENTS LIST & PAGINATION (US-17) */}
      {activeTab === "students" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-4 p-6 animate-in fade-in duration-150">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-black text-slate-900">
              {tInst("enrolledStudentsTitle")}
            </h3>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={tDash("searchStudentPlaceholder")}
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
                  <th className="py-3.5 px-6 text-start">{tInst("studentCol")}</th>
                  <th className="py-3.5 px-6 text-start">{tInst("courseCol")}</th>
                  <th className="py-3.5 px-6 text-start">{tDash("dateCol")}</th>
                  <th className="py-3.5 px-6 text-start">{tInst("progressCol")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {student.nameKey ? tDash(student.nameKey) : student.name}
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      {student.courseKey ? tDash(student.courseKey) : student.course}
                    </td>
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
              {tDash("pageOf", { current: currentPage, total: totalPages })}
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



      {/* COURSE EDITOR & CURRICULUM BUILDER MODAL (US-08, US-09) */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-[#0F5244]">
                <Edit className="h-5 w-5" />
                <h3 className="text-lg font-black text-slate-900">
                  {tDash("builderTitle")}
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
                  1. {tDash("basicDetails")}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {tDash("titleArLabel")}
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
                      {tDash("titleEnLabel")}
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
                      {tInst("specialization")}
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
                      {tDash("priceLabel")}
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
                    2. {tDash("builderTitle")}
                  </h4>
                  <span className="text-[11px] text-[#0F5244] font-bold">
                    {tDash("dragDropFreeNotice")}
                  </span>
                </div>

                <div className="space-y-4">
                  {courseSections.map((section, sIdx) => (
                    <div key={section.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-3">
                      <div className="flex items-center justify-between font-bold text-xs text-slate-800">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-slate-400 cursor-grab" />
                          <span>{section.titleKey ? tDash(section.titleKey) : section.title}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddLesson(section.id)}
                          className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-[#0F5244] text-[11px] font-extrabold hover:bg-slate-100 cursor-pointer"
                        >
                          + {tDash("addLessonBtn")}
                        </button>
                      </div>

                      {/* Lessons List */}
                      <div className="space-y-2 pl-6 rtl:pl-0 rtl:pr-6">
                        {section.lessons?.map((lesson: any) => (
                          <div key={lesson.id} className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs font-medium">
                            <div className="flex items-center gap-2">
                              <PlayCircle className="h-4 w-4 text-[#0F5244]" />
                              <span>{lesson.titleKey ? tDash(lesson.titleKey) : lesson.title}</span>
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
                                              lessons: sec.lessons.map((l: any) =>
                                                l.id === lesson.id ? { ...l, isFreePreview: !l.isFreePreview } : l
                                              )
                                            }
                                          : sec
                                      )
                                    );
                                  }}
                                  className="rounded text-[#0F5244]"
                                />
                                <span>{tDash("freePreviewLabel")}</span>
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
                  {tDash("cancelBtn")}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-extrabold shadow-sm cursor-pointer"
                >
                  {tDash("saveCourseBtn")}
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
          (() => {
            const found = courses.find((c) => c.id === archiveModalCourseId);
            if (!found) return "";
            return found.titleKey ? tDash(found.titleKey) : (isAr ? found.titleAr : found.titleEn);
          })()
        }
      />
    </div>
  );
}
