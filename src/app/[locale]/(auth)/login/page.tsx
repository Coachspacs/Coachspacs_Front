"use client";

import { useParams } from "next/navigation";
import { LoginCard } from "@/components/auth/LoginCard";

export default function LoginPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const lang = locale === "ar" ? "AR" : "EN";

  return (
    <div className="w-full max-w-[440px]">
      <LoginCard lang={lang} />
    </div>
  );
}
