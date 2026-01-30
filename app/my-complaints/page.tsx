'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth';
import {
  FileText, Clock, CheckCircle, XCircle, TrendingUp, Calendar,
  MapPin, MessageSquare, Eye, Plus, RefreshCw, AlertCircle, User
} from 'lucide-react';
import { fetchComplaints } from '@/lib/api';
import LoadingState from '@/components/LoadingState';

export default function MyComplaintsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-complaints', statusFilter],
    queryFn: () => fetchComplaints({ 
      roleFilter: 'MINE', 
      status: statusFilter || undefined 
    }),
  });
<<<<<<< HEAD
  
  // ✅ Change this line to safely access the array
  // We check if data.data exists (common for paginated APIs), 
  // otherwise check if data itself is the array.
  const complaints: any[] = Array.isArray(data) ? data : (data?.data || []);
=======

  // CRITICAL FIX: Extract array safely from API response object
  const complaintsArray = Array.isArray(data) ? data : (data as any)?.data || [];

  const stats = {
    total: complaintsArray.length,
    pending: complaintsArray.filter((c: any) => c.status === 'PENDING').length,
    inProgress: complaintsArray.filter((c: any) => c.status === 'IN_PROGRESS').length,
    resolved: complaintsArray.filter((c: any) => c.status === 'RESOLVED').length,
  };

  if (isLoading) return <LoadingState message='Loading your complaints...' />;
>>>>>>> Updated new chnaged

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'IN_PROGRESS': return <TrendingUp className="w-4 h-4" />;
      case 'RESOLVED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-700';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'URGENT': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

<<<<<<< HEAD

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading your complaints...</p>
        </div>
      </div>
    );
  }
  const stats = {
    total: complaints?.length || 0,
    pending: complaints?.filter((c: any) => c.status === 'PENDING').length || 0,
    inProgress: complaints?.filter((c: any) => c.status === 'IN_PROGRESS').length || 0,
    resolved: complaints?.filter((c: any) => c.status === 'RESOLVED').length || 0,
  };
=======
>>>>>>> Updated new chnaged
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <User className="w-8 h-8 text-green-600" /> My Complaints
            </h1>
            <p className="text-gray-600 mt-1 text-sm">Track your submissions and response progress</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => refetch()} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
            <Button
              onClick={() => router.push('/complaints/create')}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-500/20"
            >
              <Plus className="w-4 h-4" /> New Complaint
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-100 text-blue-700', icon: FileText, filter: '' },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-100 text-yellow-700', icon: Clock, filter: 'PENDING' },
            { label: 'In Progress', value: stats.inProgress, color: 'bg-orange-100 text-orange-700', icon: TrendingUp, filter: 'IN_PROGRESS' },
            { label: 'Resolved', value: stats.resolved, color: 'bg-green-100 text-green-700', icon: CheckCircle, filter: 'RESOLVED' },
          ].map((stat, idx) => (
            <Card key={idx} className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setStatusFilter(stat.filter)}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((val) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                statusFilter === val ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {val === '' ? 'All' : val.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Complaints Grid */}
        {complaintsArray.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {complaintsArray.map((complaint: any) => (
              <Card
                key={complaint.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 overflow-hidden relative"
                onClick={() => router.push(`/complaints/${complaint.id}`)}
              >
                <div className={`h-1 absolute top-0 left-0 right-0 ${
                  complaint.priority === 'URGENT' ? 'bg-red-500' :
                  complaint.priority === 'HIGH' ? 'bg-orange-500' :
                  complaint.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-gray-300'
                }`}></div>

                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">{complaint.title}</h3>
                    <Badge className={`${getStatusColor(complaint.status)} flex items-center gap-1 whitespace-nowrap text-[10px]`}>
                      {getStatusIcon(complaint.status)} {complaint.status}
                    </Badge>
                  </div>

                  <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{complaint.description}</p>
                      
{complaint.moderationNotes && (
  <div className={`mt-3 p-3 rounded-xl border-l-4 flex gap-2 items-start ${
    complaint.status === 'REJECTED' ? 'bg-red-50 border-red-400' : 'bg-blue-50 border-blue-400'
  }`}>
    <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${
      complaint.status === 'REJECTED' ? 'text-red-500' : 'text-blue-500'
    }`} />
    <div>
      <p className="text-[10px] font-bold uppercase text-gray-500 tracking-tight">Admin Feedback</p>
      <p className="text-xs text-gray-700 italic mt-0.5">"{complaint.moderationNotes}"</p>
    </div>
  </div>
)}
                  <div className="flex items-center gap-2">
                    <Badge className={`${getPriorityColor(complaint.priority)} text-[10px]`}>{complaint.priority}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{complaint.category?.name || 'General'}</Badge>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-[10px] text-gray-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(complaint.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {complaint.comments?.length || 0}</span>
                    </div>
                    <span className="text-green-600 font-bold group-hover:translate-x-1 transition-transform">Details →</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-16 text-center border-0 shadow-sm bg-white">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Complaints Found</h3>
            <p className="text-gray-500 text-sm mb-6">Your list is currently empty.</p>
            {!statusFilter && (
              <Button onClick={() => router.push('/complaints/create')} className="bg-green-600">
                Submit Your First Complaint
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}