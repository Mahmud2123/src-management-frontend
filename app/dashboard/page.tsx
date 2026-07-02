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
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  FileText, Clock, CheckCircle, Activity, AlertCircle, 
  Calendar, Target, Award, ArrowUpRight, ArrowDownRight, TrendingUp
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
  });

  if (isLoading) {
    return <LoadingState message="Loading dashboard statistics..." />;
  }

  const getActivityStyle = (action: string) => {
    const styles: Record<string, string> = {
      'STATUS_CHANGE': 'bg-amber-500 dark:bg-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
      'RESOLVED': 'bg-emerald-500 dark:bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
      'REJECTED': 'bg-rose-500 dark:bg-rose-600 shadow-[0_0_8px_rgba(244,63,94,0.4)]',
      'NEW_COMMENT': 'bg-indigo-500 dark:bg-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.4)]',
      'COMMENT_ADDED': 'bg-indigo-500 dark:bg-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.4)]',
      'NEW_COMPLAINT': 'bg-sky-500 dark:bg-sky-600 shadow-[0_0_8px_rgba(14,165,233,0.4)]',
      'COMPLAINT_CREATED': 'bg-sky-500 dark:bg-sky-600 shadow-[0_0_8px_rgba(14,165,233,0.4)]',
      'USER_LOGIN': 'bg-slate-400 dark:bg-slate-500',
      'PROFILE_UPDATE': 'bg-teal-500 dark:bg-teal-600',
      'default': 'bg-gray-400 dark:bg-gray-500'
    };
    
    const lookup = action?.toUpperCase();
    return styles[lookup] || styles.default;
  };

  if (error) {
    return (
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load Statistics</h3>
          <p className="text-gray-600 dark:text-gray-300">{error.message}</p>
        </Card>
      </div>
    );
  }

  const categoryMap = categories.reduce((acc: any, cat: any) => {
    acc[cat.value] = cat.label;
    return acc;
  }, {});

  const categoryData = data?.byCategory?.map((item: { categoryId: string; _count: number }) => ({
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
      onClick={onClick}
    >
      <div className={`absolute inset-0 ${bgColor} opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-15 transition-opacity`}></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 ${bgColor} bg-opacity-10 dark:bg-opacity-20 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${color}`} strokeWidth={2.5} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              trend === 'up' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </Card>
  );

  return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
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
              <Activity className="w-4 h-4 mr-2" />
              {user?.role?.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title={['STUDENT', 'CLASS_REP'].includes(user?.role || '') ? "My Submissions" : "Total Complaints"}
            value={data?.total ?? 0}
            icon={FileText}
            color="text-blue-600 dark:text-blue-400"
            bgColor="bg-blue-600"
            onClick={() => {
              const isStaff = ['ADMIN', 'SRC_MEMBER', 'SRC_EXECUTIVE'].includes(user?.role || '');
              const filter = isStaff ? 'ALL' : 'MINE';
              router.push(`/complaints?filter=${filter}`);
            }}
          />
          <StatCard
            title="Pending Review"
            value={data?.pending ?? 0}
            icon={Clock}
            color="text-yellow-600 dark:text-yellow-400"
            bgColor="bg-yellow-600"
            trend="down"
            trendValue="-5%"
            onClick={() => router.push('/complaints?status=PENDING')}
          />
          <StatCard
            title="In Progress"
            value={data?.inProgress ?? 0}
            icon={Activity}
            color="text-orange-600 dark:text-orange-400"
            bgColor="bg-orange-600"
            onClick={() => router.push('/complaints?status=IN_PROGRESS')}
          />
          <StatCard
            title="Resolved"
            value={data?.resolved ?? 0}
            icon={CheckCircle}
            color="text-green-600 dark:text-green-400"
            bgColor="bg-green-600"
            trend="up"
            trendValue="+18%"
            onClick={() => router.push('/complaints?status=RESOLVED')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white border-0">
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

          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white border-0">
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

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white border-0">
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
                <PieChart className="w-5 h-5 text-green-700 dark:text-green-300" />
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
                <BarChart className="w-5 h-5 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart 
                data={categoryData} 
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  interval={0}
                  height={60}
                  angle={-15}
                  tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 10)}...` : value}
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
                <AlertCircle className="w-5 h-5 text-orange-700 dark:text-orange-300" />
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

          {/* Recent Activity Card */}
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-300" />
              </div>
            </div>

            <div className="space-y-3">
              {loadingActivity ? (
                <div className="animate-pulse space-y-4">
                </div>
              ) : activities.length > 0 ? (
                activities.map((activity: any) => (
                  <div 
                    key={activity.id} 
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                        {activity.details || "Action processed successfully."}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}