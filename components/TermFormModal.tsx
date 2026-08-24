'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client2';

export default function TermFormModal({ open, onClose, initial }: any) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: initial?.name || '', startYear: initial?.startYear || '', endYear: initial?.endYear || '', description: initial?.description || '', isCurrent: initial?.isCurrent || false });

  useEffect(()=>{ setForm({ name: initial?.name || '', startYear: initial?.startYear || '', endYear: initial?.endYear || '', description: initial?.description || '', isCurrent: initial?.isCurrent || false }); }, [initial]);

  const createMutation = useMutation({
      mutationFn: async (payload:any) => {
        const res = await apiClient.post('/excos/terms', payload);
        return res.data;
      },
      onSuccess: ()=>{ toast.success('Term created'); queryClient.invalidateQueries({ queryKey: ['exco-terms'] }); onClose(); },
      onError: (err:any)=>{ toast.error(err?.response?.data?.message || err?.message || 'Failed to create term'); }
    });

    const updateMutation = useMutation({
      mutationFn: async ({ id, data }: any) => {
        const res = await apiClient.put(`/excos/terms/${id}`, data);
        return res.data;
      },
      onSuccess: ()=>{ toast.success('Term updated'); queryClient.invalidateQueries({ queryKey: ['exco-terms'] }); onClose(); },
      onError: (err:any)=>{ toast.error(err?.response?.data?.message || err?.message || 'Failed to update term'); }
    });

  if (!open) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedName = form.name.trim();
    const sy = Number(form.startYear);
    const ey = Number(form.endYear);

    if (!Number.isFinite(sy) || !Number.isFinite(ey) || !form.startYear || !form.endYear) {
      toast.error('Please provide valid start and end years.');
      return;
    }

    if (sy > ey) {
      toast.error('Start year must be less than or equal to end year.');
      return;
    }

    const effectiveName = trimmedName || `${sy}/${ey} SRC Executive`;
    const payload = {
      name: effectiveName,
      startYear: sy,
      endYear: ey,
      isCurrent: !!form.isCurrent,
      description: form.description?.trim() || '',
    };

    try {
      if (initial && initial.id) {
        await updateMutation.mutateAsync({ id: initial.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (err:any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to save term';
      toast.error(message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-md p-6 sm:p-8 border-0 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{initial?.id ? 'Edit Term' : 'Add Term'}</h2>
          <button onClick={onClose} className="text-sm text-gray-600">Cancel</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600">Name *</label>
            <input value={form.name} onChange={(e)=>setForm(s=>({...s, name: e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600">Start Year *</label>
              <input type="number" value={form.startYear} onChange={(e)=>setForm(s=>({...s, startYear: e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600">End Year *</label>
              <input type="number" value={form.endYear} onChange={(e)=>setForm(s=>({...s, endYear: e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={form.isCurrent} onChange={(e)=>setForm(s=>({...s, isCurrent: e.target.checked}))} />
            <label className="text-sm">Mark as current term</label>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-green-700 text-white rounded-xl">{(createMutation as any).status === 'loading' || (updateMutation as any).status === 'loading' ? 'Saving...' : 'Save Term'}</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
