'use client';

import { useStats } from '@/hooks/useStats';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/providers/auth';
import { useRouter } from 'next/navigation';
import LoadingState from '@/components/LoadingState'; 
import { useQuery } from '@tanstack/react-query';

import { fetchCategories, fetchUserActivity } from '@/lib/api';

import { formatDistanceToNow } from 'date-fns'; 
import {
  PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart
} from 'recharts';
import {
  FileText, Clock, CheckCircle, XCircle, TrendingUp, TrendingDown,
  Activity, AlertCircle, Users, Calendar, Target, Award, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const COLORS = {
  primary: ['#16a34a', '#22c55e', '#4ade80', '#86efac'],
  status: ['#facc15', '#f97316', '#16a34a', '#ef4444', '#8b5cf6'],
  gradient: ['#059669', '#10b981', '#34d399'],
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useStats();
  const router = useRouter();
  

  const { data: activities = [], isLoading: loadingActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => fetchUserActivity(),
  });

   
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })
  

  if (isLoading) {
    return <LoadingState message="Loading dashboard statistics..." />;
  }
  //Helper to map types to colors (same logic as your notifications page)
const getActivityStyle = (type: string) => {
  const styles: Record<string, string> = {
    'STATUS_CHANGE': 'bg-orange-500',
    'NEW_COMMENT': 'bg-purple-500',
    'NEW_COMPLAINT': 'bg-blue-500',
    'RESOLVED': 'bg-green-500',
    'default': 'bg-gray-500'
  };
  return styles[type] || styles.default;
};

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Statistics</h3>
          <p className="text-gray-600">{error.message}</p>
        </Card>
      </div>
    );
  }
      
     // 2. Create a lookup object for fast searching
// maps 'id' -> 'name'
const categoryMap = categories.reduce((acc: any, cat: any) => {
  acc[cat.value] = cat.label;
  return acc;
}, {});
    

