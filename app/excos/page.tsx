// app/excos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/Card';
import { RefreshButton } from '@/components/refreshButton';
import { Badge } from '@/components/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Tabs';
import { 
  Users, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Award,
  Crown,
  Loader2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import apiClient from '@/lib/api/client2';
import { useAuth } from '@/providers/auth';
import { toast } from 'sonner';
import ExecFormModal from '@/components/ExecFormModal';
import TermFormModal from '@/components/TermFormModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';

interface ExecutiveMember {
  id: string;
  name: string;
  position: string;
  title?: string;
  bio?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  department?: string;
  faculty?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  termYear: string;
  displayOrder: number;
}

const fetchCurrentExcos = async (): Promise<ExecutiveMember[]> => {
  const response = await apiClient.get('/excos/current');
  return response.data;
};

const fetchPastExcos = async (): Promise<ExecutiveMember[]> => {
  const response = await apiClient.get('/excos/past');
  return response.data;
};

const fetchAllExcos = async (): Promise<ExecutiveMember[]> => {
  const response = await apiClient.get('/excos');
  return response.data;
};

export default function ExcosDirectoryPage() {
  const [activeTab, setActiveTab] = useState<'current' | 'past' | 'all'>('current');
  const [refetchKey, setRefetchKey] = useState(0);
  const [failedAvatarIds, setFailedAvatarIds] = useState<Record<string, boolean>>({});

  // modal & form state
  const [showExecForm, setShowExecForm] = useState(false);
  const [editingExec, setEditingExec] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingExec, setDeletingExec] = useState<any | null>(null);

  const [showTermForm, setShowTermForm] = useState(false);
  const [editingTerm, setEditingTerm] = useState<any | null>(null);
  const [showDeleteTermModal, setShowDeleteTermModal] = useState(false);
  const [deletingTerm, setDeletingTerm] = useState<any | null>(null);

  const handleRefresh = () => {
    setRefetchKey(prev => prev + 1);
  };

  const { data: currentExcos = [], isLoading: loadingCurrent, error: errorCurrent } = useQuery({
    queryKey: ['excos-current', refetchKey],
    queryFn: fetchCurrentExcos,
    staleTime: 60000,
  });

  const { data: pastExcos = [], isLoading: loadingPast, error: errorPast } = useQuery({
    queryKey: ['excos-past', refetchKey],
    queryFn: fetchPastExcos,
    staleTime: 60000,
  });

  const { data: allExcos = [], isLoading: loadingAll } = useQuery({
    queryKey: ['excos-all', refetchKey],
    queryFn: fetchAllExcos,
    staleTime: 60000,
  });

  const isLoading = loadingCurrent || loadingPast || loadingAll;
  const error = errorCurrent || errorPast;

  const getPositionBadgeColor = (position: string) => {
    const colors: Record<string, string> = {
      'President': 'bg-purple-100 text-purple-800 border-purple-200',
      'Vice President': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Secretary': 'bg-blue-100 text-blue-800 border-blue-200',
      'Treasurer': 'bg-green-100 text-green-800 border-green-200',
      'PRO': 'bg-pink-100 text-pink-800 border-pink-200',
      'Welfare Director': 'bg-orange-100 text-orange-800 border-orange-200',
      'Sports Director': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    };
    return colors[position] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSafeAvatarSrc = (value?: string | null) => {
    if (!value) return null;

    const trimmed = value.trim();
    if (!trimmed || trimmed === '?' || trimmed === 'null' || trimmed === 'undefined') return null;

    const cleaned = trimmed.replace(/^\/+/, '');
    if (
      cleaned.startsWith('http://') ||
      cleaned.startsWith('https://') ||
      cleaned.startsWith('data:') ||
      cleaned.startsWith('blob:')
    ) {
      return cleaned;
    }

    if (trimmed.startsWith('/')) return trimmed;
    if (trimmed.startsWith('uploads/')) return `/${trimmed}`;

    return null;
  };

  const renderExecutiveCard = (exco: ExecutiveMember) => {
    const avatarSrc = getSafeAvatarSrc(exco.avatarUrl);
    const avatarFailed = !!failedAvatarIds[exco.id];

    return (
    <Card 
      key={exco.id} 
      className={`p-6 border-0 shadow-md rounded-3xl bg-white hover:shadow-xl transition-all group ${
        exco.isCurrent ? 'border-l-4 border-l-emerald-500' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-green-700 to-green-900 shadow-lg shadow-green-900/20 flex-shrink-0 flex items-center justify-center">
          {avatarSrc && !avatarFailed ? (
            <img 
              src={avatarSrc} 
              alt={exco.name} 
              onError={() => setFailedAvatarIds(prev => ({ ...prev, [exco.id]: true }))}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-black text-xl">
              {exco.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-black text-gray-900">
                {exco.name}
              </h3>
              <Badge className={`${getPositionBadgeColor(exco.position)} border font-bold text-xs px-3 py-1 rounded-full mt-1`}>
                {exco.position}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {exco.isCurrent && (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Current
                </Badge>
              )}

              {isSuperAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    title="Move up"
                    className="p-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50"
                    onClick={() => changeOrderMutation.mutate({ id: exco.id, displayOrder: Math.max(0, (exco.displayOrder || 0) - 1) })}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/></svg>
                  </button>
                  <button
                    title="Move down"
                    className="p-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50"
                    onClick={() => changeOrderMutation.mutate({ id: exco.id, displayOrder: (exco.displayOrder || 0) + 1 })}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  <button
                    title="Edit Executive"
                    className="p-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50"
                    onClick={() => { setEditingExec(exco); setShowExecForm(true); }}
                  >
                    <Edit className="w-4 h-4 text-green-700" />
                  </button>
                  <button
                    title="Delete Executive"
                    className="p-2 bg-white border border-red-100 rounded-xl shadow-sm hover:bg-red-50"
                    onClick={() => { setDeletingExec(exco); setShowDeleteModal(true); }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {exco.title && (
            <p className="text-sm font-semibold text-gray-600 mt-1">{exco.title}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-3 text-xs text-gray-500">
            {exco.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">{exco.email}</span>
              </div>
            )}
            {exco.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>{exco.phone}</span>
              </div>
            )}
            {exco.department && (
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span className="truncate">{exco.department}</span>
              </div>
            )}
            {exco.faculty && (
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span className="truncate">{exco.faculty}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Term: {exco.termYear}</span>
            </div>
            {exco.startDate && (
              <span>
                {format(new Date(exco.startDate), 'MMM yyyy')}
                {exco.endDate && ` - ${format(new Date(exco.endDate), 'MMM yyyy')}`}
              </span>
            )}
          </div>

          {exco.bio && (
            <p className="text-sm text-gray-600 mt-3 leading-relaxed line-clamp-2">
              {exco.bio}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-emerald-50/30 p-6 flex items-center justify-center">
        <Card className="p-8 text-center rounded-3xl border-0 shadow-md bg-white max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">Failed to load Executive Council</h3>
          <p className="text-gray-600 mt-2 text-sm">
            {error instanceof Error ? error.message : 'Please try again later'}
          </p>
          <RefreshButton 
            onRefresh={handleRefresh} 
            className="mt-4 mx-auto text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 shadow-sm rounded-xl px-4 py-2 flex items-center gap-2"
            label="Retry"
          />
        </Card>
      </div>
    );
  }

  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const queryClient = useQueryClient();

    // Mutations for delete and order changes
    const deleteExcoMutation = useMutation({
      mutationFn: async (id: string) => {
        const res = await apiClient.delete(`/excos/${id}`);
        return res.data;
      },
      onSuccess: () => {
        toast.success('Executive deleted successfully.');
        queryClient.invalidateQueries({ queryKey: ['excos-current'] });
        queryClient.invalidateQueries({ queryKey: ['excos-past'] });
        queryClient.invalidateQueries({ queryKey: ['excos-all'] });
        setShowDeleteModal(false);
        setDeletingExec(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || err?.message || 'Unable to delete executive');
      }
    });

    const deleteTermMutation = useMutation({
      mutationFn: async (id: string) => {
        const res = await apiClient.delete(`/excos/terms/${id}`);
        return res.data;
      },
      onSuccess: () => {
        toast.success('Term deleted successfully.');
        queryClient.invalidateQueries({ queryKey: ['exco-terms'] });
        setShowDeleteTermModal(false);
        setDeletingTerm(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || err?.message || 'Unable to delete term');
      }
    });

    const changeOrderMutation = useMutation({
      mutationFn: async ({ id, displayOrder }: any) => {
        const res = await apiClient.put(`/excos/${id}`, { displayOrder });
        return res.data;
      },
      onSuccess: () => {
        toast.success('Display order updated');
        queryClient.invalidateQueries({ queryKey: ['excos-current'] });
        queryClient.invalidateQueries({ queryKey: ['excos-past'] });
        queryClient.invalidateQueries({ queryKey: ['excos-all'] });
        setRefetchKey(k => k + 1);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || err?.message || 'Unable to update order');
      }
    });

  const fetchTerms = async () => {
    const res = await apiClient.get('/excos/terms');
    return res.data;
  };

  const { data: terms = [] } = useQuery({ queryKey: ['exco-terms', refetchKey], queryFn: fetchTerms, staleTime: 60000 });

  const createTerm = async () => {
    const name = prompt('Term name (e.g. 2025/2026 SRC Executive)');
    if (!name) return;
    const startYearStr = prompt('Start year (e.g. 2025)');
    const endYearStr = prompt('End year (e.g. 2026)');
    if (!startYearStr || !endYearStr) return;
    const startYear = parseInt(startYearStr, 10);
    const endYear = parseInt(endYearStr, 10);
    if (isNaN(startYear) || isNaN(endYear)) {
      toast.error('Invalid years provided');
      return;
    }
    try {
      await apiClient.post('/excos/terms', { name, startYear, endYear });
      toast.success('Executive term created successfully');
      setRefetchKey(k => k + 1);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to create term');
    }
  };

  const deleteTerm = async (id: string) => {
    if (!confirm('Delete this term? This will fail if executives still belong to it.')) return;
    try {
      await apiClient.delete(`/excos/terms/${id}`);
      toast.success('Term deleted');
      setRefetchKey(k => k + 1);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to delete term');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-emerald-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">Executive Council</h1>
                <p className="text-sm text-gray-600">
                  Current and past Student Representative Council executives
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <RefreshButton
              onRefresh={handleRefresh}
              label="Refresh"
              className="bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-900"
            />
            {isSuperAdmin && (
              <>
                <button onClick={()=>{ setEditingExec(null); setShowExecForm(true); }} className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm">
                  <Plus className="w-4 h-4 text-green-700" />
                  <span className="text-xs sm:text-sm font-medium">Add Executive</span>
                </button>
                <button onClick={()=>{ setEditingTerm(null); setShowTermForm(true); }} className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm">
                  <Plus className="w-4 h-4 text-green-700" />
                  <span className="text-xs sm:text-sm font-medium">Add Term</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 rounded-2xl bg-gray-100 p-1">
            <TabsTrigger 
              value="current" 
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold"
            >
              Current ({currentExcos.length})
            </TabsTrigger>
            <TabsTrigger 
              value="past" 
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold"
            >
              Past ({pastExcos.length})
            </TabsTrigger>
            <TabsTrigger 
              value="all" 
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold"
            >
              All ({allExcos.length})
            </TabsTrigger>
          </TabsList>

          {/* Current Tab */}
          <TabsContent value="current" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-green-700" />
                <span className="ml-3 text-gray-600">Loading current executives...</span>
              </div>
            ) : currentExcos.length === 0 ? (
              <Card className="p-12 text-center rounded-3xl border-0 shadow-md bg-white">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700">No current executives</h3>
                <p className="text-gray-500 mt-2">The executive council list is being updated.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {currentExcos.map(renderExecutiveCard)}
              </div>
            )}
          </TabsContent>

          {/* Past Tab */}
          <TabsContent value="past" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-green-700" />
                <span className="ml-3 text-gray-600">Loading past executives...</span>
              </div>
            ) : pastExcos.length === 0 ? (
              <Card className="p-12 text-center rounded-3xl border-0 shadow-md bg-white">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700">No past executives</h3>
                <p className="text-gray-500 mt-2">Historical records are being compiled.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pastExcos.map(renderExecutiveCard)}
              </div>
            )}
          </TabsContent>

          {/* All Tab */}
          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-green-700" />
                <span className="ml-3 text-gray-600">Loading all executives...</span>
              </div>
            ) : allExcos.length === 0 ? (
              <Card className="p-12 text-center rounded-3xl border-0 shadow-md bg-white">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700">No executives found</h3>
                <p className="text-gray-500 mt-2">The executive council directory is being built.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {allExcos.map(renderExecutiveCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <ExecFormModal open={showExecForm} onClose={() => { setShowExecForm(false); setEditingExec(null); }} initial={editingExec} terms={terms} />
      <ConfirmDeleteModal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title={deletingExec ? `Delete ${deletingExec.name}?` : 'Delete Executive'} description={deletingExec ? `Are you sure you want to remove ${deletingExec.name}? This action cannot be undone.` : ''} onConfirm={() => deletingExec && deleteExcoMutation.mutate(deletingExec.id)} loading={(deleteExcoMutation as any).status === 'loading'} />

      <TermFormModal open={showTermForm} onClose={() => { setShowTermForm(false); setEditingTerm(null); }} initial={editingTerm} />
      <ConfirmDeleteModal open={showDeleteTermModal} onClose={() => setShowDeleteTermModal(false)} title={deletingTerm ? `Delete term ${deletingTerm.name}?` : 'Delete Term'} description={deletingTerm ? `Are you sure you want to delete term ${deletingTerm.name}? This will fail if executives are assigned to it.` : ''} onConfirm={() => deletingTerm && deleteTermMutation.mutate(deletingTerm.id)} loading={(deleteTermMutation as any).status === 'loading'} />

    </div>
  );
}