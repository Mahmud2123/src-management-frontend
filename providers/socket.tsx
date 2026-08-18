'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/providers/auth';

interface SocketContextType {
  notificationsSocket: Socket | null;
  complaintsSocket: Socket | null;
  isConnectedNotifications: boolean;
  isConnectedComplaints: boolean;
}

const SocketContext = createContext<SocketContextType>({
  notificationsSocket: null,
  complaintsSocket: null,
  isConnectedNotifications: false,
  isConnectedComplaints: false,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [notificationsSocket, setNotificationsSocket] = useState<Socket | null>(null);
  const [complaintsSocket, setComplaintsSocket] = useState<Socket | null>(null);
  const [isConnectedNotifications, setIsConnectedNotifications] = useState(false);
  const [isConnectedComplaints, setIsConnectedComplaints] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('src_token') : null;
    if (!user?.id || !token) return;

    const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

    // Notifications namespace
    const notificationsInstance: Socket = io(`${baseUrl}/notifications`, {
      transports: ['websocket', 'polling'],
      auth: { token, userId: user.id },
      query: { userId: user.id },
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    notificationsInstance.on('connect', () => {
      // DEBUG: console.log('[Socket] Connected to /notifications namespace:', notificationsInstance.id);
      setIsConnectedNotifications(true);
    });
    notificationsInstance.on('disconnect', (reason) => {
      console.warn('[Socket] /notifications disconnected:', reason);
      setIsConnectedNotifications(false);
    });
    notificationsInstance.on('connect_error', (err) => console.error('[Socket /notifications] Error', err.message));
    setNotificationsSocket(notificationsInstance);

    // Complaints namespace (separate socket to allow room joins)
    const complaintsInstance: Socket = io(`${baseUrl}/complaints`, {
      transports: ['websocket', 'polling'],
      auth: { token, userId: user.id },
      query: { userId: user.id },
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    complaintsInstance.on('connect', () => {
      // DEBUG: console.log('[Socket] Connected to /complaints namespace:', complaintsInstance.id);
      setIsConnectedComplaints(true);
    });
    complaintsInstance.on('disconnect', (reason) => {
      console.warn('[Socket] /complaints disconnected:', reason);
      setIsConnectedComplaints(false);
    });
    complaintsInstance.on('connect_error', (err) => console.error('[Socket /complaints] Error', err.message));
    setComplaintsSocket(complaintsInstance);

    return () => {
      try {
        notificationsInstance.removeAllListeners();
        notificationsInstance.disconnect();
      } catch (e) {}
      try {
        complaintsInstance.removeAllListeners();
        complaintsInstance.disconnect();
      } catch (e) {}
      setNotificationsSocket(null);
      setComplaintsSocket(null);
      setIsConnectedNotifications(false);
      setIsConnectedComplaints(false);
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ notificationsSocket, complaintsSocket, isConnectedNotifications, isConnectedComplaints }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);