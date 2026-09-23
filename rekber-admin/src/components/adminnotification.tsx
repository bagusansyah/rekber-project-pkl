"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation"; 
import { Bell, UserPlus, X, Info, CheckCheck, MessageSquare } from "lucide-react"; 
import { io, Socket } from "socket.io-client"; // Tambahkan import Socket
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
// import { getToken } from '@/constants/api'; // REVISI 1: Import getToken

// REVISI 2: Biasakan menggunakan environment variable untuk URL agar dinamis
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"; 

interface NotifItem {
  id: number;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  data?: any; 
}

export default function AdminNotification() {
  const router = useRouter(); 
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null); // REVISI 3: Gunakan useRef untuk Socket

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    // 1. FETCH HISTORY
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${SOCKET_URL}/api/notifications/admin`);
        const data = await res.json();

        if (Array.isArray(data)) {
          const history = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            message: item.message,
            type: item.type,
            created_at: item.created_at,
            read: item.is_read,
            data: item.data 
          }));
          setNotifications(history);
        }
      } catch (err) {
        console.error("Gagal ambil history:", err);
      }
    };

    fetchHistory();

    // 2. SOCKET REALTIME INITIALIZATION
    // Ambil token langsung dari storage (Sesuaikan 'token' jika admin Anda menggunakan nama key lain seperti 'admin_token')
    const token = localStorage.getItem('token');
    
    // REVISI 4: Masukkan token ke dalam koneksi Socket
    socketRef.current = io(SOCKET_URL, { 
      transports: ["websocket"],
      auth: { token: token } // PENTING: Autentikasi koneksi
    });
    
    // Debugging Koneksi
    socketRef.current.on("connect", () => {
      console.log("🟢 Socket Admin Terhubung:", socketRef.current?.id);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("🔴 Socket Admin Gagal Terhubung (Cek Token/Backend):", err.message);
    });
    
    // 3. LISTENER NOTIFIKASI
    socketRef.current.on("admin_notification", (data: any) => {
      console.log("🔔 Notifikasi Realtime Masuk:", data); // Debugging pesan masuk
      
      const newNotif: NotifItem = {
        id: data.id || Date.now(),
        type: data.type || 'info',
        title: data.title,
        message: data.message,
        created_at: data.created_at || new Date().toISOString(),
        read: false,
        data: data.data || {} 
      };
      
      // Update state seketika
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => { 
      if (socketRef.current) {
        socketRef.current.disconnect(); 
      }
    };
  }, []);

  // === FUNGSI UTAMA: KLIK NOTIFIKASI ===
  const handleNotificationClick = async (notif: NotifItem) => {
    // A. Tandai sudah dibaca
    if (!notif.read) {
        setNotifications((prev) => 
          prev.map((n) => n.id === notif.id ? { ...n, read: true } : n)
        );
        try {
          // Sesuaikan endpoint API ini dengan rute backend Bagus
          await fetch(`${SOCKET_URL}/api/notifications/admin/${notif.id}/read`, { 
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.error("Gagal update status read:", error);
        }
    }

    // B. LOGIKA NAVIGASI
    if ((notif.type === 'transaction' || notif.type === 'chat') && notif.data?.transaction_id) {
      setIsOpen(false); 
      router.push(`/dashboard/transactions/${notif.data.transaction_id}`);
    } else if (notif.type === 'new_user') {
        setIsOpen(false);
        router.push(`/dashboard/users`); 
    }
  };

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    if (type === 'new_user') return <UserPlus size={18} />;
    if (type === 'transaction') return <CheckCheck size={18} />;
    if (type === 'chat') return <MessageSquare size={18} />;
    return <Info size={18} />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        // REVISI FINAL: 
        // 1. w-[300px] (lebih ramping untuk HP)
        // 2. right-[-15px] (digeser lebih ke kanan agar imbang di tengah layar)
        // 3. max-w-[calc(100vw-2rem)] (pengaman absolut: lebar maksimal adalah lebar layar dikurangi margin)
        <div className="absolute right-[-15px] sm:right-0 mt-2 w-[300px] sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          
          <div className="px-5 py-4 border-b bg-white flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800">Notifikasi</h3>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} Baru
                </span>
              )}
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={16} />
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-sm flex flex-col items-center gap-3">
                <Bell size={32} className="opacity-20" />
                <span>Belum ada notifikasi</span>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => handleNotificationClick(notif)} 
                  className={`
                    group p-4 border-b flex gap-4 cursor-pointer transition-all duration-200 relative
                    ${!notif.read 
                      ? 'bg-blue-50 hover:bg-blue-100'
                      : 'bg-white hover:bg-gray-50'
                    }
                  `}
                >
                  {!notif.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                  )}

                  <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                    !notif.read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <p className={`text-sm ${!notif.read ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                         <span className="h-2 w-2 rounded-full bg-blue-600 ml-2 mt-1.5 flex-shrink-0 animate-pulse" />
                      )}
                    </div>
                    
                    <p className={`text-xs leading-relaxed ${!notif.read ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                        {notif.message}
                    </p>
                    
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">
                      {notif.created_at 
                        ? format(new Date(notif.created_at), "dd MMM, HH:mm", { locale: idLocale }) 
                        : 'Baru saja'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}