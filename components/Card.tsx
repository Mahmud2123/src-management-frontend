'use client';
import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';

export const Card: FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div 
    {...props} 
    className={clsx(
      'bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
      'flex flex-col overflow-hidden',
      className
    )}
  >
    {children}
  </div>
);

