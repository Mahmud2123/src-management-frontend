'use client';

import { useState } from 'react';
import { useComplaints } from '@/hooks/useComplaints';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { fetchCategories } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth';
import { Complaint } from '@/types';
import { useRouter } from 'next/navigation';
import {
  Search, Filter, Plus, FileText, Clock, CheckCircle, XCircle,
  AlertCircle, MapPin, User, Calendar, MessageSquare, Eye,
  SlidersHorizontal, RefreshCw, Download, TrendingUp, ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function ComplaintsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  // Intelligent default role filter based on user role
  const getDefaultRoleFilter = () => {
    if (!user?.role) return 'MINE';
    if (['STUDENT', 'CLASS_REP'].includes(user.role)) return 'MINE';
    if (['ADMIN', 'SRC_MEMBER', 'SRC_EXECUTIVE'].includes(user.role)) return 'ALL';
    return 'MINE';
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'MINE'>(getDefaultRoleFilter());
  const [showFilters, setShowFilters] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useComplaints({
    status,
    priority,
    categoryId: category || '',
    roleFilter: roleFilter as 'ALL' | 'MINE',
    search: searchQuery,
  });

  const complaints: Complaint[] = data?.pages.flatMap(p => p.data) ?? [];

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
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'URGENT': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityBarColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'HIGH': return 'bg-gradient-to-r from-orange-500 to-orange-600';
      case 'MEDIUM': return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
      case 'LOW': return 'bg-gradient-to-r from-slate-400 to-slate-500';
      default: return 'bg-gray-300';
    }
  };

  const stats = [
    { label: 'Total', value: complaints.length, color: 'bg-blue-100 text-blue-700', icon: FileText },
    { label: 'Pending', value: complaints.filter(c => c.status === 'PENDING').length, color: 'bg-amber-100 text-amber-700', icon: Clock },
    { label: 'In Progress', value: complaints.filter(c => c.status === 'IN_PROGRESS').length, color: 'bg-blue-100 text-blue-700', icon: TrendingUp },
    { label: 'Resolved', value: complaints.filter(c => c.status === 'RESOLVED').length, color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    { label: 'Rejected', value: complaints.filter(c => c.status === 'REJECTED').length, color: 'bg-red-100 text-red-700', icon: XCircle },
  ];

  const canSwitchViewScope = user?.role && ['ADMIN', 'SRC_MEMBER', 'SRC_EXECUTIVE'].includes(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-emerald-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Modern Sazu Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/30">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                {roleFilter === 'MINE' ? 'My Submissions' : 'Complaints Ledger'}
              </h1>
              <p className="text-gray-500 font-semibold mt-2 ml-1">
                Sa'adu Zungur University Management System
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => refetch()}
                className="flex items-center gap-2 rounded-2xl px-5 py-3 h-auto font-bold hover:shadow-md transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              
              {user?.role === 'STUDENT' && (
                <Button
                  onClick={() => router.push('/complaints/create')}
                  className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 flex items-center gap-2 shadow-xl shadow-green-600/30 rounded-2xl px-6 py-3 h-auto font-bold text-white"
                >
                  <Plus className="w-5 h-5" />
                  New Entry
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="p-6 border-0 shadow-lg rounded-3xl bg-white/80 backdrop-blur-sm">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
              <input
                type="text"
                placeholder="Search complaints by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400 font-medium"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-xl font-bold"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {(status || priority || category) && (
                  <Badge className="ml-2 bg-green-600 text-white rounded-full px-2 py-0.5 text-[10px] font-black">
                    ACTIVE
                  </Badge>
                )}
              </Button>

              <div className="flex items-center gap-2 text-sm">
                <span className="font-black text-gray-900">{complaints.length}</span>
                <span className="font-semibold text-gray-500">complaints found</span>
              </div>
            </div>

            {/* Filters Grid */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <Select
                  label="Status"
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: '', label: 'All Statuses' },
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                    { value: 'RESOLVED', label: 'Resolved' },
                    { value: 'REJECTED', label: 'Rejected' },
                  ]}
                />

                <Select
                  label="Priority"
                  value={priority}
                  onChange={setPriority}
                  options={[
                    { value: '', label: 'All Priorities' },
                    { value: 'LOW', label: 'Low' },
                    { value: 'MEDIUM', label: 'Medium' },
                    { value: 'HIGH', label: 'High' },
                    { value: 'URGENT', label: 'Urgent' },
                  ]}
                />

                <Select
                  label="Category"
                  value={category}
                  onChange={setCategory}
                  options={[
                    { value: '', label: 'All Categories' },
                    ...categories
                  ]}
                />

                {canSwitchViewScope && (
                  <Select
                    label="View Scope"
                    value={roleFilter}
                    onChange={(v) => setRoleFilter(v as 'ALL' | 'MINE')}
                    options={[
                      { value: 'MINE', label: 'My Complaints' },
                      { value: 'ALL', label: 'All Complaints' },
                    ]}
                  />
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Stats Summary - Enhanced */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="p-5 border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl bg-white/90 backdrop-blur-sm group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Complaints Grid - Enhanced */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 font-bold">Loading complaints...</p>
            </div>
          </div>
        ) : complaints.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {complaints.map((complaint: any) => (
              <Card
                key={complaint.id}
                className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 overflow-hidden rounded-3xl bg-white/90 backdrop-blur-sm hover:-translate-y-1"
                onClick={() => router.push(`/complaints/${complaint.id}`)}
              >
                {/* Enhanced Priority Indicator */}
                <div className={`h-2 ${getPriorityBarColor(complaint.priority)}`}></div>

                <div className="p-6 space-y-4">
                  {/* Header with ID Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-black px-2.5 py-1 rounded-lg">
                        #{complaint.id.slice(-6).toUpperCase()}
                      </Badge>
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2 leading-tight">
                        {complaint.title}
                      </h3>
                    </div>
                    <Badge className={`${getStatusColor(complaint.status)} flex items-center gap-1.5 px-3 py-1.5 border rounded-xl whitespace-nowrap`}>
                      {getStatusIcon(complaint.status)}
                      <span className="text-[10px] font-black uppercase tracking-wide">{complaint.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed font-medium">
                    {complaint.description}
                  </p>

                  {/* SRC Feedback Section */}
                  {complaint.moderationNotes && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4 rounded-r-2xl shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                          SRC RESPONSE
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 font-bold italic leading-relaxed">
                        "{complaint.moderationNotes}"
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${getPriorityColor(complaint.priority)} text-xs px-3 py-1 font-black rounded-xl border`}>
                      {complaint.priority}
                    </Badge>
                    <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-xs px-3 py-1 font-bold rounded-xl">
                      {complaint.category?.name || 'General'}
                    </Badge>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-green-700" />
                      </div>
                      <span className="truncate font-bold text-gray-700">
                        {complaint.isAnonymous ? 'Anonymous' : complaint.author?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-600">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {complaint.location && (
                      <div className="flex items-center gap-2 col-span-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="truncate font-semibold text-gray-600">{complaint.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1.5 text-gray-500 font-bold">
                        <MessageSquare className="w-4 h-4" />
                        {complaint._count?.comments || 0}
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-500 font-bold">
                        <Eye className="w-4 h-4" />
                        {complaint.viewCount || 0}
                      </span>
                    </div>
                    <div className="text-xs text-green-600 font-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      View Details
                      <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-20 text-center border-0 shadow-lg rounded-3xl bg-white/90 backdrop-blur-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">No Complaints Found</h3>
            <p className="text-gray-600 font-semibold mb-8 max-w-md mx-auto">
              {searchQuery || status || priority || category 
                ? 'Try adjusting your filters or search query to see more results' 
                : 'No complaints have been submitted yet. Be the first to raise a concern.'}
            </p>
            {user?.role === 'STUDENT' && (
              <Button
                onClick={() => router.push('/complaints/create')}
                className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 rounded-2xl px-8 py-4 h-auto font-bold shadow-xl shadow-green-600/30 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Submit Your First Complaint
              </Button>
            )}
          </Card>
        )}

        {/* Load More - Enhanced */}
        {hasNextPage && (
          <div className="flex justify-center">
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
              variant="secondary"
            >
              {isFetchingNextPage ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
                  Loading more...
                </>
              ) : (
                <>
                  Load More Complaints
                  <RefreshCw className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}