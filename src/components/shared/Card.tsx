import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  hover?: boolean;
  glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = false, glass = false, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-xl p-4 border',
          glass
            ? 'glass'
            : 'bg-neutral-900 border-neutral-800',
          hover && 'card-hover cursor-pointer',
          className
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return (
    <h3 className={cn('text-xl font-semibold text-neutral-100', className)}>
      {children}
    </h3>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return (
    <div className={cn('text-neutral-300', className)}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return (
    <div className={cn('mt-4 flex items-center gap-2', className)}>
      {children}
    </div>
  );
};
