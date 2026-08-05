import React from "react";
import type { FormFieldProps } from "@/types";

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      id,
      label,
      error,
      icon,
      trailing,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className="group w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 transition-colors duration-200 group-focus-within:text-[#0F5244]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 transition-all duration-200 group-focus-within:text-[#0F5244] group-focus-within:scale-110">
              {icon}
            </div>
          )}
          <input
            id={id}
            name={id}
            ref={ref}
            className={`h-10.5 sm:h-11 w-full rounded-xl border border-slate-200/90 bg-white/95 px-3.5 text-xs sm:text-sm text-slate-900 font-semibold leading-normal outline-none shadow-none transition-all duration-200 placeholder:text-slate-400 placeholder:font-normal hover:border-[#0F5244]/40 hover:shadow-xs focus:border-[#0F5244] focus:bg-white focus:ring-2 focus:ring-[#0F5244]/15 focus:shadow-[0_2px_8px_rgba(15,82,68,0.08)] ${
              icon ? "ps-10" : ""
            } ${trailing ? "pe-10" : ""} ${
              error
                ? "border-red-400 text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/15 focus:shadow-[0_2px_8px_rgba(239,68,68,0.08)]"
                : ""
            } ${className}`}
            {...props}
          />
          {trailing && (
            <div className="absolute end-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
              {trailing}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs font-normal text-red-500">{error}</p>}
      </div>
    );
  }
);

FormField.displayName = "FormField";

