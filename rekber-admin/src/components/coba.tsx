// src/components/adminnotification.tsx
"use client";

import { useEffect, useState, useRef } from "react";
// Tambahkan icon 'CheckCheck' untuk variasi icon
import { Bell, UserPlus, X, Info, CheckCheck } from "lucide-react"; 
import { io } from "socket.io-client"; 
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL;

interface NotifItem {
  id: number;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export default function AdminNotification() {
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hitung jumlah yang belum dibaca untuk Badge Angka
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    // 1. AMBIL HISTORY DARI DATABASE
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
            read: item.is_read
          }));
          setNotifications(history);
        }
      } catch (err) {
        console.error("Gagal ambil history:", err);
      }
    };

    fetchHistory();

    // 2. KONEKSI SOCKET
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    
    socket.on("admin_notification", (data: any) => {
      const newNotif: NotifItem = {
        id: data.id || Date.now(),
        type: data.type || 'info',
        title: data.title,
        message: data.message,
        created_at: data.created_at || new Date().toISOString(),
        read: false // Notifikasi baru pasti belum dibaca (BIRU)
      };
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => { socket.disconnect(); };
  }, []);

  // === FITUR BARU: TANDAI SUDAH DIBACA SAAT DIKLIK ===
  const handleMarkAsRead = async (id: number, currentStatus: boolean) => {
    // Jika sudah dibaca, hentikan agar tidak perlu request API lagi
    if (currentStatus) return;

    // 1. Optimistic Update (Ubah tampilan dulu biar cepat)
    setNotifications((prev) => 
      prev.map((n) => n.id === id ? { ...n, read: true } : n)
    );

    // 2. Request ke Backend untuk simpan perubahan ke DB
    try {
      await fetch(`${SOCKET_URL}/api/notifications/admin/${id}/read`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error("Gagal update status read:", error);
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

  // Helper Icon
  const getIcon = (type: string) => {
    if (type === 'new_user') return <UserPlus size={18} />;
    if (type === 'transaction') return <CheckCheck size={18} />;
    return <Info size={18} />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* TOMBOL LONCENG */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        
        {/* === UBAHAN 1: Badge Angka === */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          
          {/* Header Dropdown */}
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

          {/* List Notifikasi */}
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
                  onClick={() => handleMarkAsRead(notif.id, notif.read)}
                  className={`
                    group p-4 border-b flex gap-4 cursor-pointer transition-all duration-200 relative
                    ${!notif.read 
                      ? 'bg-blue-50 hover:bg-blue-100' // === UBAHAN 2: Background Biru jika belum dibaca ===
                      : 'bg-white hover:bg-gray-50'    // Background Putih jika sudah
                    }
                  `}
                >
                  {/* === UBAHAN 3: Garis Biru Vertikal di Kiri (Style WhatsApp) === */}
                  {!notif.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                  )}

                  {/* Icon */}
                  <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                    !notif.read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {getIcon(notif.type)}
                  </div>

                  {/* Konten */}
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      {/* Judul Tebal jika belum dibaca */}
                      <p className={`text-sm ${!notif.read ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                        {notif.title}
                      </p>
                      
                      {/* Titik Biru Kecil di kanan judul */}
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
// // src/components/adminnotification.tsx
// "use client";

// import { useEffect, useState, useRef } from "react";
// import { Bell, UserPlus, X, Info } from "lucide-react"; 
// import { io } from "socket.io-client"; 
// import { format } from "date-fns";
// import { id as idLocale } from "date-fns/locale";

// const SOCKET_URL = "http://localhost:5000"; // Pastikan port sama dengan backend

// // Definisikan tipe data agar TypeScript tidak komplain
// interface NotifItem {
//   id: number;
//   type: string;
//   title: string;
//   message: string;
//   created_at: string;
//   read: boolean;
// }

// export default function AdminNotification() {
//   const [notifications, setNotifications] = useState<NotifItem[]>([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [hasUnread, setHasUnread] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   // Hitung jumlah notifikasi yang belum dibaca
//   const unreadCount = notifications.filter((n) => !n.read).length;

//   useEffect(() => {
//     // 1. AMBIL HISTORY DARI DATABASE (Via API Admin Baru)
//     const fetchHistory = async () => {
//       try {
//         // Panggil endpoint khusus admin yang baru dibuat
//         const res = await fetch(`${SOCKET_URL}/api/notifications/admin`);
//         const data = await res.json();

//         if (Array.isArray(data)) {
//           // Mapping data dari format Database (snake_case) ke Frontend
//           const history = data.map((item: any) => ({
//             id: item.id,
//             title: item.title,
//             message: item.message,
//             type: item.type,
//             created_at: item.created_at,
//             read: item.is_read // Database: is_read -> Frontend: read
//           }));

//           setNotifications(history);

//           // Cek apakah ada yang belum dibaca dari history
//           if (history.some((n) => !n.read)) {
//             setHasUnread(true);
//           }
//         }
//       } catch (err) {
//         console.error("Gagal mengambil history notifikasi:", err);
//       }
//     };

//     fetchHistory();

//     // 2. KONEKSI SOCKET (Untuk Notifikasi Realtime Baru)
//     const socket = io(SOCKET_URL, { transports: ["websocket"] });

//     socket.on("connect", () => console.log("✅ Admin Socket Terhubung!"));
    
//     socket.on("admin_notification", (data: any) => {
//       console.log("📩 Notifikasi Realtime Masuk:", data);
      
//       // Tambahkan notifikasi baru ke paling ATAS list
//       const newNotif: NotifItem = {
//         id: data.id || Date.now(), // Gunakan ID dari socket atau generate baru
//         type: data.type || 'info',
//         title: data.title,
//         message: data.message,
//         created_at: data.created_at || new Date().toISOString(),
//         read: false
//       };

//       setNotifications((prev) => [newNotif, ...prev]);
//       setHasUnread(true); // Nyalakan titik merah
//     });

//     return () => { socket.disconnect(); };
//   }, []);

//   // Logic: Tutup dropdown jika klik di luar
//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Helper untuk memilih icon berdasarkan tipe notifikasi
//   const getIcon = (type: string) => {
//     if (type === 'new_user') return <UserPlus size={16} />;
//     return <Info size={16} />; // Icon default
//   };

//   return (
//     <div className="relative" ref={dropdownRef}>
//       {/* TOMBOL LONCENG */}
//       <button 
//         onClick={() => { setIsOpen(!isOpen); if (!isOpen) setHasUnread(false); }}
//         className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
//       >
//         <Bell className="h-6 w-6 text-gray-600" />
//         {/* Titik Merah */}
//         {hasUnread && (
//           <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white animate-pulse" />
//         )}
//       </button>

//       {/* DROPDOWN MENU */}
//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
//           {/* Header Dropdown */}
//           <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
//             <h3 className="font-semibold text-sm text-gray-800">Notifikasi</h3>
//             <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
//                 <X size={14} />
//             </button>
//           </div>

//           {/* List Notifikasi */}
//           <div className="max-h-[350px] overflow-y-auto bg-white">
//             {notifications.length === 0 ? (
//               <div className="p-8 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
//                 <Bell size={24} className="opacity-20" />
//                 <span>Belum ada aktivitas baru</span>
//               </div>
//             ) : (
//               notifications.map((notif) => (
//                 <div 
//                   key={notif.id} 
//                   className={`p-4 border-b hover:bg-gray-50 flex gap-3 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/50' : ''}`}
//                 >
//                   {/* Icon Dinamis */}
//                   <div className={`p-2 rounded-full h-fit flex-shrink-0 ${
//                     notif.type === 'new_user' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
//                   }`}>
//                     {getIcon(notif.type)}
//                   </div>

//                   {/* Konten Teks */}
//                   <div className="flex-1 space-y-1">
//                     <p className="text-sm font-semibold text-gray-800 leading-none">
//                         {notif.title}
//                     </p>
//                     <p className="text-xs text-gray-600 leading-relaxed">
//                         {notif.message}
//                     </p>
//                     <p className="text-[10px] text-gray-400 mt-1">
//                       {notif.created_at 
//                         ? format(new Date(notif.created_at), "dd MMM HH:mm", { locale: idLocale }) 
//                         : 'Baru saja'}
//                     </p>
//                   </div>
                  
//                   {/* Indikator Belum Dibaca (Titik Biru di list) */}
//                   {!notif.read && (
//                     <div className="h-2 w-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
