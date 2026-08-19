"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ResetPasswordCard } from "@/components/auth/ResetPasswordCard";

export default function ResetPasswordPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const lang = locale === "ar" ? "AR" : "EN";

  return (
    <div className="w-full max-w-[460px]">
      <Suspense
        fallback={
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0F5244]" />
          </div>
        }
      >
        <ResetPasswordCard lang={lang} />
      </Suspense>
    </div>
  );
}
