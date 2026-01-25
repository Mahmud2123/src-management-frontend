'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth';
import axios from 'axios';
import {
  FileText, Clock, CheckCircle, XCircle, TrendingUp, Calendar,
  MapPin, MessageSquare, Eye, Plus, RefreshCw, AlertCircle, User
} from 'lucide-react';
import { Complaint } from '@/types';
import { fetchComplaints } from '@/lib/api';


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
  
  // ✅ Change this line to safely access the array
  // We check if data.data exists (common for paginated APIs), 
  // otherwise check if data itself is the array.
  const complaints: any[] = Array.isArray(data) ? data : (data?.data || []);

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <User className="w-8 h-8 text-green-600" />
              My Complaints
            </h1>
            <p className="text-gray-600 mt-1">Track all your submitted complaints</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => refetch()} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              onClick={() => router.push('/complaints/create')}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 flex items-center gap-2 shadow-lg shadow-green-500/30"
            >
              <Plus className="w-4 h-4" />
              New Complaint
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-100 text-blue-700', icon: FileText },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-100 text-yellow-700', icon: Clock },
            { label: 'In Progress', value: stats.inProgress, color: 'bg-orange-100 text-orange-700', icon: TrendingUp },
            { label: 'Resolved', value: stats.resolved, color: 'bg-green-100 text-green-700', icon: CheckCircle },
          ].map((stat, idx) => (
            <Card key={idx} className="p-4 border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setStatusFilter(stat.label === 'Total' ? '' : stat.label.toUpperCase().replace(' ', '_'))}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filter Tabs */}
        <Card className="p-2 border-0 shadow-lg">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { label: 'All', value: '' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Resolved', value: 'RESOLVED' },
              { label: 'Rejected', value: 'REJECTED' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  statusFilter === tab.value
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Complaints Grid */}
        {complaints.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {complaints.map((complaint:any) => (
              <Card
                key={complaint.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 overflow-hidden"
                onClick={() => router.push(`/complaints/${complaint.id}`)}
              >
                <div className={`h-1.5 ${
                  complaint.priority === 'URGENT' ? 'bg-red-500' :
                  complaint.priority === 'HIGH' ? 'bg-orange-500' :
                  complaint.priority === 'MEDIUM' ? 'bg-yellow-500' :
                  'bg-gray-300'
                }`}></div>

                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2 flex-1">
                      {complaint.title}
                    </h3>
                    <Badge className={`${getStatusColor(complaint.status)} flex items-center gap-1 px-2.5 py-1 border whitespace-nowrap`}>
                      {getStatusIcon(complaint.status)}
                      <span className="text-xs font-semibold">{complaint.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                    {complaint.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <Badge className={`${getPriorityColor(complaint.priority)} text-xs px-2.5 py-1 font-semibold`}>
                      {complaint.priority}
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-2.5 py-1">
                      {complaint.category?.name || 'General'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                    {complaint.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{complaint.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {complaint.comments?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {complaint.viewCount || 0}
                      </span>
                    </div>
                    <div className="text-xs text-green-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details →
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-16 text-center border-0 shadow-lg">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Complaints Found</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter 
                ? 'No complaints match the selected filter' 
                : "You haven't submitted any complaints yet"}
            </p>
            {!statusFilter && (
              <Button
                onClick={() => router.push('/complaints/create')}
                className="bg-gradient-to-r from-green-600 to-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Submit Your First Complaint
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}