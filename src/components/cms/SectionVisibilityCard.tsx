"use client";

import React from "react";
import { SectionRolePermission } from "@/types/cms";
import {
  Globe,
  User,
  Lock,
  GraduationCap,
  UserCheck,
  Shield,
} from "lucide-react";

interface SectionVisibilityCardProps {
  title: string;
  isVisible: boolean;
  allowedRoles?: SectionRolePermission[];
  onToggleVisible: (val: boolean) => void;
  onRolesChange: (roles: SectionRolePermission[]) => void;
  isAr: boolean;
}

export function SectionVisibilityCard({
  title,
  isVisible,
  allowedRoles = ["all"],
  onToggleVisible,
  onRolesChange,
  isAr,
}: SectionVisibilityCardProps) {
  const rolesOptions: { id: SectionRolePermission; labelAr: string; labelEn: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "all", labelAr: "الجميع (عام)", labelEn: "Everyone (Public)", icon: Globe },
    { id: "guest", labelAr: "الزوار فقط", labelEn: "Guests Only", icon: User },
    { id: "authenticated", labelAr: "المستخدمين المسجلين", labelEn: "Authenticated", icon: Lock },
    { id: "student", labelAr: "الطلاب فقط", labelEn: "Students Only", icon: GraduationCap },
    { id: "instructor", labelAr: "المدربين فقط", labelEn: "Instructors Only", icon: UserCheck },
    { id: "admin", labelAr: "المديرين فقط", labelEn: "Admins Only", icon: Shield },
  ];

  const currentRole = allowedRoles[0] || "all";

  return (
    <div className="bg-white/80 border border-slate-200/90 rounded-xl p-3.5 space-y-3 mb-4 transition-all shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {isVisible && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-light opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isVisible ? "bg-brand-dark" : "bg-slate-400"
              }`}
            />
          </span>
          <h4 className="text-xs font-bold text-slate-900 leading-none">
            {isAr ? `إعدادات الظهور والصلاحيات - ${title}` : `Visibility & Audience - ${title}`}
          </h4>
        </div>

        {/* Toggle Switch & Status Badge */}
        <label className="inline-flex items-center gap-2 cursor-pointer select-none shrink-0">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => onToggleVisible(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-brand-dark relative"></div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border transition-all ${
            isVisible
              ? "text-brand-dark bg-slate-50/80 border-slate-200/80"
              : "text-slate-500 bg-slate-100 border-slate-200"
          }`}>
            {isVisible
              ? isAr
                ? "مفعل (ظاهر)"
                : "Active"
              : isAr
              ? "معطل (مخفي)"
              : "Hidden"}
          </span>
        </label>
      </div>

      {/* Target Audience Roles Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-700">
            {isAr ? "الجمهور المستهدف والصلاحيات المسموح لها بالعرض:" : "Target Audience & Display Permission:"}
          </label>
          <span className="text-[10px] text-slate-500 font-medium">
            {isAr ? "يتم تطبيق الصلاحيات تلقائياً" : "Applied automatically"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {rolesOptions.map((opt) => {
            const isSelected = currentRole === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onRolesChange([opt.id])}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 justify-center ${
                  isSelected
                    ? "bg-brand-dark border-brand-dark text-white shadow-xs"
                    : "bg-slate-50 hover:bg-white border-slate-200/90 text-slate-700 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-slate-300" : "text-slate-500"}`} />
                <span className="truncate">{isAr ? opt.labelAr : opt.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SectionVisibilityCard;
