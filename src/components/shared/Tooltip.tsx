import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  delay = 200,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);
  let timeoutId: NodeJS.Timeout;

  const handleMouseEnter = () => {
    timeoutId = setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'absolute z-50 px-2 py-1 text-xs font-medium text-white bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg whitespace-nowrap pointer-events-none',
              positions[side],
              className
            )}
          >
            {content}
            <div
              className={cn(
                'absolute w-2 h-2 bg-neutral-900 border-neutral-700 transform rotate-45',
                side === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2 border-b border-r',
                side === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2 border-t border-l',
                side === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2 border-t border-r',
                side === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2 border-b border-l'
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
