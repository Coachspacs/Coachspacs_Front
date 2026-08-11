"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function CategoriesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "ar";

  useEffect(() => {
    router.replace(`/${locale}/catalog`);
  }, [locale, router]);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F5244]" />
    </div>
  );
}
