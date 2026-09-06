"use client";

import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-slate-100 rounded-xl before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent ${className}`}
      {...props}
    />
  );
}

/**
 * Skeleton for standard catalog course card & compact cards
 */
export function CourseCardSkeleton({
  count = 1,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={`course-skeleton-${i}`}
          className={`flex flex-col h-full rounded-2xl bg-white border border-slate-200/80 p-0 overflow-hidden shadow-2xs ${className}`}
        >
          {/* Thumbnail Skeleton (16/10) */}
          <Skeleton className="w-full aspect-[16/10] rounded-none bg-slate-200/80" />

          {/* Body Skeleton */}
          <div className="flex flex-col flex-1 p-4 sm:p-5 justify-between space-y-4">
            <div className="space-y-2.5">
              {/* Category pill */}
              <Skeleton className="h-4 w-20 rounded-md" />
              {/* Title lines */}
              <Skeleton className="h-5 w-full rounded-md" />
              <Skeleton className="h-5 w-3/4 rounded-md" />
              {/* Instructor */}
              <Skeleton className="h-4 w-1/3 rounded-md mt-1" />
            </div>

            {/* Footer */}
            <div className="space-y-3 pt-2">
              <Skeleton className="h-4 w-28 rounded-md" />
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Skeleton for student workspace course card
 */
export function StudentCourseCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={`student-skeleton-${i}`}
          className="h-full flex flex-col justify-between rounded-3xl border border-slate-200/80 p-5 bg-white space-y-4 shadow-2xs"
        >
          {/* Cover */}
          <Skeleton className="w-full aspect-[16/10] rounded-2xl bg-slate-200/80" />

          {/* Details */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-5/6 rounded-md" />
            <Skeleton className="h-4 w-1/3 rounded-md" />
          </div>

          {/* Progress & Button */}
          <div className="mt-auto pt-4 space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16 rounded-md" />
                <Skeleton className="h-3 w-8 rounded-md" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Skeleton for instructor workspace course row
 */
export function RowCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={`row-skeleton-${i}`}
          className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 bg-white shadow-2xs space-y-4"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0 w-full lg:w-auto">
              {/* Thumbnail */}
              <Skeleton className="w-24 h-20 sm:w-32 sm:h-24 rounded-2xl shrink-0 bg-slate-200/80" />

              {/* Info */}
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-48 sm:w-64 rounded-md" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-14 rounded-md" />
                  <Skeleton className="h-4 w-28 rounded-xl" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Skeleton for dashboard metric tiles
 */
export function MetricCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={`metric-skeleton-${i}`}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-14 h-5 rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-20 rounded-md" />
            <Skeleton className="h-3.5 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </>
  );
}
