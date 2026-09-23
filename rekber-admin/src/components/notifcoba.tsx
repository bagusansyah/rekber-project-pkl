"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation"; // 1. Import Router untuk navigasi
import { Bell, UserPlus, X, Info, CheckCheck } from "lucide-react"; 
import { io } from "socket.io-client"; 
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const SOCKET_URL = "http://localhost:5000"; 

interface NotifItem {
  id: number;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  data?: any; // 2. Tambahkan field data untuk menyimpan transaction_id dll
}

export default function AdminNotification() {
  const router = useRouter(); // Init router
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
            data: item.data // 3. Ambil kolom 'data' JSON dari database
          }));
          setNotifications(history);
        }
      } catch (err) {
        console.error("Gagal ambil history:", err);
      }
    };

    fetchHistory();

    // 2. SOCKET REALTIME
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    
    socket.on("admin_notification", (data: any) => {
      const newNotif: NotifItem = {
        id: data.id || Date.now(),
        type: data.type || 'info',
        title: data.title,
        message: data.message,
        created_at: data.created_at || new Date().toISOString(),
        read: false,
        data: data.data || {} // Pastikan data socket juga tersimpan
      };
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => { socket.disconnect(); };
  }, []);

  // === FUNGSI UTAMA: KLIK NOTIFIKASI ===
  const handleNotificationClick = async (notif: NotifItem) => {
    // A. Tandai sudah dibaca (Logic sebelumnya)
    if (!notif.read) {
        setNotifications((prev) => 
          prev.map((n) => n.id === notif.id ? { ...n, read: true } : n)
        );
        try {
          await fetch(`${SOCKET_URL}/api/notifications/admin/${notif.id}/read`, { method: 'PUT' });
        } catch (error) {
          console.error("Gagal update status read:", error);
        }
    }

    // B. LOGIKA NAVIGASI (Sesuai Video)
    if (notif.type === 'transaction' && notif.data?.transaction_id) {
        setIsOpen(false); // Tutup dropdown
        // Arahkan ke URL detail transaksi (Sesuai format di video: /dashboard/transactions/[id])
        router.push(`/dashboard/transactions/${notif.data.transaction_id}`);
    } else if (notif.type === 'new_user') {
        setIsOpen(false);
        router.push(`/dashboard/users`); // Opsional: Arahkan ke list user
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
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          
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
                  onClick={() => handleNotificationClick(notif)} // 4. Panggil fungsi klik baru
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