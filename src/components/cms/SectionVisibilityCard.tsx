"use client";

import React from "react";
import { SectionRolePermission } from "@/types/cms";

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
  const rolesOptions: { id: SectionRolePermission; labelAr: string; labelEn: string; icon: string }[] = [
    { id: "all", labelAr: "الجميع (عام للكل)", labelEn: "Everyone (Public)", icon: "🌍" },
    { id: "guest", labelAr: "الزوار فقط", labelEn: "Guests Only", icon: "👤" },
    { id: "authenticated", labelAr: "المسجلين عموماً", labelEn: "Authenticated", icon: "🔐" },
    { id: "student", labelAr: "الطلاب فقط", labelEn: "Students Only", icon: "🎓" },
    { id: "instructor", labelAr: "المدربين فقط", labelEn: "Instructors Only", icon: "🧑‍🏫" },
    { id: "admin", labelAr: "المديرين فقط", labelEn: "Admins Only", icon: "🛡️" },
  ];

  const currentRole = allowedRoles[0] || "all";

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4.5 space-y-4 mb-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isVisible ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
            }`}
          />
          <h4 className="text-xs sm:text-sm font-black text-white">
            {isAr ? `إعدادات ظهور وصلاحيات (${title})` : `Visibility & Audience Permissions (${title})`}
          </h4>
        </div>

        {/* Toggle Switch */}
        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => onToggleVisible(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-5.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-600 relative"></div>
          <span className={`text-xs font-bold ${isVisible ? "text-emerald-400" : "text-slate-400"}`}>
            {isVisible
              ? isAr
                ? "القسم مفعل (ظاهر)"
                : "Section Active"
              : isAr
              ? "القسم معطل (مخفي)"
              : "Section Hidden"}
          </span>
        </label>
      </div>

      {/* Target Audience Roles */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">
            {isAr ? "الجمهور المستهدف والصلاحيات المسموح لها بالعرض:" : "Target Audience & Display Permission:"}
          </span>
          <span className="text-[11px] font-mono text-emerald-400">
            {isAr ? "يتم تطبيق الصلاحيات تلقائياً" : "Applied automatically"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {rolesOptions.map((opt) => {
            const isSelected = currentRole === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onRolesChange([opt.id])}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 justify-center ${
                  isSelected
                    ? "bg-emerald-600 border-emerald-500 text-white shadow-xs"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{opt.icon}</span>
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
