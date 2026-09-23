// "use client";

// import { useState } from "react";
// import { Bell } from "lucide-react"; // Kita pakai icon bawaan biar ringan
// import { Button } from "@/components/ui/button"; // Pakai button dari UI kamu

// export default function NotificationBell() {
//   const [isOpen, setIsOpen] = useState(false);
  
//   // Data Dummy dulu
//   const notifications = [
//     { id: 1, title: "Member Baru", msg: "Bagusansyah daftar", time: "2m", read: false },
//     { id: 2, title: "Transaksi", msg: "TRX-999 butuh aksi", time: "1h", read: false },
//   ];

//   return (
//     <div className="relative">
//       <Button 
//         variant="ghost" 
//         size="icon" 
//         className="relative"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         <Bell className="h-5 w-5" />
//         {/* Badge Merah */}
//         <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600 border-2 border-white" />
//       </Button>

//       {/* Dropdown */}
//       {isOpen && (
//         <>
//           <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
//           <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 p-2">
//             <h3 className="font-semibold px-2 py-2 border-b">Notifikasi</h3>
//             <div className="flex flex-col gap-1 mt-2">
//               {notifications.map((n) => (
//                 <div key={n.id} className="p-2 hover:bg-slate-50 rounded cursor-pointer text-sm">
//                   <p className="font-medium">{n.title}</p>
//                   <p className="text-gray-500 text-xs">{n.msg}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }