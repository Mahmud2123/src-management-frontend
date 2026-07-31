'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/providers/auth';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('src_token') : null;
    if (!user?.id || !token) return;

    // Production environment dynamic URL resolution
    const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

    // 🚀 NestJS Gateway is set to namespace: 'notifications'
    const socketInstance: Socket = io(`${baseUrl}/notifications`, {
      transports: ['websocket', 'polling'], // Fallback strategy for production reverse proxies (Nginx/Cloudflare)
      auth: {
        token,
        userId: user.id, // Handshake auth payload matching NestJS gateway
      },
      query: {
        userId: user.id, // Fallback query payload
      },
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to /notifications namespace:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('[Socket Error]', err.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);