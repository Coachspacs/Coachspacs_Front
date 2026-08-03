"use client";

import { useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
  lang?: "EN" | "AR";
}

export function PasswordStrength({ password, lang = "EN" }: PasswordStrengthProps) {
  const isAr = lang === "AR";

  const stats = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return {
      score,
      hasLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  if (!password) return null;

  const getLabel = () => {
    switch (stats.score) {
      case 0:
      case 1:
        return { text: isAr ? "ضعيفة جداً" : "Very Weak", color: "bg-red-500", textColor: "text-red-600" };
      case 2:
        return { text: isAr ? "ضعيفة" : "Weak", color: "bg-amber-500", textColor: "text-amber-600" };
      case 3:
        return { text: isAr ? "جيدة" : "Good", color: "bg-emerald-500", textColor: "text-emerald-600" };
      case 4:
        return { text: isAr ? "قوية جداً" : "Strong", color: "bg-teal-600", textColor: "text-teal-700" };
      default:
        return { text: "", color: "bg-slate-200", textColor: "text-slate-500" };
    }
  };

  const labelInfo = getLabel();

  return (
    <div className="mt-2 space-y-2 rounded-xl bg-slate-50/90 p-3 border border-slate-200/70 shadow-inner">
      {/* Strength Bar */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {isAr ? "قوة كلمة المرور:" : "Password Strength:"}
        </span>
        <span className={`text-xs font-bold ${labelInfo.textColor}`}>
          {labelInfo.text}
        </span>
      </div>

      <div className="flex h-1.5 w-full gap-1.5 overflow-hidden rounded-full bg-slate-200">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full flex-1 transition-all duration-300 ${
              step <= stats.score ? labelInfo.color : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      {/* Criteria checklist */}
      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          {stats.hasLength ? (
            <Check size={13} className="text-emerald-600 shrink-0" />
          ) : (
            <X size={13} className="text-slate-400 shrink-0" />
          )}
          <span>{isAr ? "8 خانات على الأقل" : "Min 8 characters"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {stats.hasUpper ? (
            <Check size={13} className="text-emerald-600 shrink-0" />
          ) : (
            <X size={13} className="text-slate-400 shrink-0" />
          )}
          <span>{isAr ? "حرف كبير (A-Z)" : "Uppercase letter"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {stats.hasNumber ? (
            <Check size={13} className="text-emerald-600 shrink-0" />
          ) : (
            <X size={13} className="text-slate-400 shrink-0" />
          )}
          <span>{isAr ? "رقم (0-9)" : "Number"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {stats.hasSpecial ? (
            <Check size={13} className="text-emerald-600 shrink-0" />
          ) : (
            <X size={13} className="text-slate-400 shrink-0" />
          )}
          <span>{isAr ? "رمز خاص (!@#$)" : "Special character"}</span>
        </div>
      </div>
    </div>
  );
}
