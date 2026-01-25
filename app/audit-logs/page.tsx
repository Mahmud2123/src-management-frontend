'use client';
import { useQuery } from '@tanstack/react-query';
import {fetchUserActivity} from '@/lib/api';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Activity, User, Shield, Info } from 'lucide-react';

export default function AuditLogsPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
     return fetchUserActivity()
    }
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="w-8 h-8 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-900">System Audit Logs</h1>
      </div>

      <Card className="overflow-hidden border-0 shadow-lg">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold uppercase text-gray-500">Timestamp</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-500">User</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-500">Action</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-500">Entity</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-500">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs?.map((log: any) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm text-gray-600">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{log.user?.name || 'System'}</span>
                  </div>
                </td>
                <td className="p-4">
                  <Badge className={log.action.includes('DELETE') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                    {log.action}
                  </Badge>
                </td>
                <td className="p-4 text-sm font-medium">{log.entityType}</td>
                <td className="p-4 text-sm text-gray-500 max-w-xs truncate">
                  {JSON.stringify(log.changes)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}