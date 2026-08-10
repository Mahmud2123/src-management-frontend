// app/statistics/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area, 
  BarChart, Bar
} from 'recharts';
import { 
  TrendingUp, CheckCircle, Clock, AlertTriangle, 
  BarChart3, PieChart as PieIcon, LayoutDashboard, RefreshCcw, 
  Lightbulb, Activity, ArrowUp, ArrowDown
} from 'lucide-react';
import { fetchGlobalStats } from '@/lib/api';
import LoadingState from '@/components/LoadingState';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';

const COLORS = {
  primary: '#10b981',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.info,
  COLORS.warning,
  COLORS.danger,
  COLORS.purple,
  COLORS.pink,
  COLORS.indigo,
  COLORS.success,
];

export default function GlobalStats() {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  
  const { data: stats, isLoading, isError, refetch, error } = useQuery({
    queryKey: ['global-stats', timeRange],
    queryFn: fetchGlobalStats,
    staleTime: 60000,
    retry: 2,
  });

  // ✅ MOVED: All useMemo hooks to the top level, before any conditional returns
  const summaryCards = useMemo(() => [
    { 
      title: 'Total Issues', 
      value: stats?.total || 0, 
      icon: LayoutDashboard, 
      color: COLORS.info, 
      bg: 'bg-blue-50/80',
    },
    { 
      title: 'Resolved', 
      value: stats?.resolved || 0, 
      icon: CheckCircle, 
      color: COLORS.success, 
      bg: 'bg-emerald-50/80',
    },
    { 
      title: 'Suggestions', 
      value: stats?.totalSuggestions || 0, 
      icon: Lightbulb, 
      color: COLORS.warning, 
      bg: 'bg-yellow-50/80',
    },
    { 
      title: 'Pending', 
      value: stats?.pending || 0, 
      icon: AlertTriangle, 
      color: COLORS.danger, 
      bg: 'bg-rose-50/80',
    },
  ], [stats]);

  // ✅ MOVED: Prepare chart data with fallbacks
  const weeklyData = useMemo(() => stats?.weeklyTrend || [], [stats]);
  const priorityData = useMemo(() => stats?.byPriority || [], [stats]);
  const suggestionData = useMemo(() => stats?.suggestionCategories || [], [stats]);

  // ✅ AFTER all hooks: Conditional returns for loading/error states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-emerald-50/30 p-6">
        <LoadingState message="Crunching Campus Data..." />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-emerald-50/30 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[2rem] p-8 shadow-2xl border border-gray-100 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sync Interrupted</h2>
          <p className="text-gray-500 mb-8 text-sm">
            {error instanceof Error ? error.message : "We're having trouble reaching the analytics server. Check your connection or contact the technical team."}
          </p>
          <button 
            onClick={() => refetch()}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
          >
            <RefreshCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // The rest of your component remains the same
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-emerald-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 text-green-600 font-bold tracking-widest text-xs uppercase bg-green-50 px-3 py-1 rounded-full">
              <Activity className="w-3 h-3" />
              Live Statistics
            </span>
            <h1 className="text-4xl font-black text-gray-900 mt-2 flex items-center gap-3">
              Analytics Hub
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {format(new Date(), 'MMMM yyyy')}
              </span>
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
              {(['week', 'month'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    timeRange === range
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryCards.map((card) => (
            <div 
              key={card.title} 
              className={`${card.bg} p-6 rounded-[2rem] border border-white/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm`}>
                <card.icon className={`w-6 h-6`} style={{ color: card.color }} />
              </div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-4">{card.title}</p>
              <p className="text-3xl font-black mt-1" style={{ color: card.color }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weekly Activity Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Weekly Activity</h3>
                <p className="text-sm text-gray-500">Complaint trends over time</p>
              </div>
            </div>
            <div className="h-72">
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#9ca3af', fontSize: 12}} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#9ca3af', fontSize: 12}} 
                    />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke={COLORS.primary} 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorCount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No weekly data available
                </div>
              )}
            </div>
          </div>

          {/* Priority Distribution Chart */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Priority Distribution</h3>
            <p className="text-sm text-gray-500 mb-4">Issues by priority level</p>
            
            <div className="flex-1 h-64">
              {priorityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="_count"
                      nameKey="priority"
                      stroke="none"
                      cornerRadius={8}
                    >
                      {priorityData.map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No priority data available
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
              {priorityData.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} 
                  />
                  <span className="text-xs font-medium text-gray-700 capitalize">
                    {item.priority?.toLowerCase() || 'unknown'}: {item._count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Suggestion Categories Chart */}
        {suggestionData.length > 0 && (
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Suggestion Distribution</h3>
                <p className="text-sm text-gray-500">Breakdown by category</p>
              </div>
              <Lightbulb className="text-yellow-500 w-5 h-5" />
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={suggestionData}
                  layout="vertical"
                  margin={{ left: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis 
                    type="number"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 12}} 
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6b7280', fontSize: 12}} 
                    width={100}
                  />
                  <Tooltip />
                  <Bar 
                    dataKey="value" 
                    radius={[0, 8, 8, 0]}
                    fill={COLORS.warning}
                  >
                    {suggestionData.map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CHART_COLORS[index % CHART_COLORS.length]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Status Overview */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Status Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Pending', value: stats.pending || 0, color: COLORS.warning },
              { label: 'In Progress', value: stats.inProgress || 0, color: COLORS.info },
              { label: 'Resolved', value: stats.resolved || 0, color: COLORS.success },
              { label: 'Rejected', value: stats.rejected || 0, color: COLORS.danger },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{item.label}</span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}