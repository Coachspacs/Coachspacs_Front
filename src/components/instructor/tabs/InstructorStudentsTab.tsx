"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Users,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { instructorService } from "@/services/instructorService";
import { CourseStudentItem, InstructorDashboardResponse } from "@/types/certificate";

interface Student {
  id: string;
  courseId?: string;
  name: string;
  email: string;
  avatar?: string | null;
  course: string;
  date?: string;
  progress: number;
  status: "completed" | "active";
}

interface InstructorStudentsTabProps {
  students: Student[];
  courses?: any[];
  studentSearch: string;
  setStudentSearch: (query: string) => void;
  isLoading?: boolean;
  dashboardData?: InstructorDashboardResponse | null;
}

export function InstructorStudentsTab({
  students,
  courses = [],
  studentSearch,
  setStudentSearch,
  isLoading = false,
  dashboardData,
}: InstructorStudentsTabProps) {
  const tInst = useTranslations("instructorSettings");
  const tDash = useTranslations("instructorDashboard");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const searchParams = useSearchParams();
  const initialCourseId = searchParams?.get("courseId") || "all";
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Live Course Students State from API (US-17)
  const [courseStudents, setCourseStudents] = useState<CourseStudentItem[]>([]);
  const [totalCourseStudents, setTotalCourseStudents] = useState<number>(0);
  const [isLoadingCourseStudents, setIsLoadingCourseStudents] = useState(false);
  const [forbiddenError, setForbiddenError] = useState<string | null>(null);

  const fetchCourseStudents = useCallback(
    async (courseId: string, page: number) => {
      setIsLoadingCourseStudents(true);
      setForbiddenError(null);

      try {
        if (courseId === "all") {
          // Fetch enrolled students across all instructor courses (US-17)
          if (!courses || courses.length === 0) {
            setCourseStudents([]);
            setTotalCourseStudents(0);
            return;
          }

          const responses = await Promise.all(
            courses.map(async (c) => {
              try {
                const res = await instructorService.getCourseStudents(
                  c.id,
                  1,
                  100
                );
                return (res.results || []).map((st) => ({
                  ...st,
                  course_id: c.id,
                  course_title:
                    (isAr ? c.titleAr : c.titleEn) || c.title || "Course",
                }));
              } catch (err: any) {
                console.warn(
                  `Could not fetch students for course ${c.id}:`,
                  err
                );
                return [];
              }
            })
          );
          const allStudents = responses.flat();
          setCourseStudents(allStudents);
          setTotalCourseStudents(allStudents.length);
        } else {
          const response = await instructorService.getCourseStudents(
            courseId,
            page,
            pageSize
          );
          const currentCourse = courses.find(
            (c) => String(c.id) === String(courseId)
          );
          const mapped = (response.results || []).map((st) => ({
            ...st,
            course_id: courseId,
            course_title:
              (isAr ? currentCourse?.titleAr : currentCourse?.titleEn) ||
              currentCourse?.title ||
              "Course",
          }));
          setCourseStudents(mapped);
          setTotalCourseStudents(response.count || 0);
        }
      } catch (err: any) {
        if (err?.isForbidden || err?.status === 403) {
          setForbiddenError(
            err.message ||
              tInst("accessDeniedCourse") ||
              "You are not authorized to view students for this course."
          );
        } else {
          console.warn("Error fetching course students:", err);
          setCourseStudents([]);
        }
      } finally {
        setIsLoadingCourseStudents(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [courses, isAr, pageSize]
  );

  useEffect(() => {
    setCurrentPage(1);
    fetchCourseStudents(selectedCourseId, 1);
  }, [selectedCourseId, fetchCourseStudents]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (selectedCourseId !== "all") {
      fetchCourseStudents(selectedCourseId, newPage);
    }
  };

  // Determine which list to display
  const isSpecificCourse = selectedCourseId !== "all";

  // Map live course students to display format
  const mappedLiveStudents = courseStudents.map((st: any, idx) => {
    const nested =
      (typeof st.student === "object" && st.student !== null ? st.student : null) ||
      (typeof st.user === "object" && st.user !== null ? st.user : null) ||
      (typeof st.learner === "object" && st.learner !== null ? st.learner : null) ||
      (typeof st.profile === "object" && st.profile !== null ? st.profile : null);

    const email =
      st.email ||
      nested?.email ||
      st.student_email ||
      st.user_email ||
      st.learner_email ||
      (typeof st.student === "string" && st.student.includes("@") ? st.student : "") ||
      (typeof st.user === "string" && st.user.includes("@") ? st.user : "") ||
      "";

    let name =
      st.full_name ||
      st.fullName ||
      st.student_full_name ||
      st.student_name ||
      st.studentName ||
      nested?.full_name ||
      nested?.fullName ||
      nested?.student_full_name ||
      nested?.student_name ||
      nested?.name ||
      st.name ||
      nested?.username ||
      st.username ||
      st.student_username ||
      "";

    if (!name || name.trim().length === 0) {
      const fn = st.first_name || nested?.first_name || "";
      const ln = st.last_name || nested?.last_name || "";
      if (fn || ln) {
        name = `${fn} ${ln}`.trim();
      }
    }

    if ((!name || name.trim().toLowerCase() === "student") && email) {
      const prefix = email.split("@")[0];
      name = prefix
        .replace(/[._-]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }

    if (!name || name.trim().toLowerCase() === "student") {
      const sId =
        st.student_id ||
        (typeof st.student === "number" || typeof st.student === "string"
          ? st.student
          : "") ||
        st.id;
      name = sId
        ? (isAr ? `طالب #${sId}` : `Student #${sId}`)
        : (isAr ? `طالب مسجل ${idx + 1}` : `Student ${idx + 1}`);
    }

    const avatar =
      st.avatar ||
      nested?.avatar ||
      st.student_avatar ||
      st.user_avatar ||
      st.avatar_url ||
      nested?.avatar_url ||
      st.profile_picture ||
      null;

    return {
      id: String(st.id || `${st.course_id || selectedCourseId}-st-${idx}`),
      courseId: String(st.course_id || selectedCourseId),
      name,
      email: email || "—",
      avatar,
      course:
        st.course_title ||
        courses.find(
          (c) => String(c.id) === String(st.course_id || selectedCourseId)
        )?.[isAr ? "titleAr" : "titleEn"] ||
        courses.find(
          (c) => String(c.id) === String(st.course_id || selectedCourseId)
        )?.title ||
        "Selected Course",
      date: st.enrolled_at
        ? new Date(st.enrolled_at).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "—",
      progress:
        typeof st.progress_percent === "number"
          ? st.progress_percent
          : (st.progress ?? 0),
      status:
        st.is_completed || st.progress_percent === 100
          ? ("completed" as const)
          : ("active" as const),
    };
  });

  // Merge live students with workspace students so no enrolled students are missing
  const mergedStudentsMap = new Map<string, Student>();

  students.forEach((s) => {
    mergedStudentsMap.set(`${s.courseId || ""}-${s.email || s.name || s.id}`, s);
  });

  mappedLiveStudents.forEach((s) => {
    mergedStudentsMap.set(`${s.courseId || ""}-${s.email || s.name || s.id}`, s);
  });

  const activeStudentList =
    mergedStudentsMap.size > 0
      ? Array.from(mergedStudentsMap.values())
      : mappedLiveStudents.length > 0
        ? mappedLiveStudents
        : students;

  const filteredStudents = activeStudentList.filter((student) => {
    const matchesCourse =
      !isSpecificCourse ||
      String(student.courseId) === String(selectedCourseId);
    if (!matchesCourse) return false;

    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      student.name.toLowerCase().includes(q) ||
      student.course.toLowerCase().includes(q) ||
      student.email.toLowerCase().includes(q)
    );
  });

  const totalPages = isSpecificCourse
    ? Math.max(1, Math.ceil(totalCourseStudents / pageSize))
    : Math.max(1, Math.ceil(filteredStudents.length / pageSize));

  const paginatedStudents = isSpecificCourse
    ? filteredStudents
    : filteredStudents.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      );

  // Total enrolled students across all courses from dashboard metrics or courses sum
  const totalAllCoursesStudents =
    dashboardData?.total_students ??
    courses.reduce((acc, curr) => acc + Number(curr.studentsCount || 0), 0);

  const selectedCourseObj = courses.find(
    (c) => String(c.id) === String(selectedCourseId)
  );

  const displayTotalCount = isSpecificCourse
    ? (selectedCourseObj?.studentsCount || totalCourseStudents || filteredStudents.length)
    : Math.max(
        totalAllCoursesStudents,
        totalCourseStudents,
        activeStudentList.length,
        filteredStudents.length
      );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {tInst("enrolledStudentsTitle")}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[var(--color-primary-main)] border border-slate-200 text-xs font-bold">
              {displayTotalCount}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {isAr
              ? "قائمة بالطلاب المسجلين في دوراتك التدريبية ومستوى تقدمهم الأكاديمي"
              : "List of students enrolled in your courses and their learning progress"}
          </p>
        </div>

        {/* Filters Bar: Course Selector + Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Course Dropdown Selector (US-17) */}
          {courses.length > 0 && (
            <div className="relative min-w-[200px]">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/10 focus:outline-none transition-all cursor-pointer truncate"
              >
                <option value="all">
                  {isAr ? "جميع الدورات التدريبية" : "All Courses"}
                </option>
                {courses.map((course) => (
                  <option key={course.id} value={String(course.id)}>
                    {(isAr ? course.titleAr : course.titleEn) || course.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Student Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 -translate-y-1/2 rtl:right-3.5 ltr:left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder={tDash("searchStudentPlaceholder")}
              className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 rtl:pr-10 ltr:pl-10 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/10 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* 403 Forbidden Access State */}
      {forbiddenError && (
        <div className="p-6 rounded-3xl border border-rose-200 bg-rose-50/60 text-rose-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-700">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-rose-900">
              {isAr ? "غير مصرح لك بالوصول" : "Access Forbidden"}
            </h4>
            <p className="text-xs text-rose-700 font-medium mt-0.5">
              {forbiddenError}
            </p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading || isLoadingCourseStudents ? (
        <div className="rounded-3xl border border-slate-200/80 overflow-hidden bg-white p-6 space-y-4">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-100">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-1/3 rounded" />
                  <Skeleton className="h-3 w-1/4 rounded" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Students Table */
        <div className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white shadow-2xs">
          {!forbiddenError && paginatedStudents.length === 0 ? (
            <div className="py-16 text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mx-auto text-slate-400">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-700">
                {selectedCourseId !== "all"
                  ? isAr
                    ? "لا يوجد طلاب مسجلون في هذه الدورة بعد."
                    : "No students enrolled in this course yet."
                  : tInst("noEnrolledStudents")}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {studentSearch.trim()
                  ? isAr
                    ? "لم يتم العثور على أي طالب يطابق بحثك."
                    : "No students match your search criteria."
                  : tInst("noEnrolledStudentsDesc")}
              </p>
            </div>
          ) : !forbiddenError ? (
            <>
              <div className="w-full">
                {/* Desktop Table View */}
                <table className="w-full text-start text-xs font-semibold text-slate-700 hidden lg:table">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5 text-start whitespace-nowrap">
                        {tInst("studentCol")}
                      </th>
                      <th className="px-5 py-3.5 text-start whitespace-nowrap">
                        {tInst("courseCol")}
                      </th>
                      <th className="px-5 py-3.5 text-start whitespace-nowrap">
                        {isAr ? "تاريخ التسجيل" : "Enrolled Date"}
                      </th>
                      <th className="px-5 py-3.5 text-start whitespace-nowrap">
                        {tInst("progressCol")}
                      </th>
                      <th className="px-5 py-3.5 text-start whitespace-nowrap">
                        {isAr ? "الحالة" : "Status"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {paginatedStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-brand-dark/10 text-[var(--color-primary-main)] font-black text-xs flex items-center justify-center shrink-0 border border-brand-dark/20 overflow-hidden">
                              {student.avatar ? (
                                <Image
                                  src={student.avatar}
                                  alt={student.name}
                                  width={36}
                                  height={36}
                                  unoptimized
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                student.name.charAt(0)
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate max-w-[150px]">
                                {student.name}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600 font-medium max-w-[200px] truncate">
                          {student.course}
                        </td>
                        <td className="px-5 py-4 text-slate-400 font-normal whitespace-nowrap">
                          {student.date || "—"}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-20 sm:w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  student.progress === 100
                                    ? "bg-[var(--color-primary-dark)]"
                                    : "bg-brand-dark"
                                }`}
                                style={{ width: `${Math.min(100, Math.max(0, student.progress))}%` }}
                              />
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                student.progress === 100
                                  ? "bg-slate-200 text-[var(--color-primary-main)]"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {student.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              student.status === "completed" || student.progress === 100
                                ? "bg-slate-100 text-[var(--color-primary-main)] border border-slate-200"
                                : "bg-blue-50 text-blue-800 border border-blue-200"
                            }`}
                          >
                            {student.status === "completed" || student.progress === 100 ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-[var(--color-primary-main)]" />
                                <span>{isAr ? "مكتمل" : "Completed"}</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-blue-600" />
                                <span>{isAr ? "مستمر" : "Active"}</span>
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Cards View */}
                <div className="grid grid-cols-1 gap-3 p-3 lg:hidden bg-slate-50/50">
                  {paginatedStudents.map((student) => (
                    <div key={student.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-brand-dark/10 text-[var(--color-primary-main)] font-black text-sm flex items-center justify-center shrink-0 border border-brand-dark/20 overflow-hidden">
                            {student.avatar ? (
                              <Image
                                src={student.avatar}
                                alt={student.name}
                                width={40}
                                height={40}
                                unoptimized
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              student.name.charAt(0)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate text-sm">
                              {student.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {student.email}
                            </p>
                          </div>
                        </div>
                        <span
                            className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-extrabold ${
                              student.status === "completed" || student.progress === 100
                                ? "bg-slate-100 text-[var(--color-primary-main)] border border-slate-200"
                                : "bg-blue-50 text-blue-800 border border-blue-200"
                            }`}
                          >
                            {student.status === "completed" || student.progress === 100 ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-[var(--color-primary-main)]" />
                                <span>{isAr ? "مكتمل" : "Completed"}</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-blue-600" />
                                <span>{isAr ? "مستمر" : "Active"}</span>
                              </>
                            )}
                          </span>
                      </div>
                      
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">{tInst("courseCol")}:</span>
                          <span className="text-slate-700 font-bold truncate max-w-[160px]" title={student.course}>{student.course}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">{isAr ? "التاريخ" : "Date"}:</span>
                          <span className="text-slate-600 font-medium">{student.date || "—"}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 mt-1">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-500 uppercase tracking-wider">{tInst("progressCol")}</span>
                          <span className={student.progress === 100 ? "text-[var(--color-primary-main)]" : "text-[var(--color-primary-main)]"}>{student.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              student.progress === 100
                                ? "bg-[var(--color-primary-dark)]"
                                : "bg-brand-dark"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, student.progress))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <div>
                    {isAr ? (
                      <span>
                        صفحة {currentPage} من {totalPages}
                      </span>
                    ) : (
                      <span>
                        Page {currentPage} of {totalPages}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                      <span>{isAr ? "السابق" : "Previous"}</span>
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>{isAr ? "التالي" : "Next"}</span>
                      {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default InstructorStudentsTab;
