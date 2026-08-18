// app/excos/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import apiClient from '@/lib/api/client2';

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

  const renderExecutiveCard = (exco: ExecutiveMember) => (
    <Card 
      key={exco.id} 
      className={`p-6 border-0 shadow-md rounded-3xl bg-white hover:shadow-xl transition-all group ${
        exco.isCurrent ? 'border-l-4 border-l-emerald-500' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-green-700 to-green-900 shadow-lg shadow-green-900/20 flex-shrink-0 flex items-center justify-center">
          {exco.avatarUrl ? (
            <img 
              src={exco.avatarUrl} 
              alt={exco.name} 
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
            {exco.isCurrent && (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Current
              </Badge>
            )}
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
            className="mt-4 mx-auto"
            label="Retry"
          />
        </Card>
      </div>
    );
  }

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
          <RefreshButton 
            onRefresh={handleRefresh} 
            label="Refresh"
            className="bg-white shadow-sm border border-gray-200"
          />
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
    </div>
  );
}