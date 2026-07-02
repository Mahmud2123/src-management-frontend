'use client';
import { ButtonHTMLAttributes, FC } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary';
}

export const Button: FC<ButtonProps> = ({ children, className, variant = 'default', ...props }) => {
  return (
    <button
      {...props}
      className={clsx(
        'px-4 py-2 rounded-md font-semibold transition-colors',
        variant === 'default' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        className
      )}
    >
      {children}
    </button>
  );
};
