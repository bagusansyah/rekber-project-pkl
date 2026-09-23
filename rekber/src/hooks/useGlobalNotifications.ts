'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client'; 

import { API_URL } from '@/constants/api';
import { encodeTransactionId } from '@/lib/transactionId';
interface ChatNotification {
  id: number;
  title: string;
  transaction_id: string;
  kode_transaksi: string;
  message: string;
  sender_name: string;
  created_at: string;
  is_read: boolean;
  type: 'chat' | 'payment' | 'status';
}

export const useGlobalNotifications = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Hanya jalankan jika user sudah login
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Register service worker
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw-notif.js')
        .then(registration => {
          console.log('Global notification SW registered:', registration);
        })
        .catch(error => {
          console.error('Global notification SW registration failed:', error);
        });
    }

    // Initialize Socket.IO connection
    const initializeSocket = () => {
      try {
        const SOCKET_URL = API_URL;
        
        const socket = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 10000
        });

        socketRef.current = socket;

        // Connection handlers
        socket.on('connect', () => {
          console.log('Global notification socket connected:', socket.id);
          socket.emit('get_notifications');
        });

        socket.on('disconnect', (reason) => {
          console.log('Global notification socket disconnected:', reason);
          if (reason === 'io server disconnect') {
            socket.connect();
          }
        });

        // Notification handlers
        socket.on('new_notification', (notification: ChatNotification) => {
          console.log('Global notification received:', notification);
          showGlobalNotification(notification);
        });

        socket.on('auth_error', (error) => {
          console.error('Global notification auth error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          localStorage.removeItem('name');
          window.location.href = '/auth/login';
        });

        return socket;
      } catch (error) {
        console.error('Failed to initialize global notification socket:', error);
        return null;
      }
    };

    // Show notification function
    const showGlobalNotification = (notification: ChatNotification) => { 
      // Service Worker Push Notification
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          if (registration.active?.scriptURL.includes('sw-notif.js')) {
            registration.showNotification('Pesan Baru - Rekber.com', {
              body: `${notification.message}`,
              icon: '/favicon.ico',
              badge: '/images/logo.png',
              tag: `global-push-${notification.id}`,
              requireInteraction: false,
              silent: false, 
              data: {
                transaction_id: notification.transaction_id,
                notification_id: notification.id,
                url: `/dashboard/transactions/${encodeTransactionId(notification.transaction_id)}`
              },
            }).catch(error => {
              console.error('Failed to show global push notification:', error);
            });
          }
        }).catch(error => {
          console.error('Global notification service worker not ready:', error);
        });
      }
 
    };

    // Initialize socket
    initializeSocket();

    // Cleanup
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up global notification socket');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return { socket: socketRef.current };
};