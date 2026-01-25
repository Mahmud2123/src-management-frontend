'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { useRouter } from 'next/navigation';
import { fetchNotifications, markNotificationRead } from '@/lib/api';
import { toast } from 'sonner';
import {
  Bell, Check, CheckCheck, Eye, MessageSquare, AlertCircle,
  TrendingUp, UserPlus, RefreshCw, Trash2, Clock
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  complaintId?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification marked as read');
    },
  });

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'STATUS_CHANGE': return <TrendingUp className="w-5 h-5" />;
      case 'NEW_COMMENT': return <MessageSquare className="w-5 h-5" />;
      case 'ASSIGNMENT': return <UserPlus className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    const baseColors = {
      'STATUS_CHANGE': 'bg-blue-500 text-white',
      'NEW_COMMENT': 'bg-green-500 text-white',
      'ASSIGNMENT': 'bg-purple-500 text-white',
      'default': 'bg-gray-500 text-white'
    };
    
    const readColors = {
      'STATUS_CHANGE': 'bg-blue-100 text-blue-600',
      'NEW_COMMENT': 'bg-green-100 text-green-600',
      'ASSIGNMENT': 'bg-purple-100 text-purple-600',
      'default': 'bg-gray-100 text-gray-600'
    };
    
    return isRead ? (readColors[type] || readColors.default) : (baseColors[type] || baseColors.default);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.complaintId) {
      router.push(`/complaints/${notification.complaintId}`);
    }
  };

  const markAllAsRead = () => {
    notifications
      .filter((n: Notification) => !n.isRead)
      .forEach((n: Notification) => {
        markAsReadMutation.mutate(n.id);
      });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="w-8 h-8 text-green-600" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white px-3 py-1 text-sm font-semibold">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-gray-600 mt-1 font-medium">Stay updated with your complaint activity</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => refetch()} className="flex items-center gap-2 font-semibold">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 font-semibold">
                <CheckCheck className="w-4 h-4" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Total', value: notifications.length, color: 'bg-blue-500', icon: Bell },
            { label: 'Unread', value: unreadCount, color: 'bg-red-500', icon: Eye },
            { label: 'Read', value: notifications.length - unreadCount, color: 'bg-green-500', icon: CheckCheck },
          ].map((stat, idx) => (
            <Card key={idx} className="p-4 border-0 shadow-sm bg-white">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-0 bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
            {notifications.map((notification: Notification) => (
              <div
                key={notification.id}
                className={`group hover:bg-gray-50 transition-all duration-150 cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50' : 'bg-white'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="p-5 flex items-start gap-4 relative">
                  {/* Unread Indicator Bar */}
                  {!notification.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600"></div>
                  )}

                  {/* Icon */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-full ${getNotificationColor(notification.type, notification.read)} flex items-center justify-center shadow-sm`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className={`font-bold mb-1 text-base ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <p className={`text-sm leading-relaxed ${!notification.isRead ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0">
                          <div className="w-2.5 h-2.5 bg-green-600 rounded-full ring-4 ring-green-100"></div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs px-2.5 py-0.5 font-semibold bg-gray-100 text-gray-700">
                          {notification.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      {notification.complaintId && (
                        <span className="text-xs text-green-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details →
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {!notification.isRead && (
                    <div className="flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsReadMutation.mutate(notification.id);
                        }}
                        className="p-2.5 text-green-600 hover:bg-green-100 rounded-full transition-colors shadow-sm border border-green-200 hover:border-green-300"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-16 text-center border-0 shadow-sm bg-white">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-600 font-medium">
              You're all caught up! New notifications will appear here.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
