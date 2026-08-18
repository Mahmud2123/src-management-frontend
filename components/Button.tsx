'use client';
import { ButtonHTMLAttributes, FC } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'danger';
}

export const Button: FC<ButtonProps> = ({ children, className, variant = 'default', ...props }) => {
  const base = 'px-4 py-2 rounded-md font-semibold transition-colors';
  const variantClass = variant === 'default'
    ? 'bg-green-600 text-white hover:bg-green-700'
    : variant === 'secondary'
    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
    : 'bg-red-600 text-white hover:bg-red-700';

  return (
    <button
      {...props}
      className={clsx(base, variantClass, className)}
    >
      {children}
    </button>
  );
};