'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { 
  Bell, MessageSquare, ShieldCheck, 
  Lightbulb, AlertTriangle, Inbox, Radio
} from 'lucide-react';
import { fetchNotifications, markNotificationRead } from '@/lib/api';
import LoadingState from '@/components/LoadingState';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth';
import { useSocket } from '@/providers/socket';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { socket, isConnected } = useSocket();

  // 1. Fetch notifications
  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        return await fetchNotifications();
      } catch (err: any) {
        console.error('[NotificationsPage ERROR] Failed to fetch notifications:', err?.response?.data || err.message);
        throw err;
      }
    },
    enabled: !authLoading && !!user && typeof window !== 'undefined' && !!localStorage.getItem('src_token'),
    retry: 1,
  });

  // 2. Production Socket Listener
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (newNotif: any) => {
      console.log('[Real-Time Notification Received]', newNotif);

      // Trigger user-visible toast alert
      toast.info(newNotif.title || 'New Update', {
        description: newNotif.message,
        icon: <Bell className="w-4 h-4 text-green-600" />,
      });

      // Optimistically push into TanStack Query Cache
      queryClient.setQueryData(['notifications'], (oldNotifs: any[] = []) => {
        if (oldNotifs.some((n) => n.id === newNotif.id)) return oldNotifs;
        return [newNotif, ...oldNotifs];
      });
    };

    // Listen to NestJS Gateway event name 'notification:new'
    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, isConnected, queryClient]);

  // 3. Mutation with Optimistic Mark-as-Read
  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      const previousNotifications = queryClient.getQueryData(['notifications']);

      queryClient.setQueryData(['notifications'], (old: any[] = []) =>
        old.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );

      return { previousNotifications };
    },
    onError: (err: any, _, context: any) => {
      console.error('[NotificationsPage ERROR] Mark read failed:', err?.response?.data || err.message);
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getNotifConfig = (type: string) => {
    switch (type) {
      case 'NEW_COMPLAINT': 
        return { icon: <AlertTriangle className="w-5 h-5 text-orange-600" />, bg: 'bg-orange-50', label: 'Complaint' };
      case 'NEW_SUGGESTION': 
      case 'SUGGESTION_STATUS_CHANGE':
        return { icon: <Lightbulb className="w-5 h-5 text-yellow-600" />, bg: 'bg-yellow-50', label: 'Suggestion' };
      case 'STATUS_CHANGE': 
        return { icon: <ShieldCheck className="w-5 h-5 text-green-600" />, bg: 'bg-green-50', label: 'Update' };
      case 'NEW_COMMENT': 
        return { icon: <MessageSquare className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', label: 'Reply' };
      default: 
        return { icon: <Bell className="w-5 h-5 text-gray-600" />, bg: 'bg-gray-50', label: 'System' };
    }
  };

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) {
      markReadMutation.mutate(notif.id);
    }

    const refId = notif.referenceId;
    const type = notif.type;

    if (!refId) return;

    let targetPath = '';
    if (type === 'NEW_SUGGESTION' || type === 'SUGGESTION_STATUS_CHANGE') {
      targetPath = `/suggestions/${refId}`;
    } else if (type === 'NEW_COMPLAINT' || type === 'STATUS_CHANGE' || type === 'NEW_COMMENT') {
      targetPath = `/complaints/${refId}`;
    } else {
      targetPath = '/dashboard';
    }

    router.push(targetPath);
  };

  if (authLoading || (isLoading && !isError)) return <LoadingState />;

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-700 rounded-2xl flex items-center justify-center shadow-lg shadow-green-900/20">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Updates</h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  <Radio className={`w-3 h-3 ${isConnected ? 'animate-pulse text-emerald-600' : ''}`} />
                  {isConnected ? 'Live' : 'Connecting...'}
                </span>
              </div>
              <p className="text-gray-500 font-bold text-sm italic">Latest activities from the portal</p>
            </div>
          </div>

          <Badge className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-black text-xs">
            {unreadCount} UNREAD
          </Badge>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {isError ? (
            <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
              <p className="text-red-600 font-bold text-sm">Failed to load updates. Please verify your connection or try logging in again.</p>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notif: any) => {
              const config = getNotifConfig(notif.type);
              return (
                <Card 
                  key={notif.id} 
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-5 border-0 shadow-sm rounded-2xl flex items-start gap-4 transition-all hover:translate-x-1 cursor-pointer ${
                    notif.isRead ? 'bg-white/60 opacity-75' : 'bg-white ring-1 ring-green-100'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${config.bg} mt-1`}>
                    {config.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{config.label}</span>
                        {!notif.isRead && <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 mt-0.5">{notif.title}</h3>
                    <p className="text-sm text-gray-600 font-medium line-clamp-2">{notif.message}</p>
                    
                    {notif.metadata?.moderationNotes && (
                      <div className="mt-2 bg-slate-50 border-l-2 border-slate-200 p-2 rounded-r-lg">
                        <p className="text-xs italic text-gray-500 font-semibold">"{notif.metadata.moderationNotes}"</p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
              <Inbox className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-bold italic">Your inbox is clear</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}