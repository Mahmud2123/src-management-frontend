'use client';
import { TextareaHTMLAttributes, FC } from 'react';
import clsx from 'clsx';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: FC<TextareaProps> = ({ label, error, className, ...props }) => (
  <div className="flex flex-col space-y-1">
    {label && <label className="font-medium">{label}</label>}
    <textarea
      {...props}
      className={clsx(
        'border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400',
        error && 'border-red-500',
        className
      )}
    />
    {error && <span className="text-red-500 text-sm">{error}</span>}
  </div>
);
