import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 shadow-none transition-all text-sm outline-none hover:border-[#0F5244]/50 hover:shadow-xs focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/20 focus:shadow-[0_2px_8px_rgba(15,82,68,0.12)]',
            error && 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:shadow-[0_2px_8px_rgba(239,68,68,0.12)]',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
