import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hoverEffect = true, children, ...props }) => {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-6 transition-all duration-300',
        hoverEffect && 'glass-card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
