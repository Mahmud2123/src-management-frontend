'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client2';
import { uploadAnnouncementImage, fetchFaculties, fetchDepartments } from '@/lib/api';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

export default function ExecFormModal({ open, onClose, initial, terms }: any) {
  const queryClient = useQueryClient();
  const orderedTerms = React.useMemo(() => {
    return [...(terms || [])].sort((a: any, b: any) => {
      const aYear = Number(a?.startYear ?? a?.name?.split('/')?.[0] ?? 0);
      const bYear = Number(b?.startYear ?? b?.name?.split('/')?.[0] ?? 0);
      return aYear - bYear;
    });
  }, [terms]);
  const [form, setForm] = useState<any>({
    name: initial?.name || '',
    position: initial?.position || '',
    title: initial?.title || '',
    bio: initial?.bio || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    department: initial?.department || '', // department name
    faculty: initial?.faculty || '', // faculty name
    facultyId: '', // selected faculty id
    departmentId: '', // selected department id
    startDate: initial?.startDate ? initial.startDate.split('T')[0] : '',
    endDate: initial?.endDate ? initial.endDate.split('T')[0] : '',
    isCurrent: initial?.isCurrent || false,
    termId: initial?.termId || '',
    termYear: initial?.termYear || (orderedTerms && orderedTerms[0]?.name) || '',
    displayOrder: initial?.displayOrder ?? 0,
    isActive: initial?.isActive ?? true,
    avatarFile: null,
    avatarPreview: initial?.avatarUrl || null,
  });

  const [errors, setErrors] = useState<Record<string,string>>({});

  const { data: faculties = [] } = useQuery({ queryKey: ['faculties'], queryFn: fetchFaculties, staleTime: 1000 * 60 * 60 * 24 });
  const { data: departments = [] } = useQuery({
   queryKey: ['departments', form.facultyId],
   queryFn: () => fetchDepartments(form.facultyId),
   enabled: !!form.facultyId,
  });

  // Initialize form when modal opens or initial/terms change. Use stable primitive deps and avoid unnecessary setForm calls.
  useEffect(() => {
    const next = {
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
      termYear: initial?.termYear || (orderedTerms && orderedTerms[0]?.name) || '',
      displayOrder: initial?.displayOrder ?? 0,
      isActive: initial?.isActive ?? true,
      avatarFile: null,
      avatarPreview: initial?.avatarUrl || null,
      facultyId: '',
      departmentId: '',
    };

    // Compare relevant keys to avoid unnecessary state updates
    setForm((prev:any) => {
      const prevSubset = {
        name: prev.name,
        position: prev.position,
        title: prev.title,
        bio: prev.bio,
        email: prev.email,
        phone: prev.phone,
        department: prev.department,
        faculty: prev.faculty,
        startDate: prev.startDate,
        endDate: prev.endDate,
        isCurrent: prev.isCurrent,
        termId: prev.termId,
        termYear: prev.termYear,
        displayOrder: prev.displayOrder,
        isActive: prev.isActive,
        avatarPreview: prev.avatarPreview,
      };

      const equal = JSON.stringify(prevSubset) === JSON.stringify({
        name: next.name,
        position: next.position,
        title: next.title,
        bio: next.bio,
        email: next.email,
        phone: next.phone,
        department: next.department,
        faculty: next.faculty,
        startDate: next.startDate,
        endDate: next.endDate,
        isCurrent: next.isCurrent,
        termId: next.termId,
        termYear: next.termYear,
        displayOrder: next.displayOrder,
        isActive: next.isActive,
        avatarPreview: next.avatarPreview,
      });

      if (equal) return prev;
      return { ...prev, ...next };
    });
  }, [initial?.id ?? null, terms?.length ?? 0]);

  // When faculties load, map initial.faculty name to facultyId once (if available)
  useEffect(() => {
    if (!initial?.faculty) return;
    if (!faculties || faculties.length === 0) return;

    setForm((prev:any) => {
      if (prev.facultyId) return prev; // already set
      const found = faculties.find((f:any) => String(f.name).toLowerCase() === String(initial.faculty).toLowerCase());
      return found ? { ...prev, facultyId: found.id } : prev;
    });
  }, [faculties, initial?.faculty]);

  // When departments load (after facultyId set), map initial.department name to departmentId once
  useEffect(() => {
    if (!initial?.department) return;
    if (!departments || departments.length === 0) return;

    setForm((prev:any) => {
      if (prev.departmentId) return prev; // already set
      const foundDept = departments.find((d:any) => String(d.name).toLowerCase() === String(initial.department).toLowerCase());
      return foundDept ? { ...prev, departmentId: foundDept.id } : prev;
    });
  }, [departments, initial?.department]);

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
    const newErrors: Record<string,string> = {};
    if (!form.name) newErrors.name = 'Executive name is required.';
    if (!form.position) newErrors.position = 'Please select a position.';
    if (!form.startDate) newErrors.startDate = 'Please select a start date.';
    if (!form.termId) newErrors.termId = 'Please select an executive term.';
    if (form.endDate && form.startDate && new Date(form.endDate) < new Date(form.startDate)) newErrors.endDate = 'End date cannot be before start date.';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); toast.error('Please fix form errors'); return; }
    setErrors({});
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
        department: form.department || null, // department name (string)
        faculty: form.faculty || null, // faculty name (string)
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
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600">Position *</label>
              <select value={form.position} onChange={(e)=>setForm((p:any)=>({...p,position:e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                <option value="">Select position</option>
                {(() => {
                  const POSITIONS = [
                    { value: 'PRESIDENT', label: 'President' },
                    { value: 'VICE_PRESIDENT', label: 'Vice President' },
                    { value: 'SECRETARY', label: 'Secretary' },
                    { value: 'TREASURER', label: 'Treasurer' },
                    { value: 'PRO', label: 'PRO' },
                    { value: 'WELFARE_DIRECTOR', label: 'Welfare Director' },
                    { value: 'SPORTS_DIRECTOR', label: 'Sports Director' },
                  ];
                  // If current value is not one of the known positions, include it so it's preserved
                  const opts = POSITIONS.slice();
                  if (form.position && !POSITIONS.find(p=>p.value===form.position)) {
                    opts.unshift({ value: form.position, label: form.position });
                  }
                  return opts.map(p => <option key={p.value} value={p.value}>{p.label}</option>);
                })()}
              </select>
              {errors.position && <p className="text-xs text-red-600 mt-1">{errors.position}</p>}
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
              <label className="block text-xs font-bold uppercase text-gray-600">Faculty</label>
              <select value={form.facultyId} onChange={(e)=>{
                const fid = e.target.value;
                const f = (faculties||[]).find((x:any)=>x.id===fid);
                setForm((p:any)=>({...p,facultyId: fid, faculty: f ? f.name : '', departmentId: '', department: ''}));
              }} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                <option value="">Select Faculty (Optional)</option>
                {faculties && faculties.map((f:any)=>(<option key={f.id} value={f.id}>{f.name} ({f.code})</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600">Department</label>
              <select value={form.departmentId} onChange={(e)=>{
                const id = e.target.value;
                const found = (departments || []).find((d:any)=>d.id===id);
                setForm((p:any)=>({...p,departmentId: id, department: found ? found.name : ''}));
              }} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                <option value="">Unassigned</option>
                {departments && departments.map((d:any)=>(<option key={d.id} value={d.id}>{d.name} ({d.code})</option>))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600">Start Date *</label>
              <input type="date" value={form.startDate} onChange={(e)=>setForm((p:any)=>({...p,startDate:e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl" />
              {errors.startDate && <p className="text-xs text-red-600 mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600">End Date</label>
              <input type="date" value={form.endDate} onChange={(e)=>setForm((p:any)=>({...p,endDate:e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl" />
              {errors.endDate && <p className="text-xs text-red-600 mt-1">{errors.endDate}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600">Term *</label>
              <select value={form.termId}               onChange={(e)=>{ const sel = e.target.value; setForm((p:any)=>({...p,termId:sel, termYear: orderedTerms.find((t:any)=>t.id===sel)?.name || p.termYear })); }} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">                <option value="">Select term</option>
                {orderedTerms && orderedTerms.map((t:any)=><option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {errors.termId && <p className="text-xs text-red-600 mt-1">{errors.termId}</p>}
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
