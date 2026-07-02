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
      className
    )}
  >
    {children}
  </div>
