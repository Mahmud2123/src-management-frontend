'use client';
import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary';
}

export const Badge: FC<BadgeProps> = ({ children, variant = 'default', className, ...props }) => (
  <div
    {...props}
    className={clsx(
      'px-2 py-1 rounded-full text-sm font-semibold transition-colors duration-300',
      variant === 'default' 
        ? 'bg-green-500 dark:bg-green-600 text-white' 
        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      className
    )}
  >
    {children}
  </div>
);