"use client";

import React, { useState, useRef, useEffect } from "react";
import { SectionRolePermission } from "@/types/cms";
import {
  Globe,
  User,
  Lock,
  GraduationCap,
  UserCheck,
  Shield,
  ChevronDown,
  Check,
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const rolesOptions: { id: SectionRolePermission; labelAr: string; labelEn: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "all", labelAr: "الجميع (عام للكل)", labelEn: "Everyone (Public)", icon: Globe },
    { id: "guest", labelAr: "الزوار فقط", labelEn: "Guests Only", icon: User },
    { id: "authenticated", labelAr: "المسجلين عموماً", labelEn: "Authenticated", icon: Lock },
    { id: "student", labelAr: "الطلاب فقط", labelEn: "Students Only", icon: GraduationCap },
    { id: "instructor", labelAr: "المدربين فقط", labelEn: "Instructors Only", icon: UserCheck },
    { id: "admin", labelAr: "المديرين فقط", labelEn: "Admins Only", icon: Shield },
  ];

  const currentRole = allowedRoles[0] || "all";
  const currentRoleObj = rolesOptions.find((r) => r.id === currentRole) || rolesOptions[0];
  const CurrentRoleIcon = currentRoleObj.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white/80 border border-slate-200/90 rounded-xl p-3.5 space-y-3 mb-4 transition-all shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {isVisible && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isVisible ? "bg-[#0F5244]" : "bg-slate-400"
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
          <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#0F5244] relative"></div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border transition-all ${
            isVisible
              ? "text-[#0F5244] bg-emerald-50/80 border-emerald-200/80"
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

      {/* Target Audience Roles Dropdown */}
      <div className="space-y-1.5 relative" ref={dropdownRef}>
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-700">
            {isAr ? "الجمهور المستهدف والصلاحيات المسموح لها بالعرض:" : "Target Audience & Display Permission:"}
          </label>
          <span className="text-[10px] text-slate-500 font-medium">
            {isAr ? "يتم تطبيق الصلاحيات تلقائياً" : "Applied automatically"}
          </span>
        </div>

        {/* Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full bg-slate-50 hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 flex items-center justify-between transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-emerald-100/80 text-[#0F5244] flex items-center justify-center shrink-0">
              <CurrentRoleIcon className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-900">
              {isAr ? currentRoleObj.labelAr : currentRoleObj.labelEn}
            </span>
          </div>

          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#0F5244]" : ""}`} />
        </button>

        {/* Dropdown Menu List */}
        {isOpen && (
          <div className="absolute top-full mt-1.5 inset-x-0 z-30 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95">
            {rolesOptions.map((opt) => {
              const isSelected = currentRole === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onRolesChange([opt.id]);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50 text-[#0F5244] font-bold border border-emerald-200/80"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${isSelected ? "bg-emerald-100 text-[#0F5244]" : "bg-slate-100 text-slate-500"}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span>{isAr ? opt.labelAr : opt.labelEn}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-[#0F5244] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SectionVisibilityCard;
