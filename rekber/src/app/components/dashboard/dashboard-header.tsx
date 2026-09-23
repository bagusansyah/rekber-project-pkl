'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button'; 
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar'; 
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '@/constants/api';
import { encodeTransactionId } from '@/lib/transactionId';

// Interface untuk notifikasi
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

// Hook untuk Socket.IO notifications
const useSocketNotifications = () => {
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping socket connection');
      return;
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Initialize Socket.IO connection
    const initializeSocket = () => {
      try {
        const SOCKET_URL = API_URL;
        
        // Create socket connection with auth
        const socket = io(SOCKET_URL, {
          auth: {
            token: token
          },
          transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 10000
        });

        socketRef.current = socket;

        // Connection event handlers
        socket.on('connect', () => {
          console.log('Socket.IO connected:', socket.id);
          setIsConnected(true);
          
          // Request initial notifications data
          socket.emit('get_notifications');
        });

        socket.on('disconnect', (reason) => {
          console.log('Socket.IO disconnected:', reason);
          setIsConnected(false);
          
          if (reason === 'io server disconnect') {
            // Server disconnected, reconnect manually
            socket.connect();
          }
        });

        socket.on('connect_error', (error) => {
          console.error('Socket.IO connection error:', error);
          setIsConnected(false);
        });

        socket.on('reconnect', (attemptNumber) => {
          console.log('Socket.IO reconnected after', attemptNumber, 'attempts');
          setIsConnected(true);
        });

        socket.on('reconnect_error', (error) => {
          console.error('Socket.IO reconnection error:', error);
        });

        socket.on('reconnect_failed', () => {
          console.error('Socket.IO failed to reconnect after maximum attempts');
          setIsConnected(false);
        });

        // Notification event handlers
        socket.on('initial_notifications', (data) => {
          console.log('Received initial notifications:', data);
          setNotifications(data.notifications || []);
          setUnreadCount(data.unread_count || 0);
        });

        socket.on('new_notification', (notification: ChatNotification) => {
          console.log('New notification received:', notification);
          
          // Update state
          setNotifications(prev => {
            // Check for duplicates
            const exists = prev.find(n => n.id === notification.id);
            if (exists) return prev;
            return [notification, ...prev];
          });
          
          setUnreadCount(prev => prev + 1);
          
          // Show notifications
          showNotifications(notification);
        });

        socket.on('notification_read', (data) => {
          console.log('Notification marked as read:', data.notification_id);
          
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === data.notification_id 
                ? { ...notif, is_read: true } 
                : notif
            )
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        });

        socket.on('all_notifications_read', () => {
          console.log('All notifications marked as read');
          
          setNotifications(prev => 
            prev.map(notif => ({ ...notif, is_read: true }))
          );
          setUnreadCount(0);
          
          toast.success('Semua notifikasi telah ditandai dibaca');
        });

        // Error handling
        socket.on('error', (error) => {
          console.error('Socket.IO error:', error);
          toast.error('Terjadi kesalahan pada koneksi notifikasi');
        });

        socket.on('auth_error', (error) => {
          console.error('Socket.IO authentication error:', error);
          toast.error('Sesi telah berakhir, silakan login kembali');
          
          // Clear auth data and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          localStorage.removeItem('name');
          window.location.href = '/auth/login';
        });

        return socket;

      } catch (error) {
        console.error('Failed to initialize socket:', error);
        setIsConnected(false);
        return null;
      }
    };
// Show notifications helper
    const showNotifications = (notification: ChatNotification) => {
      // Browser notification
      if (Notification.permission === 'granted') {
        try {
          const browserNotification = new Notification('Pesan Baru - Rekber.com', {
            body: `${notification.message}`,
            icon: '/favicon.ico',
            badge: '/images/Logo 1.png',
            tag: `notification-${notification.id}`,
            requireInteraction: false,
            silent: false,
            data: {
              transaction_id: notification.transaction_id,
              notification_id: notification.id
            }
          });

          browserNotification.onclick = () => {
            window.focus();
            window.location.href = `/dashboard/transactions/${encodeTransactionId(notification.transaction_id)}`;
            browserNotification.close();
          };
 
        } catch (error) {
          console.error('Failed to show browser notification:', error);
        }
      }

      // Push notification (Service Worker)
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
          // Check if push messaging is supported
          if (registration.pushManager) {
            // Show push notification via service worker
            registration.showNotification('Pesan Baru - Rekber.com', {
              body: `${notification.message}`,
              icon: '/favicon.ico',
              badge: '/images/Logo 1.png',
              tag: `push-notification-${notification.id}`,
              requireInteraction: false,
              silent: false, 
              data: {
                transaction_id: notification.transaction_id,
                notification_id: notification.id,
                url: `/dashboard/transactions/${encodeTransactionId(notification.transaction_id)}`
              }
            }).catch(error => {
              console.error('Failed to show push notification:', error);
            });
          }
        }).catch(error => {
          console.error('Service worker not ready:', error);
        });
      } 
    };
 
    // Initialize socket
    initializeSocket();

    // Cleanup function
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    if (socketRef.current && socketRef.current.connected) {
      // Emit to server via socket
      socketRef.current.emit('mark_notification_read', { notification_id: notificationId });
    } else {
      // Fallback to HTTP API
      const token = localStorage.getItem('token');
      try {
        const API_URL = 'https://api.rekber.com';
        const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === notificationId ? { ...notif, is_read: true } : notif
            )
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
        toast.error('Gagal menandai notifikasi sebagai dibaca');
      }
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (socketRef.current && socketRef.current.connected) {
      // Emit to server via socket
      socketRef.current.emit('mark_all_notifications_read');
    } else {
      // Fallback to HTTP API
      const token = localStorage.getItem('token');
      try {
        const API_URL = 'https://api.rekber.com';
        const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          setNotifications(prev => 
            prev.map(notif => ({ ...notif, is_read: true }))
          );
          setUnreadCount(0);
          toast.success('Semua notifikasi telah ditandai dibaca');
        }
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        toast.error('Gagal menandai semua notifikasi sebagai dibaca');
      }
    }
  };

  return { 
    notifications, 
    unreadCount, 
    isConnected, 
    markAsRead, 
    markAllAsRead,
    socket: socketRef.current
  };
};

