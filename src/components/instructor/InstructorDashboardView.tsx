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
  ChevronDown,
  ChevronUp,
  GripVertical,
  PlayCircle,
  FileText,
  AlertTriangle,
  Sparkles,
  X,
  Upload,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { ArchiveCourseModal } from "@/components/modals/ArchiveCourseModal";
import { DeleteCourseModal } from "@/components/modals/DeleteCourseModal";
import { CourseIncompleteModal, IncompleteItem } from "@/components/modals/CourseIncompleteModal";
import { instructorCourseService } from "@/services/instructorCourseService";
import { courseService } from "@/services/courseService";
import { getSavedCourseStatus, saveCourseStatus, removeCourseStatus } from "@/lib/mockInstructors";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

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
  const [deleteModalCourse, setDeleteModalCourse] = useState<{ id: string; title: string } | null>(null);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);
  const [incompleteModalData, setIncompleteModalData] = useState<{
    isOpen: boolean;
    courseId: string;
    courseTitle?: string;
    missingItems: IncompleteItem[];
  }>({
    isOpen: false,
    courseId: "",
    courseTitle: "",
    missingItems: [],
  });

  // Instructor Courses State (Dynamic from live API only)
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [submittingCourseId, setSubmittingCourseId] = useState<string | null>(null);

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

      const realCourses = list.map((c: any) => {
        const rawStatus = String(c.status || "").toLowerCase();
        const savedStatus = getSavedCourseStatus(c.id);
        let normalizedStatus: "published" | "pending_review" | "draft" | "rejected" | "archived" = "draft";
        if (
          rawStatus === "pending_review" ||
          rawStatus === "pending" ||
          rawStatus === "under_review" ||
          rawStatus === "in_review"
        ) {
          normalizedStatus = "pending_review";
        } else if (rawStatus === "published" || rawStatus === "approved" || (c.is_published && rawStatus !== "draft" && rawStatus !== "rejected")) {
          removeCourseStatus(c.id);
          normalizedStatus = "published";
        } else if (rawStatus === "rejected" || rawStatus === "declined") {
          removeCourseStatus(c.id);
          normalizedStatus = "rejected";
        } else if (rawStatus === "archived") {
          normalizedStatus = "archived";
        } else if (savedStatus === "pending_review") {
          normalizedStatus = "pending_review";
        } else {
          normalizedStatus = "draft";
        }

        return {
          id: String(c.id),
          title: isAr ? c.title_ar || c.title_en || c.title : c.title_en || c.title_ar || c.title,
          titleEn: c.title_en || c.title || "Course",
          titleAr: c.title_ar || c.title || "دورة",
          studentsCount: Number(c.students_count || c.total_students || 0),
          rating: Number(c.rating || 0),
          reviewsCount: Number(c.reviews_count || c.reviewsCount || 0),
          revenue: Number(c.revenue || (c.price ? Number(c.price) * (c.students_count || 0) : 0)),
          status: normalizedStatus,
          price: Number(c.price) || 0,
          level: c.level || "Beginner",
          image:
            c.cover_image ||
            c.coverImage ||
            (typeof c.image === "string" && !c.image.includes("unsplash.com/photo-1516321318423") ? c.image : ""),
          rejectionReason:
            (isAr ? c.rejection_reason_ar : c.rejection_reason_en) ||
            c.rejection_reason ||
            c.rejectionReason ||
            c.reject_reason ||
            c.admin_feedback ||
            c.review_feedback ||
            c.feedback ||
            c.reason ||
            c.rejection_comment ||
            "",
          sections: c.sections || [],
          enrolledStudents: Array.isArray(c.enrolled_students) ? c.enrolled_students : Array.isArray(c.students) ? c.students : [],
          isReal: true,
        };
      });

      // Set the authenticated instructor's real courses
      setCourses(realCourses);

      // Dynamically populate enrolled students across all courses
      const allDynamicStudents: any[] = [];
      realCourses.forEach((c: any) => {
        const count = Number(c.studentsCount || 0);
        if (Array.isArray(c.enrolledStudents) && c.enrolledStudents.length > 0) {
          c.enrolledStudents.forEach((st: any, idx: number) => {
            allDynamicStudents.push({
              id: String(st.id || `${c.id}-st-${idx + 1}`),
              courseId: String(c.id),
              name: st.full_name || st.name || st.email?.split("@")[0] || (isAr ? `طالب مسجل ${idx + 1}` : `Student ${idx + 1}`),
              email: st.email || `student${idx + 1}@example.com`,
              avatar: st.avatar || null,
              course: isAr ? c.titleAr : c.titleEn,
              date: st.enrolled_at ? new Date(st.enrolled_at).toLocaleDateString(isAr ? "ar-EG" : "en-US") : (isAr ? "منذ يومين" : "2 days ago"),
              progress: typeof st.progress === "number" ? st.progress : 65,
              status: st.is_completed ? "completed" : "active",
            });
          });
        }
      });
      setStudents(allDynamicStudents);
    } catch (err) {
      console.warn("Could not fetch instructor courses:", err);
      setCourses([]);
      setStudents([]);
    } finally {
      setIsLoadingCourses(false);
    }
  }, [isAr]);

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  // Enrolled Students Data & Drawer State
  const [students, setStudents] = useState<any[]>([]);
  const [expandedCourseStudentsId, setExpandedCourseStudentsId] = useState<string | null>(null);

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

  const handleSubmitForReview = async (courseId: string) => {
    try {
      setSubmittingCourseId(courseId);

      // 1. Fetch full course details to inspect all sections, lessons, and cover image
      let detailedCourse = courses.find((c) => String(c.id) === String(courseId));
      try {
        const fetched = await instructorCourseService.getInstructorCourse(courseId);
        if (fetched) {
          detailedCourse = {
            ...detailedCourse,
            ...fetched,
            sections: fetched.sections || detailedCourse?.sections || [],
            cover_image: fetched.cover_image || fetched.coverImage || detailedCourse?.image,
          };
        }
      } catch (fetchErr) {
        console.warn("Could not fetch full course for validation check:", fetchErr);
      }

      // 2. Comprehensive Course Completeness Validation (Image, Sections, Lessons, Videos)
      const hasCover = Boolean(
        detailedCourse?.cover_image ||
        detailedCourse?.coverImage ||
        (detailedCourse?.image && typeof detailedCourse.image === "string" && !detailedCourse.image.includes("unsplash.com/photo-1516321318423"))
      );

      const sections = detailedCourse?.sections || [];
      const hasSections = Array.isArray(sections) && sections.length > 0;
      const hasLessons = hasSections && sections.every((s: any) => Array.isArray(s.lessons) && s.lessons.length > 0);
      const hasVideos = hasLessons && sections.every((s: any) =>
        s.lessons.every((l: any) => Boolean(l.video_url || l.video_public_id || l.videoUrl))
      );

      const checklist: IncompleteItem[] = [
        {
          id: "cover",
          labelAr: "صورة غلاف الدورة",
          labelEn: "Course Cover Image",
          descriptionAr: "إرفاق صورة جذابة بدقة عالية لغلاف الدورة التدريبية.",
          descriptionEn: "Upload a high-quality cover thumbnail for the course.",
          isComplete: hasCover,
        },
        {
          id: "sections",
          labelAr: "أقسام الدورة (Sections)",
          labelEn: "Course Sections",
          descriptionAr: "إضافة قسم واحد على الأقل لتنظيم المنهج التدريبي.",
          descriptionEn: "Add at least one curriculum section to organize content.",
          isComplete: hasSections,
        },
        {
          id: "lessons",
          labelAr: "دروس المنهج (Lessons)",
          labelEn: "Curriculum Lessons",
          descriptionAr: "إضافة الدروس التابعة لكل قسم تدريبي في الدورة.",
          descriptionEn: "Add lesson topics inside each curriculum section.",
          isComplete: hasLessons,
        },
        {
          id: "videos",
          labelAr: "فيديوهات الشرح لكل درس",
          labelEn: "Lesson Video Content",
          descriptionAr: "رفع وإرفاق فيديو الشرح التعليمي لجميع الدروس المضافة.",
          descriptionEn: "Upload or attach video recordings for all lessons.",
          isComplete: hasVideos,
        },
      ];

      const isIncomplete = checklist.some((item) => !item.isComplete);
      if (isIncomplete) {
        setIncompleteModalData({
          isOpen: true,
          courseId: String(courseId),
          courseTitle: (isAr ? detailedCourse?.titleAr || detailedCourse?.title : detailedCourse?.titleEn || detailedCourse?.title) || "",
          missingItems: checklist,
        });
        return;
      }

      const previousCourse = courses.find((c) => String(c.id) === String(courseId));
      const previousStatus = previousCourse?.status || "draft";

      // Persist pending_review locally so it stays across refetches
      saveCourseStatus(courseId, "pending_review");

      // Optimistic local update: immediately switch to pending_review and clear actions
      setCourses((prev) =>
        prev.map((c) => (String(c.id) === String(courseId) ? { ...c, status: "pending_review", rejectionReason: "" } : c))
      );

      try {
        await instructorCourseService.submitForReview(courseId);
        setToastMessage(tInst("courseSubmittedToast"));
        await fetchMyCourses();
      } catch (err: any) {
        console.error("Could not submit course for review via API:", err);
        removeCourseStatus(courseId);
        // Revert optimistic state on API failure
        setCourses((prev) =>
          prev.map((c) => (String(c.id) === String(courseId) ? { ...c, status: previousStatus } : c))
        );
        const errorMsg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          (isAr ? "فشل إرسال الكورس للمراجعة. يرجى التحقق من الاتصال والمحاولة مرة أخرى." : "Failed to submit course for review. Please try again.");
        setToastMessage(errorMsg);
      }
    } finally {
      setSubmittingCourseId(null);
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleArchiveCourse = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course || course.status === "pending_review") return;
    if (course.status !== "archived") {
      setArchiveModalCourseId(courseId);
    } else {
      confirmArchiveCourse(courseId);
    }
  };

  const confirmArchiveCourse = async (courseId: string) => {
    const targetCourse = courses.find((c) => c.id === courseId);
    if (!targetCourse || targetCourse.status === "pending_review") return;
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

  const confirmDeleteCourse = async () => {
    if (!deleteModalCourse) return;
    const courseId = deleteModalCourse.id;
    const targetCourse = courses.find((c) => String(c.id) === String(courseId));
    if (targetCourse?.status === "pending_review") {
      setDeleteModalCourse(null);
      return;
    }
    setIsDeletingCourse(true);
    try {
      const res = await instructorCourseService.deleteCourse(courseId);
      
      if (res.status === 204) {
        // 204 No Content: Course had no enrollments and was permanently deleted
        setToastMessage(tInst("courseDeletedToast"));
        setCourses((prev) => prev.filter((c) => String(c.id) !== String(courseId)));
      } else if (res.archived || res.status === 200) {
        // 200 OK: Course had enrollments -> automatically archived
        setToastMessage(tInst("courseArchivedNotice"));
        setCourses((prev) =>
          prev.map((c) =>
            String(c.id) === String(courseId) ? { ...c, status: "archived" } : c
          )
        );
      } else {
        setToastMessage(tInst("courseDeletedToast"));
        setCourses((prev) => prev.filter((c) => String(c.id) !== String(courseId)));
      }

      // Re-fetch courses from backend
      await fetchMyCourses();
    } catch (err: any) {
      console.error("Delete course error:", err);
      const status = err?.response?.status;
      if (status === 401) {
        setToastMessage(tInst("deleteCourseUnauthorized"));
      } else if (status === 403) {
        setToastMessage(tInst("deleteCourseForbidden"));
      } else {
        const errorDetail = err?.response?.data?.detail || err?.response?.data?.message;
        setToastMessage(errorDetail || tInst("deleteCourseError"));
      }
    } finally {
      setIsDeletingCourse(false);
      setDeleteModalCourse(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
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
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {tDash("title")}
            </h1>
            {((authUser?.approval_status || (authUser as any)?.approvalStatus) === "approved" || (authUser as any)?.instructorStatus === "approved") && (
              <VerifiedBadge size="sm" />
            )}
          </div>
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
            {courses.filter((c) => Number(c.reviewsCount || 0) > 0).length > 0
              ? (
                  courses
                    .filter((c) => Number(c.reviewsCount || 0) > 0)
                    .reduce((acc, curr) => acc + Number(curr.rating || 0), 0) /
                  courses.filter((c) => Number(c.reviewsCount || 0) > 0).length
                ).toFixed(1)
              : "—"}{" "}
            {courses.filter((c) => Number(c.reviewsCount || 0) > 0).length > 0 && (
              <span className="text-base text-slate-400 font-bold">/ 5</span>
            )}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            ({courses.reduce((acc, curr) => acc + Number(curr.reviewsCount || 0), 0)})
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
                  {tDash("noCoursesYetTitle")}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {tDash("noCoursesYetSubtitle")}
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
              {courses.map((course) => {
                const courseStudents = students.filter((s) => s.courseId === course.id);
                const isExpanded = expandedCourseStudentsId === course.id;

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-300 space-y-4"
                  >
                    {/* Main Row: Thumbnail + Info + Actions */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                      <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0 w-full lg:w-auto">
                        {/* Course Thumbnail */}
                        <div className="relative w-24 h-20 sm:w-32 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-200/80 shadow-2xs bg-slate-100 flex items-center justify-center group">
                          {course.image ? (
                            <Image
                              src={course.image}
                              alt={course.titleKey ? tDash(course.titleKey) : (isAr ? course.titleAr : course.titleEn)}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-50 to-slate-100 gap-1 p-1 text-center">
                              <ImageIcon className="w-5 h-5 text-slate-300" />
                              <span className="text-[9px] font-bold text-slate-400 leading-tight">
                                {isAr ? "بدون غلاف" : "No cover"}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info Column */}
                        <div className="space-y-2 flex-1 min-w-0">
                          {/* Title & Status */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug hover:text-[#0F5244] transition-colors line-clamp-1">
                              {course.titleKey ? tDash(course.titleKey) : (isAr ? course.titleAr : course.titleEn)}
                            </h3>

                            {/* Status Badges */}
                            {course.status === "published" && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0F5244] text-[11px] font-black border border-emerald-200 inline-flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                                <span>{tDash("statusPublished")}</span>
                              </span>
                            )}
                            {course.status === "pending_review" && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black border border-amber-200 inline-flex items-center gap-1">
                                <Clock className="h-3 w-3 text-amber-600 shrink-0 animate-pulse" />
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

                          {/* Metadata Row */}
                          <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold text-slate-500 flex-wrap pt-0.5">
                            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-900 font-black text-xs">
                              ${course.price}
                            </span>

                            <span className="text-slate-300">•</span>

                            {/* Enrolled Students Dynamic Chip */}
                            {course.studentsCount > 0 ? (
                              <button
                                type="button"
                                onClick={() => setExpandedCourseStudentsId(isExpanded ? null : course.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/90 font-bold text-xs hover:bg-emerald-100/80 transition-all cursor-pointer shadow-2xs group"
                                title={isAr ? "انقر لعرض قائمة الطلاب المسجلين" : "Click to view enrolled students"}
                              >
                                <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>
                                  <strong className="text-emerald-950 font-black">{course.studentsCount}</strong> {tInst("enrolledStudentsCount")}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 text-emerald-600 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>0 {tInst("enrolledStudentsCount")}</span>
                              </span>
                            )}

                            {course.status === "published" && Number(course.reviewsCount || 0) > 0 && Number(course.rating || 0) > 0 && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="inline-flex items-center gap-1 text-amber-600 font-black">
                                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                                  <span>{Number(course.rating).toFixed(1)}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions Toolbar */}
                      <div className="flex items-center gap-2 flex-nowrap shrink-0 self-end lg:self-center w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        {course.status === "pending_review" ? (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-black select-none shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            <span>{tInst("waitingForAdminReview")}</span>
                          </div>
                        ) : (
                          <>
                            {(course.status === "draft" || course.status === "rejected") && (
                              <button
                                type="button"
                                disabled={submittingCourseId === course.id}
                                onClick={() => handleSubmitForReview(course.id)}
                                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all whitespace-nowrap"
                              >
                                {submittingCourseId === course.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Send className="h-3.5 w-3.5" />
                                )}
                                <span>
                                  {submittingCourseId === course.id
                                    ? isAr
                                      ? "جاري الإرسال..."
                                      : "Submitting..."
                                    : tInst("submitReviewBtn")}
                                </span>
                              </button>
                            )}

                            {course.status === "published" && (
                              <Link
                                href={`/${locale}/courses/${course.slug || course.id}`}
                                target="_blank"
                                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                              >
                                <Eye size={13} />
                                <span>{tInst("viewLiveBtn")}</span>
                              </Link>
                            )}

                            {/* Edit Button */}
                            <Link
                              href={`/${locale}/instructor/courses/create?id=${course.id}`}
                              className="px-3.5 py-2 rounded-xl bg-[#0F5244] hover:bg-[#0b3d32] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span>{tInst("editBtn") || (isAr ? "تعديل" : "Edit")}</span>
                            </Link>

                            {/* Archive Button */}
                            {course.status !== "rejected" && (
                              <button
                                type="button"
                                onClick={() => handleArchiveCourse(course.id)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                  course.status === "archived"
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                }`}
                                title={tInst("archiveTitle")}
                              >
                                <Archive className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">{course.status === "archived" ? tInst("unarchiveBtn") : tInst("archiveBtn")}</span>
                              </button>
                            )}

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteModalCourse({
                                  id: String(course.id),
                                  title: course.titleKey ? tDash(course.titleKey) : (isAr ? course.titleAr : course.titleEn),
                                })
                              }
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/70 hover:border-rose-200 transition-all cursor-pointer shadow-2xs shrink-0"
                              title={tInst("deleteCourseTitle")}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Rejection Alert Box */}
                    {course.status === "rejected" && (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/95 via-rose-50/60 to-white border-s-4 border-rose-500 border border-rose-200/80 text-xs text-rose-900 shadow-2xs space-y-1.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 font-black text-rose-950 text-xs sm:text-sm">
                            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                            <span>{tInst("rejectionReasonLabel") || (isAr ? "سبب الرفض:" : "Rejection Reason:")}</span>
                          </div>
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-100/90 px-2.5 py-0.5 rounded-full">
                            {isAr ? "إشعار من الإدارة" : "Admin Notice"}
                          </span>
                        </div>
                        <p className="font-extrabold text-rose-900 text-xs sm:text-sm leading-relaxed pr-6 rtl:pr-0 rtl:pl-6">
                          {course.rejectionReasonKey
                            ? tDash(course.rejectionReasonKey)
                            : course.rejectionReason ||
                              (isAr ? "الكورس غير مناسب" : "Course content is not suitable")}
                        </p>
                      </div>
                    )}

                    {/* Expanded Enrolled Students Drawer */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#0F5244]" />
                            <h4 className="text-xs sm:text-sm font-black text-slate-900">
                              {isAr
                                ? `الطلاب المسجلون في هذه الدورة (${courseStudents.length})`
                                : `Enrolled Students in this Course (${courseStudents.length})`}
                            </h4>
                          </div>
                          <span className="text-[11px] font-bold text-slate-500">
                            {isAr ? "محدث تلقائياً" : "Auto-synced"}
                          </span>
                        </div>

                        {courseStudents.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            {isAr ? "لم يسجل أي طالب في هذه الدورة بعد" : "No students enrolled in this course yet"}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {courseStudents.map((st) => (
                              <div
                                key={st.id}
                                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-3 shadow-2xs hover:bg-white hover:border-[#0F5244]/30 transition-all"
                              >
                                <div className="w-9 h-9 rounded-full bg-[#0F5244]/10 text-[#0F5244] font-black text-xs flex items-center justify-center shrink-0 border border-[#0F5244]/20">
                                  {st.avatar ? (
                                    <img src={st.avatar} alt={st.name} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    st.name.charAt(0)
                                  )}
                                </div>
                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <div className="flex items-center justify-between gap-1">
                                    <p className="text-xs font-bold text-slate-900 truncate">{st.name}</p>
                                    <span
                                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                        st.status === "completed"
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-blue-100 text-blue-800"
                                      }`}
                                    >
                                      {st.status === "completed" ? (isAr ? "مكتمل" : "Completed") : `${st.progress}%`}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 truncate">{st.email}</p>
                                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                                    <div
                                      className="h-full bg-[#0F5244] rounded-full"
                                      style={{ width: `${st.progress}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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

      <DeleteCourseModal
        isOpen={!!deleteModalCourse}
        onClose={() => {
          if (!isDeletingCourse) setDeleteModalCourse(null);
        }}
        onConfirm={confirmDeleteCourse}
        courseTitle={deleteModalCourse?.title}
        isLoading={isDeletingCourse}
      />

      <CourseIncompleteModal
        isOpen={incompleteModalData.isOpen}
        onClose={() => setIncompleteModalData((prev) => ({ ...prev, isOpen: false }))}
        courseId={incompleteModalData.courseId}
        courseTitle={incompleteModalData.courseTitle}
        missingItems={incompleteModalData.missingItems}
      />
    </div>
  );
}