// 3. Update your categoryData mapping logic
const categoryData = data?.byCategory?.map((item: { categoryId: string; _count: number }) => ({
  // ✅ Look up the name using the ID, fallback to ID if not found
  name: categoryMap[item.categoryId] || item.categoryId, 
  value: item._count,
})) || [];

  const priorityData = data?.byPriority?.map((item: { priority: string; _count: number }) => ({
    name: item.priority,
    value: item._count,
  })) || [];

  const statusData = [
    { name: 'Pending', value: data?.pending || 0, color: '#facc15' },
    { name: 'In Progress', value: data?.inProgress || 0, color: '#f97316' },
    { name: 'Resolved', value: data?.resolved || 0, color: '#16a34a' },
  ];

  const resolutionRate = data?.total ? ((data.resolved / data.total) * 100).toFixed(1) : '0';
  const pendingRate = data?.total ? ((data.pending / data.total) * 100).toFixed(1) : '0';



  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    bgColor, 
    trend, 
    trendValue,
    onClick 
  }: any) => (
    <Card 
      className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 cursor-pointer" 
      onClick={onClick}
    >
      <div className={`absolute inset-0 ${bgColor} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 ${bgColor} bg-opacity-10 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${color}`} strokeWidth={2.5} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 p-6 space-y-6">
     <div className="max-w-7xl mx-auto space-y-6"> {/* Change max-w here */}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold">
            <Activity className="w-4 h-4 mr-2" />
            {user?.role?.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
    title={['STUDENT', 'CLASS_REP'].includes(user?.role || '') ? "My Submissions" : "Total Complaints"}
    value={data?.total ?? 0}
    icon={FileText}
    color="text-blue-600"
    bgColor="bg-blue-600"
    onClick={() => {
      // Ensure redirect goes to the right filter
      const isStaff = ['ADMIN', 'SRC_MEMBER', 'SRC_EXECUTIVE'].includes(user?.role || '');
      const filter = isStaff ? 'ALL' : 'MINE';
      router.push(`/complaints?filter=${filter}`);
    }}
  />
        <StatCard
          title="Pending Review"
          value={data?.pending ?? 0}
          icon={Clock}
          color="text-yellow-600"
          bgColor="bg-yellow-600"
          trend="down"
          trendValue="-5%"
          onClick={() => router.push('/complaints?status=PENDING')}
        />
        <StatCard
          title="In Progress"
          value={data?.inProgress ?? 0}
          icon={Activity}
          color="text-orange-600"
          bgColor="bg-orange-600"
          onClick={() => router.push('/complaints?status=IN_PROGRESS')}
        />
        <StatCard
          title="Resolved"
          value={data?.resolved ?? 0}
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-600"
          trend="up"
          trendValue="+18%"
          onClick={() => router.push('/complaints?status=RESOLVED')}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-green-100 text-sm font-medium">Resolution Rate</p>
              <p className="text-3xl font-bold">{resolutionRate}%</p>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${resolutionRate}%` }}
            ></div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-orange-100 text-sm font-medium">Avg. Response Time</p>
              <p className="text-3xl font-bold">2.4 days</p>
            </div>
          </div>
          <p className="text-orange-100 text-sm">24% faster than last month</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-purple-100 text-sm font-medium">Satisfaction Score</p>
              <p className="text-3xl font-bold">4.6/5</p>
            </div>
          </div>
          <p className="text-purple-100 text-sm">Based on 156 feedbacks</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Status Distribution</h3>
              <p className="text-sm text-gray-600 mt-1">Current complaint statuses</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <PieChart className="w-5 h-5 text-green-700" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Complaints by Category</h3>
              <p className="text-sm text-gray-600 mt-1">Top categories this month</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart className="w-5 h-5 text-blue-700" />
            </div>
          </div>
         <ResponsiveContainer width="100%" height={350}>
  <BarChart 
    data={categoryData} 
    margin={{ top: 10, right: 30, left: 0, bottom: 20 }} // Adds padding inside the card
  >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6b7280', fontSize: 10 }} // Smaller font for long names
                 axisLine={{ stroke: '#e5e7eb' }}
                  interval={0} // Force show all names
                   height={60} // Give space for rotated labels
                   angle={-15}
                      tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 10)}...` : value} // Optional: truncate long names
                     />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {categoryData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Priority Distribution */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Priority Levels</h3>
              <p className="text-sm text-gray-600 mt-1">Complaint urgency breakdown</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-700" />
            </div>
          </div>
          <div className="space-y-4">
            {priorityData.map((item: any, idx: number) => {
              const total = priorityData.reduce((sum: number, p: any) => sum + p.value, 0);
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
              const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
              
              return (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{item.value}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${colors[idx]} h-3 rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 border-0 shadow-xl bg-white">
  <div className="flex items-center justify-between mb-8">
    <div>
      <h3 className="text-xl font-extrabold text-gray-900">Recent Activity</h3>
      <p className="text-sm font-medium text-gray-500 mt-1">Latest updates</p>
    </div>
    <div className="p-2.5 bg-purple-50 rounded-xl">
      <Activity className="w-5 h-5 text-purple-600" />
    </div>
  </div>

  <div className="space-y-3">
    {loadingActivity ? (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
      </div>
    ) : activities.length > 0 ? (
      activities.map((activity: any) => (
        <div 
          key={activity.id} 
          className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer border border-transparent hover:border-gray-100"
          onClick={() => activity.complaintId && router.push(`/complaints/${activity.complaintId}`)}
        >
          {/* Status Dot */}
          <div className="mt-1.5 flex-shrink-0">
            <div className={`w-3 h-3 ${getActivityStyle(activity.type)} rounded-full ring-4 ring-white shadow-sm`} />
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
              <p className="text-[15px] font-bold text-gray-900 leading-tight">
                {activity.title || "Untitled Activity"}
              </p>
              <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase flex-shrink-0 w-fit">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            {/* Message - Removed line-clamp to ensure it shows */}
            <p className="text-[13px] font-medium text-gray-700 leading-relaxed break-words">
              {activity.message}
            </p>
          </div>
        </div>
      ))
    ) : (
      <p className="text-center text-gray-500 py-10 text-sm italic">No recent activity</p>
    )}
  </div>
</Card>
      </div>
    </div>
    </div>
  );
}