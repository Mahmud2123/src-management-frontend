// app/dashboard/page.tsx
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth';
import { useComplaints } from '@/hooks/useComplaints';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';
import { fetchAnnouncements } from '@/lib/api';
import {
  FileText, Clock, CheckCircle, TrendingUp,
  Plus, Users, ShieldAlert, Building, BookOpen,
  ArrowRight, Sparkles, Activity, BellRing, X, Megaphone, ShieldCheck,
  Building2, Crown, Award, Users as UsersIcon, ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Strict role checking matching the sidebar hierarchy
  const userRole = user?.role ? String(user.role).toUpperCase() : 'STUDENT';
  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'SYSTEM_ADMIN', 'SRC_MEMBER', 'SRC_EXECUTIVE'].includes(userRole);
  const isStudentOrRep = ['STUDENT', 'CLASS_REP'].includes(userRole);

  // Fetch announcements for marquee
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: fetchAnnouncements,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // Get the latest active announcement for marquee
  const latestAnnouncement = useMemo(() => {
    const now = new Date();
    const active = announcements.filter((a) => {
      if (!a.isActive) return false;
      if (a.expiryDate) {
        return new Date(a.expiryDate) > now;
      }
      return true;
    });
    return active.length > 0 ? active[0] : null;
  }, [announcements]);

  // Fetch complaints data to compute quick metrics
  const { data } = useComplaints({
    roleFilter: isAdmin ? 'ALL' : 'MINE',
  });

  const complaints: any[] = useMemo(() => {
    return data?.pages?.flatMap((p: any) => p.data) ?? [];
  }, [data]);

  const stats = useMemo(() => {
    const pending = complaints.filter(c => ['PENDING', 'PENDING_REVIEW'].includes(String(c.status).toUpperCase())).length;
    const inProgress = complaints.filter(c => String(c.status).toUpperCase() === 'IN_PROGRESS').length;
    const resolved = complaints.filter(c => String(c.status).toUpperCase() === 'RESOLVED').length;
    
    return {
      total: complaints.length,
      pending,
      inProgress,
      resolved,
    };
  }, [complaints]);

  const leadershipTeam = [
    {
      title: 'Vice-Chancellor',
      name: 'Prof. Fatimah Tahir FNSM',
      office: 'Office of the Vice-Chancellor',
      imagePath: '/vc.jpg',
      imagePlaceholder: 'VC',
      badgeColor: 'bg-purple-600 text-white border-purple-700'
    },
    {
      title: 'Dean of Student Affairs',
      name: 'Prof. Abdussalam Murtada Alhaqiqi ',
      office: 'Student Affairs Division',
      imagePath: '/dean.jpg',
      imagePlaceholder: 'DSA',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      title: 'SRC President',
      name: 'Comrade Ilyasu Umar Adamu',
      office: 'Student Representative Council',
      imagePath: '/src.jpg',
      imagePlaceholder: 'SRC',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-emerald-50/30 p-4 sm:p-6 lg:p-8 select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- ANNOUNCEMENT MARQUEE --- */}
        {latestAnnouncement && (
          <div 
            onClick={() => router.push('/announcements')}
            className="group relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 rounded-2xl p-4 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            
            <div className="relative flex items-center gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Megaphone className="w-5 h-5 text-white animate-pulse" />
              </div>
              
              {/* Marquee Content */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 bg-white/20 text-white text-[10px] font-black uppercase tracking-wider rounded-full">
                    Latest
                  </span>
                  <p className="text-white font-semibold text-sm sm:text-base truncate">
                    {latestAnnouncement.title}
                  </p>
                </div>
                <div className="relative overflow-hidden">
                  <p className="text-green-100 text-xs sm:text-sm truncate animate-marquee whitespace-nowrap">
                    {latestAnnouncement.message}
                    <span className="inline-block w-8" />
                    {latestAnnouncement.message}
                    <span className="inline-block w-8" />
                    {latestAnnouncement.message}
                  </p>
                </div>
              </div>
              
              {/* CTA */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <span className="text-white text-xs font-semibold hidden sm:inline">
                  View All
                </span>
                <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        )}

        {/* --- WELCOME BANNER WITH EXCO LINK --- */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-800 via-green-700 to-emerald-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-green-900/10">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide text-white">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                Sa'adu Zungur University (SAZU) Portal
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                Welcome back, {user?.name?.split(' ')[0] || 'Member'}! 👋
              </h1>
              
              <p className="text-green-100 text-sm sm:text-base font-medium leading-relaxed">
                {isAdmin 
                  ? 'You are logged into the Administrative Command Center. Monitor student feedback, manage submissions, verify reports, and broadcast live alerts.'
                  : 'Access institutional resources, connect with university leadership, and submit academic or welfare complaints effortlessly.'}
              </p>
            </div>

            {/* HEADER ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-3">

              {/* Main University Portal Link */}
              <a
                href={'https://basug.safrecords.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold px-5 py-3.5 rounded-2xl border border-white/20 transition-all flex items-center gap-2.5 text-sm cursor-pointer group"
              >
                <Building2 className="w-4 h-4 flex-shrink-0 group-hover:rotate-3 transition-transform" />
                <span>Main University Portal</span>
                <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-1 transition-transform" />
              </a>

              {isStudentOrRep && (
                <>
                  <button
                    onClick={() => router.push('/complaints?filter=MINE')}
                    className="bg-white text-green-900 hover:bg-green-50 font-bold px-5 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2.5 text-sm cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-green-700 flex-shrink-0" />
                    <span>View My Complaints</span>
                  </button>
                  
                  <button
                    onClick={() => router.push('/complaints/create')}
                    className="bg-emerald-900 text-white hover:bg-emerald-950 border border-emerald-600 font-bold px-5 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2.5 text-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-white flex-shrink-0" />
                    <span>Raise Complaint</span>
                  </button>
                </>
              )}

              {/* Announcements Link - For Admin users */}
              {isAdmin && (
                <button
                  onClick={() => router.push('/announcements')}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-amber-600/30 transition-all flex items-center gap-2.5 text-sm cursor-pointer"
                >
                  <Megaphone className="w-5 h-5 animate-pulse text-white flex-shrink-0" />
                  <span>Announcements</span>
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- UNIVERSITY LEADERSHIP & DIRECTORY --- */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">University Leadership & Directory</h2>
              <p className="text-sm text-gray-600 font-medium">Key offices overseeing student welfare and administration</p>
            </div>
            <button
              onClick={() => router.push('/excos')}
              className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1.5 transition-colors"
            >
              <Crown className="w-4 h-4" />
              View Full Executive Council
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leadershipTeam.map((leader, idx) => (
              <Card key={idx} className="p-6 border-0 shadow-md rounded-3xl bg-white space-y-4 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-green-700 to-green-900 shadow-lg shadow-green-900/20 group-hover:scale-105 transition-transform flex items-center justify-center">
                    <img 
                      src={leader.imagePath} 
                      alt={leader.title} 
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <span className="text-white font-black text-2xl hidden items-center justify-center w-full h-full">
                      {leader.imagePlaceholder}
                    </span>
                  </div>
                  <Badge className={`${leader.badgeColor} border font-bold text-xs px-3 py-1 rounded-full`}>
                    {leader.title}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-gray-900 leading-snug">{leader.name}</h3>
                  <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-green-700 flex-shrink-0" />
                    <span>{leader.office}</span>
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-green-800">
                  <span>Sa'adu Zungur University</span>
                  <span className="text-gray-500 font-medium">Official Office</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* --- QUICK METRICS GRID --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="p-5 sm:p-6 border-0 shadow-md rounded-3xl bg-white flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-700 flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                {isAdmin ? 'Total System Submissions' : 'Total Submissions'}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900">{stats.total}</p>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 border-0 shadow-md rounded-3xl bg-white flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-700 flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">Pending Review</p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900">{stats.pending}</p>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 border-0 shadow-md rounded-3xl bg-white flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-700 flex-shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">In Progress</p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900">{stats.inProgress}</p>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 border-0 shadow-md rounded-3xl bg-white flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-700 flex-shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">Resolved</p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900">{stats.resolved}</p>
            </div>
          </Card>
        </div>

        {/* --- CONDITIONAL VIEW SECTION (STRICT ADMIN VS STUDENT SEPARATION) --- */}
        {!isAdmin ? (
          /* ================= STUDENT / CLASS REP VIEW ================= */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <Card className="p-6 border-0 shadow-md rounded-3xl bg-gradient-to-br from-white to-green-50/40 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-gray-900">How to Submit Effective Complaints</h3>
              <p className="text-sm text-gray-700 leading-relaxed font-semibold">
                Ensure your grievance contains precise location details, accurate categories, and clear descriptions so the SRC or Dean's office can resolve them swiftly.
              </p>
            </Card>

            <Card className="p-6 border-0 shadow-md rounded-3xl bg-gradient-to-br from-white to-emerald-50/40 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-gray-900">Anonymous Submissions</h3>
              <p className="text-sm text-gray-700 leading-relaxed font-semibold">
                You can toggle anonymous mode when filing sensitive concerns. Your identity will be fully protected while still allowing unit tracking.
              </p>
            </Card>

            {/* Student Quick Access to Exco */}
            <Card 
              onClick={() => router.push('/excos')}
              className="p-6 border-0 shadow-md rounded-3xl bg-gradient-to-br from-amber-50/80 to-orange-50/80 hover:shadow-xl transition-all cursor-pointer group border border-amber-200/30"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold group-hover:scale-110 transition-transform shadow-lg shadow-amber-600/20">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mt-3 flex items-center gap-2">
                Executive Council
                <ArrowRight className="w-4 h-4 text-amber-600 opacity-60 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                Meet the current and past SRC executives
              </p>
            </Card>
          </div>
        ) : (
          /* ================= ADMIN COMMAND CENTER (STRICTLY ADMIN ONLY) ================= */
          <div className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Administrative Command Center</h2>
                <p className="text-sm text-gray-600 font-medium">Exclusive management tools for broadcasting, user control, audit logs, and verification.</p>
              </div>
              <button
                onClick={() => router.push('/excos')}
                className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1.5 transition-colors bg-amber-50 px-4 py-2 rounded-xl border border-amber-200"
              >
                <Crown className="w-4 h-4" />
                Manage Executive Council
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* 1. Complaints & Verification */}
              <Card 
                onClick={() => router.push('/moderation')}
                className="p-6 border-0 shadow-md rounded-3xl bg-white space-y-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-gray-900 flex items-center justify-between">
                    <span>Verify Complaints</span>
                    <ArrowRight className="w-4 h-4 text-emerald-700 opacity-80 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                    Review and verify authentic student reports before routing to specialized university units.
                  </p>
                </div>
              </Card>

              {/* 2. User Management */}
              <Card 
                onClick={() => router.push('/users')}
                className="p-6 border-0 shadow-md rounded-3xl bg-white space-y-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-gray-900 flex items-center justify-between">
                    <span>Users Management</span>
                    <ArrowRight className="w-4 h-4 text-blue-700 opacity-80 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                    Manage student reps, unit staff roles, and administrative access permissions.
                  </p>
                </div>
              </Card>

              {/* 3. Audit Logs */}
              <Card 
                onClick={() => router.push('/audit-logs')}
                className="p-6 border-0 shadow-md rounded-3xl bg-white space-y-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-gray-900 flex items-center justify-between">
                    <span>Audit Logs</span>
                    <ArrowRight className="w-4 h-4 text-purple-700 opacity-80 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                    Track system security events, database access records, and administrative actions.
                  </p>
                </div>
              </Card>

              {/* 4. Global Statistics */}
              <Card 
                onClick={() => router.push('/statistics')}
                className="p-6 border-0 shadow-md rounded-3xl bg-white space-y-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-gray-900 flex items-center justify-between">
                    <span>Global Statistics</span>
                    <ArrowRight className="w-4 h-4 text-amber-700 opacity-80 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                    Analyze campus-wide complaint trends, resolution efficiency, and unit metrics.
                  </p>
                </div>
              </Card>

              {/* 5. Executive Council Management */}
              <Card 
                onClick={() => router.push('/excos')}
                className="p-6 border-0 shadow-md rounded-3xl bg-gradient-to-br from-amber-50/80 to-orange-50/80 space-y-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group border border-amber-200/30"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-amber-600/20">
                  <Crown className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-gray-900 flex items-center justify-between">
                    <span>Executive Council</span>
                    <ArrowRight className="w-4 h-4 text-amber-600 opacity-80 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                    Manage current and past SRC executive members, their positions, and terms.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}