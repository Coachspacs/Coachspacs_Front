"use client";

import { useParams } from "next/navigation";
import { ForgotPasswordCard } from "@/components/auth/ForgotPasswordCard";

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const lang = locale === "ar" ? "AR" : "EN";

  return (
    <div className="w-full max-w-[460px]">
      <ForgotPasswordCard lang={lang} />
    </div>
  );
}
