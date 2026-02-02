'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchUserActivity } from '@/lib/index';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { 
  Activity, User, Shield, Info, Clock, 
  ArrowRight, CheckCircle2, XCircle, Eye, AlertTriangle 
} from 'lucide-react';
import { format } from 'date-fns';

export default function AuditLogsPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: fetchUserActivity
  });

  // Enhanced Styling Logic for "Critical" vs "Routine"
  const getActionConfig = (action: string) => {
    if (action.includes('REJECT') || action.includes('DELETE')) {
      return { 
        style: 'bg-red-50 text-red-700 border-red-100', 
        icon: <XCircle className="w-3 h-3" />,
        priority: 'CRITICAL'
      };
    }
    if (action.includes('VERIFY') || action.includes('RESOLVE')) {
      return { 
        style: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
        icon: <CheckCircle2 className="w-3 h-3" />,
        priority: 'IMPORTANT'
      };
    }
    return { 
      style: 'bg-slate-50 text-slate-600 border-slate-100', 
      icon: <Info className="w-3 h-3" />,
      priority: 'ROUTINE'
    };
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-gray-500 font-medium">Reconstructing system timeline...</p>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#fcfcfc] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Security & Oversight</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Audit</h1>
          <p className="text-gray-500 mt-2">A complete ledger of every critical moderation and administrative action.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="px-6 py-3 bg-white shadow-sm border border-gray-100 rounded-2xl">
                <p className="text-[10px] uppercase font-black text-gray-400">Total Events</p>
                <p className="text-2xl font-black text-indigo-600">{logs?.length || 0}</p>
            </div>
        </div>
      </div>

      <Card className="overflow-hidden border-0 shadow-2xl rounded-[2.5rem] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-6 text-xs font-black uppercase text-gray-400 tracking-widest">Actor</th>
                <th className="p-6 text-xs font-black uppercase text-gray-400 tracking-widest">Action</th>
                <th className="p-6 text-xs font-black uppercase text-gray-400 tracking-widest">Subject</th>
                <th className="p-6 text-xs font-black uppercase text-gray-400 tracking-widest">Outcome / Reasoning</th>
                <th className="p-6 text-xs font-black uppercase text-gray-400 tracking-widest">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs?.map((log: any) => {
                const config = getActionConfig(log.action);
                return (
                  <tr key={log.id} className="hover:bg-gray-50/40 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                          {log.user?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{log.user?.name || 'System'}</p>
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                            {log.user?.role || 'AUTO-WORKFLOW'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <Badge className={`${config.style} flex items-center gap-1.5 py-1 px-3 rounded-lg border text-[10px] font-bold`}>
                        {config.icon}
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">{log.entityType}</span>
                        <span className="text-[10px] text-indigo-400 font-mono">
                          #{log.entityId ? log.entityId.slice(-6) : 'SYSTEM'}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="max-w-xs">
                        {log.details ? (
                          <p className="text-xs text-gray-600 leading-relaxed italic border-l-2 border-gray-100 pl-3">
                            "{log.details}"
                          </p>
                        ) : (
                          <span className="text-gray-300 text-[10px]">No additional notes</span>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-gray-400 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        <span className="text-[11px] font-bold uppercase tracking-tighter">
                            {format(new Date(log.createdAt), 'MMM dd • HH:mm')}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}