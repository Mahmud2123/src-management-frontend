'use client';
import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';

export const Card: FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div {...props} className={clsx('bg-white dark:bg-gray-800 shadow rounded-md', className)}>
    {children}
  </div>
);
