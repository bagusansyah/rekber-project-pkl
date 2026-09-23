"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, 
  FileText,
  MessageCircle,
  Plus,
  User,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = "pembeli" | "penjual";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

// ─── Nav Config ──────────────────────────────────────────────────────────────

// Formasi Kiri: Beranda & Transaksi
const LEFT_NAV_ITEMS: NavItem[] = [
  { href: "/", icon: Home, label: "Beranda" },
  { href: "/dashboard/transactions", icon: FileText, label: "Transaksi" },
];

// Formasi Kanan: Chat & Akun
const RIGHT_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/chat", icon: MessageCircle, label: "Chat" },
  { href: "/dashboard/profile", icon: User, label: "Akun" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavLink({ href, icon: Icon, label, isActive }: NavItem & { isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
        isActive ? "text-blue-600" : "text-gray-400 hover:text-blue-600"
      }`}
    >
      <Icon className={`w-6 h-6 mb-1 ${isActive ? "fill-blue-50/50" : ""}`} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const runtime = "edge";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. INJEKSI STATE KONTROL AUTENTIKASI
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 2. LIFECYCLE GUARD: Berjalan hanya di sisi client (Aman dari Hydration Error)
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // Bernilai true jika token ada, false jika null/kosong
    setIsMounted(true);
  }, [pathname]); // Evaluasi ulang setiap kali rute halaman berubah

  // 3. INTERCEPTOR GUARD
  // Jangan render apa pun (batalkan rendering) jika komponen belum siap atau user belum login
  if (!isMounted || !isLoggedIn) {
    return null;
  }

  // KOREKSI LOGIKA AKTIF: Penyesuaian untuk rute '/' (Beranda Awal)
  const isActive = (path: string) => {
    // Jika path adalah root ('/'), wajib exact match agar tidak bentrok dengan path lain
    if (path === "/") {
      return pathname === "/";
    }
    // Untuk path lain seperti /dashboard/transactions, gunakan startsWith
    return pathname?.startsWith(path) ?? false;
  };

  const handleCreateTransaction = (role: Role) => {
    setIsModalOpen(false);
    router.push(`/formrekber?role=${role}`);
  };

  return (
    <>
      {/* ── Bottom Navigation Bar ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] rounded-t-2xl z-40">
        
        <div className="grid grid-cols-5 h-20 items-center">

          {/* Slot 1 & 2: Beranda & Transaksi */}
          {LEFT_NAV_ITEMS.map((item) => (
            <NavLink key={item.href} {...item} isActive={isActive(item.href)} />
          ))}

          {/* Slot 3: Center Create Button (floating) */}
          <div className="relative flex justify-center h-full">
            {/* Tombol ditarik ke atas menggunakan absolute */}
            <div className="absolute -top-6 flex flex-col items-center">
              <button
                // onClick={() => setIsModalOpen(true)}
                onClick={() => router.push('/formrekber')}
                className="flex flex-col items-center focus:outline-none"
                aria-label="Buat transaksi baru"
              >
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 text-white hover:scale-105 transition-transform border-[3px] border-white">
                  <Plus
                    className={`w-7 h-7 transition-transform duration-300 ${
                      isModalOpen ? "rotate-45" : ""
                    }`}
                    strokeWidth={3}
                  />
                </div>
                <span className="text-[10px] font-bold text-blue-600 mt-2">Buat</span>
              </button>
            </div>
          </div>

          {/* Slot 4 & 5: Chat & Akun */}
          {RIGHT_NAV_ITEMS.map((item) => (
            <NavLink key={item.href} {...item} isActive={isActive(item.href)} />
          ))}

        </div>
      </div>

      {/* ── Role Selection Modal ── */}
      {/* {isModalOpen && ( */}
      {false && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />

          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 pb-28 sm:pb-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 id="modal-title" className="text-xl font-bold text-gray-900">
                Pilih Peran Anda
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role Options */}
            <div className="grid grid-cols-2 gap-4">

              {/* Pembeli */}
              <button
                onClick={() => handleCreateTransaction("pembeli")}
                className="flex flex-col items-center p-6 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <ShoppingBag className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <span className="font-bold text-gray-900">Pembeli</span>
                <span className="text-xs text-gray-500 text-center mt-2">
                  Saya ingin membeli barang/jasa
                </span>
              </button>

              {/* Penjual */}
              <button
                onClick={() => handleCreateTransaction("penjual")}
                className="flex flex-col items-center p-6 border-2 border-gray-100 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                  <Store className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <span className="font-bold text-gray-900">Penjual</span>
                <span className="text-xs text-gray-500 text-center mt-2">
                  Saya ingin menjual barang/jasa
                </span>
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}