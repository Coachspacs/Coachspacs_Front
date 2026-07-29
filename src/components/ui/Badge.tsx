import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'accent' | 'gold' | 'outline' | 'slate';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'brand', children, ...props }) => {
  const variants = {
    brand: 'bg-brand-500/10 text-brand-400 border border-brand-500/20',
    accent: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    gold: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    outline: 'border border-slate-700 text-slate-300',
    slate: 'bg-slate-800 text-slate-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
