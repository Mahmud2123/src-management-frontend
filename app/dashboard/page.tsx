'use client';

import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth';
import { useComplaints } from '@/hooks/useComplaints';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import {
  FileText, Clock, CheckCircle, TrendingUp,
  Plus, Users, ShieldAlert, Building, BookOpen,
  ArrowRight, Sparkles, Activity, BellRing, X, Send, Megaphone, ShieldCheck
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Strict role checking matching the sidebar hierarchy
  const userRole = user?.role ? String(user.role).toUpperCase() : 'STUDENT';
  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'SYSTEM_ADMIN', 'SRC_MEMBER', 'SRC_EXECUTIVE'].includes(userRole);
  const isStudentOrRep = ['STUDENT', 'CLASS_REP'].includes(userRole);

  // Real-time broadcast announcement state with localStorage persistence
  const [announcement, setAnnouncement] = useState<{ title: string; message: string; timestamp: string } | null>(null);

  // Broadcast Modal State for Admin/SRC
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSubmittingBroadcast, setIsSubmittingBroadcast] = useState(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize Socket.io connection & load cached broadcast
  useEffect(() => {
    const cachedBroadcast = localStorage.getItem('active_institutional_broadcast');
    if (cachedBroadcast) {
      try {
        setAnnouncement(JSON.parse(cachedBroadcast));
      } catch (e) {
        localStorage.removeItem('active_institutional_broadcast');
      }
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    let socket: Socket | null = null;

    try {
      socket = io(socketUrl, {
        transports: ['polling', 'websocket'], // Fixes connection closure errors
        autoConnect: true,
      });

      socket.on('ADMIN_BROADCAST', (data) => {
        const incoming = {
          title: data.title || 'Institutional Broadcast',
          message: data.message || data.content,
          timestamp: data.timestamp 
            ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setAnnouncement(incoming);
        localStorage.setItem('active_institutional_broadcast', JSON.stringify(incoming));
      });
    } catch (e) {
      console.error('Socket.io connection error:', e);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const handleDismissBroadcast = () => {
    setAnnouncement(null);
    localStorage.removeItem('active_institutional_broadcast');
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    setIsSubmittingBroadcast(true);
    setBroadcastFeedback(null);

    try {
      await api.post('/admin/broadcast', {
        title: broadcastTitle,
        message: broadcastMessage,
      });

      setBroadcastFeedback({ type: 'success', text: 'Broadcast sent successfully!' });
      setBroadcastTitle('');
      setBroadcastMessage('');
      setTimeout(() => {
        setShowBroadcastModal(false);
        setBroadcastFeedback(null);
      }, 1500);
    } catch (err: any) {
      setBroadcastFeedback({ 
        type: 'error', 
        text: err?.response?.data?.message || 'Failed to send broadcast. Please try again.' 
      });
    } finally {
      setIsSubmittingBroadcast(false);
    }
  };

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
      name: 'Prof. [VC Name Placeholder]',
      office: 'Office of the Vice-Chancellor',
      imagePlaceholder: 'VC',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      title: 'Dean of Student Affairs',
      name: 'Dr. [Dean Name Placeholder]',
      office: 'Student Affairs Division',
      imagePlaceholder: 'DSA',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      title: 'SRC President',
      name: 'Comrade [SRC President Placeholder]',
      office: 'Student Representative Council',
      imagePlaceholder: 'SRC',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-emerald-50/30 p-4 sm:p-6 lg:p-8 select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- LIVE WEBSOCKET ANNOUNCEMENT BANNER --- */}
        {announcement && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 text-white shadow-lg flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
                <BellRing className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded text-white">Broadcast Alert</span>
                  <span className="text-xs text-amber-100 font-semibold">{announcement.timestamp}</span>
                </div>
                <h4 className="font-bold text-sm sm:text-base mt-0.5 text-white">{announcement.title}: {announcement.message}</h4>
              </div>
            </div>
            <button 
              onClick={handleDismissBroadcast} 
              className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* --- WELCOME BANNER WITH HIGH-CONTRAST HEADER CONTROLS --- */}
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

            {/* HEADER TOP-RIGHT ACTION BUTTONS (FULLY VISIBLE SOLID TEXT & CONTRAST) */}
            <div className="flex flex-wrap items-center gap-3">
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

              {isAdmin && (
                <button
                  onClick={() => setShowBroadcastModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-amber-600/30 transition-all flex items-center gap-2.5 text-sm cursor-pointer"
                >
                  <Megaphone className="w-5 h-5 animate-pulse text-white flex-shrink-0" />
                  <span>Broadcast Alert</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- UNIVERSITY LEADERSHIP & DIRECTORY (FIXED VC TEXT & CONTRAST) --- */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">University Leadership & Directory</h2>
              <p className="text-sm text-gray-600 font-medium">Key offices overseeing student welfare and administration</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leadershipTeam.map((leader, idx) => (
              <Card key={idx} className="p-6 border-0 shadow-md rounded-3xl bg-white space-y-4 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-700 to-green-900 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-green-900/20 group-hover:scale-105 transition-transform">
                    {leader.imagePlaceholder}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
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
          </div>
        ) : (
          /* ================= ADMIN COMMAND CENTER (STRICTLY ADMIN ONLY) ================= */
          <div className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Administrative Command Center</h2>
                <p className="text-sm text-gray-600 font-medium">Exclusive management tools for broadcasting, user control, audit logs, and verification.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            </div>
          </div>
        )}

      </div>

      {/* --- BROADCAST MODAL FOR ADMIN/SRC --- */}
      {showBroadcastModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Broadcast Institutional Alert</h3>
              </div>
              <button 
                onClick={() => setShowBroadcastModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">Broadcast Title</label>
                <Input
                  placeholder="e.g. Urgent Campus Update"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  required
                  className="rounded-2xl"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">Message Content</label>
                <textarea
                  rows={4}
                  placeholder="Type the announcement message to broadcast to all online users..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  required
                  className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-green-600 focus:ring-4 focus:ring-green-600/10 outline-none transition-all text-sm font-semibold resize-none text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {broadcastFeedback && (
                <div className={`p-4 rounded-2xl text-xs font-bold ${broadcastFeedback.type === 'success' ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'}`}>
                  {broadcastFeedback.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowBroadcastModal(false)}
                  className="rounded-2xl px-5 py-3 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingBroadcast}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl px-6 py-3 font-bold shadow-lg shadow-orange-600/30 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmittingBroadcast ? 'Broadcasting...' : (
                    <>
                      <Send className="w-4 h-4 text-white" />
                      <span>Send Live Broadcast</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}