"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronDown, LogOut, Menu, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AdminNotification from "./adminnotification"

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  // State dari Senior: lebih rapi dan mencegah error hidrasi
  const [user, setUser] = useState({ name: "", email: "" })
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("token")
    localStorage.removeItem("name")
    localStorage.removeItem("email")
    localStorage.removeItem("userRole")
    router.push("/login")
  }

  useEffect(() => {
    // Pengambilan data localStorage dengan penanganan fallback yang solid
    const name = localStorage.getItem("name") || "Admin"
    const email = localStorage.getItem("email") || "admin@rekber.com"
    setUser({ name, email })
  }, [])

  return (
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border px-3 sm:px-6 h-14 sm:h-16 flex items-center">
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">

        {/* KIRI: hamburger (mobile) + logo (mobile) + pencarian */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="lg:hidden flex items-center shrink-0">
            <Image src="/images/logo-1.png" alt="Rekber.com" width={100} height={9} style={{ height: "auto" }} unoptimized />
          </div>

          <div className="relative w-full max-w-md flex-1 hidden sm:block">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari transaksi, pengguna, atau pembayaran..."
              className="pl-11 h-11 rounded-sm border-none bg-muted shadow-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:bg-card"
            />
          </div>
        </div>

        {/* BAGIAN KANAN */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">

          {/* KOMPONEN NOTIFIKASI ANDA (Ini yang menyelamatkan fitur real-time Anda) */}
          <AdminNotification />

          {/* PROFIL USER */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/30">
              <div className="h-9 w-9 bg-accent-soft rounded-full flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-accent">
                  {user.name ? user.name.charAt(0).toUpperCase() : "A"}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
              </div>
              <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-sm">
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive-soft cursor-pointer">
                <LogOut className="h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  )
}
