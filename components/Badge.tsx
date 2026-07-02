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
<<<<<<< HEAD
      'px-2 py-1 rounded-full text-sm font-semibold transition-colors duration-300',
      variant === 'default' 
        ? 'bg-green-500 dark:bg-green-600 text-white' 
        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
=======
      'px-2 py-1 rounded-full text-sm font-semibold',
      variant === 'default' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800',
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
      className
    )}
  >
    {children}
  </div>
<<<<<<< HEAD
);
=======
);
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
