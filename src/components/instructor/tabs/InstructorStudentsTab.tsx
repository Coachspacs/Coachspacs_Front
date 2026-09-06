"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Search, Users, UserCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

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
  studentSearch: string;
  setStudentSearch: (query: string) => void;
  isLoading?: boolean;
}

export function InstructorStudentsTab({
  students,
  studentSearch,
  setStudentSearch,
  isLoading = false,
}: InstructorStudentsTabProps) {
  const tInst = useTranslations("instructorSettings");
  const tDash = useTranslations("instructorDashboard");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.course.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {tInst("enrolledStudentsTitle")}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0F5244] border border-emerald-200 text-xs font-bold">
              {students.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {isAr
              ? "قائمة بالطلاب المسجلين في دوراتك التدريبية ومستوى تقدمهم"
              : "List of students enrolled in your courses and their learning progress"}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute top-1/2 -translate-y-1/2 rtl:right-3.5 ltr:left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            placeholder={tDash("searchStudentPlaceholder")}
            className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 rtl:pr-10 ltr:pl-10 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
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
          {filteredStudents.length === 0 ? (
            <div className="py-16 text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mx-auto text-slate-400">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-700">
                {tInst("noEnrolledStudents")}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {studentSearch.trim()
                  ? isAr
                    ? "لم يتم العثور على أي طالب يطابق بحثك."
                    : "No students match your search criteria."
                  : tInst("noEnrolledStudentsDesc")}
              </p>
            </div>
          ) : (
            <table className="w-full text-start text-xs font-semibold text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="px-5 py-3.5 text-start">
                    {tInst("studentCol")}
                  </th>
                  <th className="px-5 py-3.5 text-start">
                    {tInst("courseCol")}
                  </th>
                  <th className="px-5 py-3.5 text-start">
                    {isAr ? "تاريخ التسجيل" : "Enrolled Date"}
                  </th>
                  <th className="px-5 py-3.5 text-start">
                    {tInst("progressCol")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0F5244]/10 text-[#0F5244] font-black text-xs flex items-center justify-center shrink-0 border border-[#0F5244]/20 overflow-hidden">
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            student.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {student.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">
                      {student.course}
                    </td>
                    <td className="px-5 py-4 text-slate-400 font-normal">
                      {student.date || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-20 sm:w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              student.progress === 100
                                ? "bg-emerald-600"
                                : "bg-[#0F5244]"
                            }`}
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                            student.progress === 100
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {student.progress}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