export function DashboardHeader() { 
  const [userName, setUserName] = useState('');  
  const router = useRouter();
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } = useSocketNotifications();

  // Check authentication status from localStorage
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('email');
        const name = localStorage.getItem('name');
        
        if (token && email) {  
          setUserName(name || email.split('@')[0]);
        } else { 
          setUserName('');
        }
      } catch (error) {
        console.error('Error checking auth status:', error); 
      } 
    };

    checkAuthStatus();

    // Listen for storage changes (for cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'email' || e.key === 'name') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const handleLogout = () => {
    try {
      // Clear all auth-related data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('name');
      Cookies.remove('token');

      setUserName('');
       
      // Redirect to home page
      router.push('/');
      
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} jam lalu`;
    return `${Math.floor(diffInMinutes / 1440)} hari lalu`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat': return '💬';
      case 'payment': return '💳';
      case 'status': return '📋';
      default: return '🔔';
    }
  };
  useEffect(() => {
    // Register service worker for push notifications
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw-notif.js')
        .then(registration => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);
  return (
    <header className='flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 sticky top-0 z-30'>
      {/* BAGIAN KIRI: Hamburger & Logo Mobile */}
      <div className='flex items-center gap-3'>
        <SidebarTrigger /> 
        
        {/* INJEKSI LOGO KHUSUS MOBILE */}
        {/* <Link href="/dashboard" className="block md:hidden flex items-center"> */}
          {/* Menggunakan fallback teks bergaya jika gambar belum sesuai, atau gunakan tag img di bawahnya */}
          {/* <span className="font-extrabold text-blue-600 text-lg tracking-tight">
            REKBER<span className="text-gray-800">.COM</span>
          </span> */}
          {/* Alternatif jika Anda ingin memakai gambar logo asli:  */}
          {/* <img src="/images/Logo 1.png" alt="Rekber.com" className="h-6 w-auto object-contain" />  */}
         
        {/* </Link> */}
      </div>

      <div className='flex items-center gap-2 md:gap-4'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='relative'>
              <Bell className={`h-5 w-5 md:h-4 md:w-4 ${unreadCount > 0 ? 'animate-pulse text-red-500' : ''}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              {/* Connection indicator */}
              {/* <span 
                className={`absolute -bottom-1 -right-1 h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`}
                title={isConnected ? 'Terhubung' : 'Terputus'}
              /> */}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-80 max-h-96 overflow-hidden'>
            <div className='flex items-center justify-between p-3 border-b bg-gray-50'>
              <DropdownMenuLabel className='text-sm font-semibold flex items-center gap-2'>
                🔔 Notifikasi ({unreadCount})
                {!isConnected && (
                  <span className='text-xs text-red-500 bg-red-100 px-2 py-1 rounded'>
                    Offline
                  </span>
                )}
              </DropdownMenuLabel>
              {unreadCount > 0 && (
                <Button 
                  variant='ghost' 
                  size='sm' 
                  onClick={markAllAsRead}
                  className='text-xs text-blue-600 hover:text-blue-800 h-6 px-2'
                >
                  Tandai Semua
                </Button>
              )}
            </div>
            
            <div className='max-h-80 overflow-y-auto'>
              {notifications.length === 0 ? (
                <div className='p-6 text-center text-gray-500 text-sm'>
                  <Bell className='h-8 w-8 mx-auto mb-2 text-gray-300' />
                  <p>Tidak ada notifikasi</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    className={`p-3 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 ${
                      !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => {
                      markAsRead(notification.id);
                      router.push(`/dashboard/transactions/${encodeTransactionId(notification.transaction_id)}`);
                    }}
                  >
                    <div className='flex items-start space-x-3 w-full'>
                      <span className='text-lg flex-shrink-0 mt-1'>
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between mb-1'>
                          <span className='text-sm font-medium text-gray-900 truncate'>
                            {notification.title}
                          </span>
                          <span className='text-sm font-medium text-gray-900 truncate'>
                            {notification.sender_name}
                          </span>
                          <span className='text-xs text-gray-500 flex-shrink-0 ml-2'>
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                        <p className='text-xs text-gray-600 line-clamp-2 mb-1'>
                          {notification.message}
                        </p> 
                      </div>
                      {!notification.is_read && (
                        <div className='w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2' />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            
            {notifications.length > 10 && (
              <div className='p-3 border-t bg-gray-50'>
                <Link 
                  href="/dashboard/notifications" 
                  className='block w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium'
                >
                  Lihat Semua Notifikasi →
                </Link>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon'>
              <User className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>{userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/dashboard/profile">
              <DropdownMenuItem>Profil</DropdownMenuItem>
            </Link> 
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Keluar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}