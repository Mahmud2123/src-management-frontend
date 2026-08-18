// app/notifications/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { 
  Bell, MessageSquare, ShieldCheck, 
  Lightbulb, AlertTriangle, Inbox, Radio,
  CheckCircle2, RefreshCw, XCircle
} from 'lucide-react';
import { fetchNotifications, markAllRead, markNotificationRead } from '@/lib/api';
import LoadingState from '@/components/LoadingState';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth';
import { useSocket } from '@/providers/socket';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // ✅ Fixed: loading not isLoading
  const { notificationsSocket: socket, isConnectedNotifications: isConnected } = useSocket();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Fetch notifications
  const { data: notifications = [], isLoading, isError, refetch } = useQuery({
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
    staleTime: 30000,
  });

  // 2. WebSocket Listener for Real-time Notifications
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (newNotif: any) => {
      // DEBUG: console.log('[Real-Time Notification Received]', newNotif);

      // Show toast alert
      toast.info(newNotif.title || 'New Update', {
        description: newNotif.message,
        icon: <Bell className="w-4 h-4 text-green-600" />,
        duration: 5000,
      });

      // Update cache optimistically
      queryClient.setQueryData(['notifications'], (oldNotifs: any[] = []) => {
        if (oldNotifs.some((n) => n.id === newNotif.id)) return oldNotifs;
        return [newNotif, ...oldNotifs];
      });

      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, isConnected, queryClient]);

  // 3. Mark as Read Mutation
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
      toast.error('Failed to mark notification as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // 4. Mark All as Read Mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => markAllRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      const previousNotifications = queryClient.getQueryData(['notifications']);

      queryClient.setQueryData(['notifications'], (old: any[] = []) =>
        old.map((n) => ({ ...n, isRead: true }))
      );

      return { previousNotifications };
    },
    onSuccess: () => {
      toast.success('All notifications marked as read');
    },
    onError: (err: any, _, context: any) => {
      console.error('[NotificationsPage ERROR] Mark all read failed:', err?.response?.data || err.message);
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
      toast.error('Failed to mark all as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // 5. Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Notifications refreshed');
    } catch (error) {
      toast.error('Failed to refresh notifications');
    } finally {
      setIsRefreshing(false);
    }
  };

  // 6. Get notification config
  const getNotifConfig = (type: string) => {
    switch (type) {
      case 'NEW_COMPLAINT':
      case 'COMPLAINT_CREATED':
      case 'COMPLAINT_APPROVED':
      case 'COMPLAINT_UPDATED':
      case 'STATUS_CHANGE':
      case 'STATUS_CHANGED':
        return { icon: <AlertTriangle className="w-5 h-5 text-orange-600" />, bg: 'bg-orange-50', label: 'Complaint' };
      case 'ANNOUNCEMENT_CREATED':
        return { icon: <Bell className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50', label: 'Announcement' };
      case 'NEW_SUGGESTION':
      case 'SUGGESTION_STATUS_CHANGE':
        return { icon: <Lightbulb className="w-5 h-5 text-yellow-600" />, bg: 'bg-yellow-50', label: 'Suggestion' };
      case 'NEW_COMMENT':
      case 'COMMENT_ADDED':
        return { icon: <MessageSquare className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', label: 'Reply' };
      default:
        return { icon: <Bell className="w-5 h-5 text-gray-600" />, bg: 'bg-gray-50', label: 'System' };
    }
  };

  // 7. Handle notification click
  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) {
      markReadMutation.mutate(notif.id);
    }

    const refId = notif.referenceId;
    const type = notif.type;

    if (!refId) {
      router.push('/notifications');
      return;
    }

    let targetPath = '';
    if (type === 'NEW_SUGGESTION' || type === 'SUGGESTION_STATUS_CHANGE') {
      targetPath = `/suggestions/${refId}`;
    } else if (
      type === 'NEW_COMPLAINT' ||
      type === 'STATUS_CHANGE' ||
      type === 'STATUS_CHANGED' ||
      type === 'NEW_COMMENT' ||
      type === 'COMMENT_ADDED' ||
      type === 'COMPLAINT_CREATED' ||
      type === 'COMPLAINT_APPROVED' ||
      type === 'COMPLAINT_UPDATED'
    ) {
      targetPath = `/complaints/${refId}`;
    } else if (type === 'ANNOUNCEMENT_CREATED') {
      targetPath = '/announcements';
    } else {
      targetPath = '/dashboard';
    }

    router.push(targetPath);
  };

  // 8. Loading states
  if (authLoading || (isLoading && !isError)) {
    return <LoadingState message="Loading your notifications..." />;
  }

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;
  const hasUnread = unreadCount > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-emerald-50/30 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-700 to-green-800 rounded-2xl flex items-center justify-center shadow-lg shadow-green-900/20 flex-shrink-0">
              <Bell className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Notifications</h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
                  isConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  <Radio className={`w-3 h-3 ${isConnected ? 'animate-pulse text-emerald-600' : ''}`} />
                  {isConnected ? 'Live' : 'Connecting...'}
                </span>
              </div>
              <p className="text-sm text-gray-500 font-medium">
                {notifications.length} notifications • {unreadCount} unread
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            
            {hasUnread && (
              <Button
                variant="secondary"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Mark All Read</span>
                <span className="sm:hidden">Read All</span>
              </Button>
            )}
          </div>
        </div>

        {/* Notification Stats */}
        {notifications.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status:</span>
              <Badge className={`${hasUnread ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
                {hasUnread ? `${unreadCount} unread` : 'All read'}
              </Badge>
            </div>
            <div className="w-px h-6 bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Connection:</span>
              <Badge className={isConnected ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                {isConnected ? '🟢 Online' : '🔴 Offline'}
              </Badge>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {isError ? (
            <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 font-bold text-sm">Failed to load notifications</p>
              <p className="text-red-500 text-xs mt-1">Please check your connection or try again later</p>
              <Button
                variant="secondary"
                onClick={handleRefresh}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notif: any) => {
              const config = getNotifConfig(notif.type);
              return (
                <Card 
                  key={notif.id} 
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 sm:p-5 border-0 shadow-sm rounded-2xl flex items-start gap-3 sm:gap-4 transition-all hover:shadow-md cursor-pointer ${
                    notif.isRead ? 'bg-white/60 opacity-75 hover:opacity-100' : 'bg-white ring-1 ring-green-100/50'
                  }`}
                >
                  <div className={`p-2.5 sm:p-3 rounded-xl ${config.bg} mt-1 flex-shrink-0`}>
                    {config.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-1 sm:gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {config.label}
                        </span>
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base mt-0.5 break-words">
                      {notif.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium line-clamp-2 break-words">
                      {notif.message}
                    </p>
                    
                    {notif.metadata?.moderationNotes && (
                      <div className="mt-2 bg-slate-50 border-l-2 border-slate-200 p-2 rounded-r-lg">
                        <p className="text-xs italic text-gray-500 font-semibold">
                          "{notif.metadata.moderationNotes}"
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-16 sm:py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
              <Inbox className="w-12 h-12 sm:w-16 sm:h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-lg">Your inbox is clear</p>
              <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="text-center">
            <p className="text-xs text-gray-400">
              Showing latest {notifications.length} notifications
            </p>
          </div>
        )}
      </div>
    </div>
  );
}