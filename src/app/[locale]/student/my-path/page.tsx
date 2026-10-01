"use client";

import React from "react";
import { useLocale } from "next-intl";
import { MyPathWizard } from "@/components/student/mypath/MyPathWizard";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function StudentMyPathPage() {
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  return (
    <div className="w-full">
      <ErrorBoundary
        title={isAr ? "تعذر تحميل مسار التعلم الذكي" : "My Path Loading Error"}
        description={
          isAr
            ? "حدث خطأ أثناء تحميل خريطة مسار التعلم التفاعلية. يرجى إعادة المحاولة."
            : "An unexpected error occurred while loading your personalized learning path. Please try again."
        }
        resetText={isAr ? "إعادة المحاولة" : "Try Again"}
      >
        <MyPathWizard />
      </ErrorBoundary>
    </div>
  );
}
