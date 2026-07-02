'use client';
import { FC } from 'react';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

export const Select: FC<SelectProps> = ({ label, options, value, onChange, error }) => (
  <div className="flex flex-col space-y-1">
    {label && <label className="font-medium">{label}</label>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 ${error ? 'border-red-500' : ''}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <span className="text-red-500 text-sm">{error}</span>}
  </div>
);
