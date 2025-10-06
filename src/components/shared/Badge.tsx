import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'primary', size = 'md', children, className, ...props }, ref) => {
    const variants = {
      primary: 'badge-primary',
      success: 'badge-success',
      warning: 'badge-warning',
      error: 'badge-error',
      neutral: 'bg-neutral-800 text-neutral-300 border-neutral-700'
    };

    const sizes = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-sm px-2.5 py-0.5',
      lg: 'text-base px-3 py-1'
    };

    return (
      <span
        ref={ref}
        className={cn('badge', variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
