'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area, Bar,BarChart
} from 'recharts';
import { 
  TrendingUp, CheckCircle, Clock, AlertTriangle, 
  BarChart3, PieChart as PieIcon, LayoutDashboard, RefreshCcw, Lightbulb, BarChart as BarChartIcon
} from 'lucide-react';
import { fetchGlobalStats } from '@/lib/index';
import LoadingState from '@/components/LoadingState';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function GlobalStats() {
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ['global-stats'],
    queryFn: fetchGlobalStats
  });

  if (isLoading) return <LoadingState message='Crunching Campus Data...' />;
  
  if (isError || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] p-6">
        <div className="max-w-md w-full bg-white rounded-[2rem] p-8 shadow-2xl border border-gray-100 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sync Interrupted</h2>
          <p className="text-gray-500 mb-8 text-sm">
            We're having trouble reaching the analytics server. Check your connection or contact the technical team.
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

  const summaryCards = [
    { title: 'Total Issues', value: stats.total, icon: LayoutDashboard, color: 'text-blue-600', bg: 'bg-blue-50/50' },
    { title: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
    { title: 'Suggestions', value: stats.totalSuggestions || 0, icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-50/50' },
    { title: 'Pending', value: stats.pending, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50/50' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-[#fcfcfc] min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-green-600 font-bold tracking-widest text-xs uppercase">Live Statistics</span>
          <h1 className="text-4xl font-black text-gray-900 mt-1 flex items-center gap-3">
             Analytics Hub
          </h1>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live System Updates
        </div>
      </header>

      {/* Modern Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card) => (
          <div key={card.title} className={`${card.bg} p-8 rounded-[2.5rem] border border-white shadow-sm hover:shadow-md transition-all group`}>
            <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
              <card.icon className={`${card.color} w-6 h-6`} />
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{card.title}</p>
            <p className={`text-4xl font-black ${card.color} mt-2`}>{card.value || 0}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Major Chart - Area Chart is more modern than a Line Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900">Weekly Activity</h3>
            <BarChart3 className="text-gray-300 w-6 h-6" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.weeklyTrend || []}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8f8f8" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} 
                />
                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Donut Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-8">Priority Mix</h3>
          <div className="flex-1 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
              <Pie
  data={stats.byPriority || []}
  innerRadius={70}
  outerRadius={90}
  paddingAngle={8}
  dataKey="_count"
  nameKey="priority"
  stroke="none"
  // Move cornerRadius here if your version supports it on Pie, 
  // otherwise we use a specialized Sector.
  cornerRadius={10} 
>
  {(stats.byPriority || []).map((entry: any, index: number) => (
    <Cell 
      key={`cell-${index}`} 
      fill={COLORS[index % COLORS.length]} 
    />
  ))}
</Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
                 {/* NEW: Suggestion Category Distribution (Bar Chart) */}
                 <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
  <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
    {/* Use the ICON here just for the label */}
    <BarChart3 className="text-yellow-500 w-5 h-5" /> 
    Suggestion Distribution
  </h3>

  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      {/* ✅ CORRECT: Put the data on the actual CHART component from Recharts */}
      <BarChart data={stats.suggestionCategories || []}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8f8f8" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
        <Tooltip cursor={{fill: '#fcfcfc'}} contentStyle={{borderRadius: '15px', border: 'none'}} />
        <Bar dataKey="value" radius={[10, 10, 0, 0]}>
          {(stats.suggestionCategories || []).map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>
    

          <div className="grid grid-cols-2 gap-4 mt-4">
            {stats.byPriority?.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs font-bold text-gray-600">{item.priority}: {item._count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}