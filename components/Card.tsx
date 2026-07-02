'use client';
import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';

export const Card: FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div 
    {...props} 
    className={clsx(
<<<<<<< HEAD
      'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
=======
      'bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
      'flex flex-col overflow-hidden',
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
