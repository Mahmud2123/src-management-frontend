'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client2';
import { uploadAnnouncementImage } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function ExecFormModal({ open, onClose, initial, terms }: any) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<any>({
    name: initial?.name || '',
    position: initial?.position || '',
    title: initial?.title || '',
    bio: initial?.bio || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    department: initial?.department || '',
    faculty: initial?.faculty || '',
    startDate: initial?.startDate ? initial.startDate.split('T')[0] : '',
    endDate: initial?.endDate ? initial.endDate.split('T')[0] : '',
    isCurrent: initial?.isCurrent || false,
    termId: initial?.termId || '',
    termYear: initial?.termYear || (terms && terms[0]?.name) || '',
    displayOrder: initial?.displayOrder ?? 0,
    isActive: initial?.isActive ?? true,
    avatarFile: null,
    avatarPreview: initial?.avatarUrl || null,
  });

  useEffect(() => {
    setForm((f:any) => ({
      ...f,
      name: initial?.name || '',
      position: initial?.position || '',
      title: initial?.title || '',
      bio: initial?.bio || '',
      email: initial?.email || '',
      phone: initial?.phone || '',
      department: initial?.department || '',
      faculty: initial?.faculty || '',
      startDate: initial?.startDate ? initial.startDate.split('T')[0] : '',
      endDate: initial?.endDate ? initial.endDate.split('T')[0] : '',
      isCurrent: initial?.isCurrent || false,
      termId: initial?.termId || '',
      termYear: initial?.termYear || (terms && terms[0]?.name) || '',
      displayOrder: initial?.displayOrder ?? 0,
      isActive: initial?.isActive ?? true,
      avatarFile: null,
      avatarPreview: initial?.avatarUrl || null,
    }));
  }, [initial, terms]);

  const createMutation = useMutation({
      mutationFn: async (payload:any) => {
        const res = await apiClient.post('/excos', payload);
        return res.data;
      },
      onSuccess: () => {
        toast.success('Executive created');
        queryClient.invalidateQueries({ queryKey: ['excos-current'] });
        queryClient.invalidateQueries({ queryKey: ['excos-past'] });
        queryClient.invalidateQueries({ queryKey: ['excos-all'] });
        onClose();
      },
      onError: (err:any) => {
        toast.error(err?.response?.data?.message || err?.message || 'Failed to create executive');
      }
    });

    const updateMutation = useMutation({
      mutationFn: async ({ id, data }: any) => {
        const res = await apiClient.put(`/excos/${id}`, data);
        return res.data;
      },
      onSuccess: () => {
        toast.success('Executive updated');
        queryClient.invalidateQueries({ queryKey: ['excos-current'] });
        queryClient.invalidateQueries({ queryKey: ['excos-past'] });
        queryClient.invalidateQueries({ queryKey: ['excos-all'] });
        onClose();
      },
      onError: (err:any) => {
        toast.error(err?.response?.data?.message || err?.message || 'Failed to update executive');
      }
    });

  if (!open) return null;

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error('Image must be <5MB'); return; }
    const allowed = ['image/jpeg','image/png','image/webp','image/gif'];
    if (!allowed.includes(f.type)) { toast.error('Invalid image type'); return; }
    setForm((p:any) => ({ ...p, avatarFile: f, avatarPreview: URL.createObjectURL(f) }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.name || !form.position || !form.startDate) { toast.error('Name, Position and Start Date are required'); return; }
    try {
      let avatarUrl = initial?.avatarUrl || null;
      if (form.avatarFile) {
        const uploaded = await uploadAnnouncementImage(form.avatarFile);
        avatarUrl = uploaded.imageUrl || uploaded.imageUrl;
      }

      const payload: any = {
        name: form.name,
        position: form.position,
        title: form.title || null,
        bio: form.bio || null,
        email: form.email || null,
        phone: form.phone || null,
        avatarUrl: avatarUrl || null,
        department: form.department || null,
        faculty: form.faculty || null,
        startDate: form.startDate,
        endDate: form.endDate || null,
        isCurrent: !!form.isCurrent,
        termYear: form.termYear || (terms.find((t:any)=>t.id===form.termId)?.name) || '',
        displayOrder: Number(form.displayOrder) || 0,
        isActive: !!form.isActive,
        termId: form.termId || null,
      };

      if (initial && initial.id) {
        await updateMutation.mutateAsync({ id: initial.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (err:any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save executive');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl p-6 sm:p-8 border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{initial?.id ? 'Edit Executive' : 'Add Executive'}</h2>
          <button onClick={onClose} className="text-sm text-gray-600">Cancel</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600">Full Name *</label>
              <input value={form.name} onChange={(e)=>setForm((p:any)=>({...p,name:e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600">Position *</label>
              <input value={form.position} onChange={(e)=>setForm((p:any)=>({...p,position:e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600">Title</label>
              <input value={form.title} onChange={(e)=>setForm((p:any)=>({...p,title:e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600">Email</label>
              <input value={form.email} onChange={(e)=>setForm((p:any)=>({...p,email:e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600">Bio</label>
            <textarea value={form.bio} onChange={(e)=>setForm((p:any)=>({...p,bio:e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl" rows={4} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600">Phone</label>
              <input value={form.phone} onChange={(e)=>setForm((p:any)=>({...p,phone:e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600">Department</label>
              <input value={form.department} onChange={(e)=>setForm((p:any)=>({...p,department:e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600">Faculty</label>
              <input value={form.faculty} onChange={(e)=>setForm((p:any)=>({...p,faculty:e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600">Start Date *</label>
              <input type="date" value={form.startDate} onChange={(e)=>setForm((p:any)=>({...p,startDate:e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600">End Date</label>
              <input type="date" value={form.endDate} onChange={(e)=>setForm((p:any)=>({...p,endDate:e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text_GRAY-600">Term</label>
              <select value={form.termId} onChange={(e)=>{ const sel = e.target.value; setForm((p:any)=>({...p,termId:sel, termYear: terms.find((t:any)=>t.id===sel)?.name || p.termYear })); }} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                <option value="">Select term (optional)</option>
                {terms && terms.map((t:any)=><option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600">Display Order</label>
              <input type="number" value={form.displayOrder} onChange={(e)=>setForm((p:any)=>({...p,displayOrder:Number(e.target.value)}))} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600">Active</label>
              <select value={form.isActive ? '1' : '0'} onChange={(e)=>setForm((p:any)=>({...p,isActive: e.target.value==='1'}))} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600">Current</label>
              <select value={form.isCurrent ? '1' : '0'} onChange={(e)=>setForm((p:any)=>({...p,isCurrent: e.target.value==='1'}))} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600">Avatar</label>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                {form.avatarPreview ? (<img src={form.avatarPreview} className="w-full h-full object-cover" />) : (<div className="text-gray-500">Preview</div>)}
              </div>
              <div>
                <input id="exco-avatar-file" type="file" accept="image/*" onChange={onFileChange} />
                <p className="text-xs text-gray-500 mt-1">Optional. JPG/PNG/WebP/GIF. Max 5MB.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl">Cancel</button>
            <button type="submit" disabled={(createMutation as any).status === 'loading' || (updateMutation as any).status === 'loading'} className="px-4 py-2 bg-green-700 text-white rounded-xl">{(createMutation as any).status === 'loading' || (updateMutation as any).status === 'loading' ? 'Saving...' : 'Save Executive'}</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
