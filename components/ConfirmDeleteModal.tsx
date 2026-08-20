'use client';
import React from 'react';
import { Card } from '@/components/Card';

export default function ConfirmDeleteModal({ open, onClose, title, description, onConfirm, loading }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{description}</p>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-xl">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-xl">{loading ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Card>
    </div>
  );
}
