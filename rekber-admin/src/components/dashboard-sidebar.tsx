"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, CreditCard, Users, Receipt, LogOut, X, ShieldCheck, ChevronDown, FileText, Tags, FileEdit } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pengguna", href: "/dashboard/users", icon: Users },
  { name: "Verifikasi KYC", href: "/dashboard/kyc", icon: ShieldCheck },
  { name: "Voucher", href: "/dashboard/vouchers", icon: Receipt },
  { name: "Blog", href: "/dashboard/blogs", icon: FileText },
  { name: "Kategori", href: "/dashboard/categories", icon: Tags },
  { name: "Halaman Konten", href: "/dashboard/content-pages", icon: FileEdit },
]

const navItemClass = (active: boolean) =>
  cn(
    "flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-colors duration-150 w-full",
    active
      ? "text-accent font-semibold"
      : "text-foreground/80 hover:text-accent",
  )

const subItemClass = (active: boolean) =>
  cn(
    "flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors duration-150 w-full",
    active ? "text-accent font-semibold" : "text-muted-foreground hover:text-accent",
  )

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Sidebar (white + blue): a fixed rail on desktop, an off-canvas drawer on mobile.
 */
export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps): JSX.Element {
  const [isTransactionsOpen, setIsTransactionsOpen] = useState<boolean>(false)
  const pathname = usePathname() || ''
  const router = useRouter()

  const isTransactionsActive = pathname.startsWith('/dashboard/transactions')

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("token")
    localStorage.removeItem("name")
    localStorage.removeItem("email")
    localStorage.removeItem("userRole")
    router.push("/login")
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-sidebar-border shrink-0">
          <Image src="/images/logo-1.png" alt="Rekber.com" width={140} height={13} style={{ height: "auto" }} unoptimized priority />
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <div key={item.name}>
                <Link href={item.href} onClick={onClose} className={navItemClass(isActive)}>
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>

                {item.name === "Pengguna" && (
                  <div className="mt-1 pl-8 space-y-0.5">
                    <Link
                      href="/dashboard/users"
                      onClick={onClose}
                      className={subItemClass(pathname === "/dashboard/users")}
                    >
                      All Users
                    </Link>
                    <Link
                      href="/dashboard/partnership"
                      onClick={onClose}
                      className={subItemClass(pathname === "/dashboard/partnership")}
                    >
                      Partnership Users
                    </Link>
                  </div>
                )}

                {item.name === "Dashboard" && (
                  <div className="mt-1">
                    <button
                      type="button"
                      onClick={() => setIsTransactionsOpen((s) => !s)}
                      className={navItemClass(isTransactionsActive)}
                    >
                      <CreditCard className="h-5 w-5 shrink-0" />
                      Transaksi
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 ml-auto transform transition-transform",
                          isTransactionsOpen ? "rotate-180" : "rotate-0",
                        )}
                      />
                    </button>

                    {isTransactionsOpen && (
                      <div className="mt-1 pl-8 space-y-0.5">
                        <Link
                          href="/dashboard/transactions"
                          onClick={onClose}
                          className={subItemClass(pathname === "/dashboard/transactions")}
                        >
                          List Transaksi
                        </Link>

                        <Link
                          href="/dashboard/transactions/unpaid"
                          onClick={onClose}
                          className={subItemClass(pathname === "/dashboard/transactions/unpaid")}
                        >
                          Belum Dicairkan
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-sidebar-border shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium w-full text-foreground/80 hover:bg-destructive-soft hover:text-destructive transition-colors duration-150"
          >
            <LogOut className="h-5 w-5" />
            Keluar
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      )}
    </>
  )
}
