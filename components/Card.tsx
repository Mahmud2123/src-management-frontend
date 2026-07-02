'use client';
import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';

export const Card: FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div 
    {...props} 
    className={clsx(
      'flex flex-col overflow-hidden',
      className
    )}
  >
    {children}
  </div>
