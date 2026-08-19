"use client";

import { useParams } from "next/navigation";
import { RegisterCard } from "@/components/auth/RegisterCard";

export default function RegisterPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const lang = locale === "ar" ? "AR" : "EN";

  return (
    <div className="w-full max-w-[440px]">
      <RegisterCard lang={lang} />
    </div>
  );
}
