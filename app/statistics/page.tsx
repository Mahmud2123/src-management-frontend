'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card } from '@/components/Card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, PieChart, Pie 
} from 'recharts';
import { Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

export default function StatisticsPage() {
  const { data: stats } = useQuery({
    queryKey: ['global-stats'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:3001/api/complaints/stats/global', {
        headers: { Authorization: `Bearer ${localStorage.getItem('src_token')}` }
      });
      return res.data;
    }
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">
      <h1 className="text-3xl font-bold">Global Insights</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border-0 shadow-sm">
          <Clock className="text-blue-600 mb-2" />
          <p className="text-sm text-gray-500">Avg Resolution</p>
          <p className="text-2xl font-bold">1.4 Days</p>
        </Card>
        <Card className="p-6 bg-white border-0 shadow-sm">
          <CheckCircle className="text-green-600 mb-2" />
          <p className="text-sm text-gray-500">Resolution Rate</p>
          <p className="text-2xl font-bold">92%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 border-0 shadow-lg">
          <h3 className="font-bold mb-6">Complaint Volume Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-lg">
          <h3 className="font-bold mb-6">Departmental Performance</h3>
          <div className="space-y-4">
            {stats?.byCategory?.map((item: any) => (
              <div key={item.categoryId}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.categoryId}</span>
                  <span className="font-bold">{item._count}</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                   <div className="bg-green-600 h-full" style={{ width: `${(item._count / stats.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}