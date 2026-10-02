import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`}
      {...props}
    />
  );
}

export function CourseCardSkeleton({ count = 1 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4"
        >
          {/* Cover Image Skeleton */}
          <Skeleton className="w-full aspect-video rounded-2xl" />

          {/* Content */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <Skeleton className="h-5 w-4/5 rounded-lg" />
            <Skeleton className="h-4 w-3/5 rounded-lg" />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </>
  );
}

export function StudentCourseCardSkeleton({ count = 1 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3"
        >
          <Skeleton className="w-full aspect-video rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16 rounded-sm" />
              <Skeleton className="h-3 w-10 rounded-sm" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <Skeleton className="h-9 w-full rounded-xl mt-2" />
        </div>
      ))}
    </>
  );
}

export function RowCardSkeleton({ count = 1 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1 sm:w-64">
              <Skeleton className="h-5 w-4/5 rounded-lg" />
              <Skeleton className="h-4 w-2/5 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Skeleton className="h-8 w-20 rounded-xl" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </>
  );
}

