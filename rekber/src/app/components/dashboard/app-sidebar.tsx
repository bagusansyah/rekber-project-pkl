"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CreditCard, User, LinkIcon, ShieldCheck, ShieldAlert, Store } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useKycStatus } from "@/hooks/useKycStatus"

const menuItems = [
  {
    title: "Transaction",
    url: "/dashboard/transactions",
    icon: CreditCard,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Verifikasi KYC",
    url: "/dashboard/verifikasi",
    icon: ShieldCheck,
  },
  {
    title: "Payment Link",
    url: "/dashboard/salinrekber",
    icon: LinkIcon,
    external: false,
    requiresKyc: true,
  },
  {
    title: "Link Produk",
    url: "/dashboard/product-links",
    icon: Store,
    external: false,
    requiresKyc: true,
  },
]


export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useIsMobile()
  const { setOpenMobile } = useSidebar()
  const { status: kycStatus, isLoading: kycLoading } = useKycStatus()
  const [kycBlockedFeature, setKycBlockedFeature] = useState<string | null>(null)

  // Fitur seperti Payment Link dan Link Produk butuh identitas terverifikasi
  // (lihat useRequireKycVerified) — cegah navigasi dan tampilkan modal
  // peringatan (blocking, wajib ditutup lewat tombol) di sini dulu, supaya
  // user tidak perlu "nyasar" ke halaman tujuan baru kemudian di-redirect
  // balik ke halaman verifikasi.
  const handleMenuClick = (item: (typeof menuItems)[number], e: React.MouseEvent) => {
    if (item.requiresKyc && !kycLoading && kycStatus !== "approved") {
      e.preventDefault()
      if (isMobile) setOpenMobile(false)
      setKycBlockedFeature(item.title)
      return
    }

    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const goToVerification = () => {
    setKycBlockedFeature(null)
    router.push("/dashboard/verifikasi?required=payment-link")
  }

  return (
    <>
      <Sidebar className="w-64 bg-white min-h-screen border-r border-gray-200 flex flex-col">
      <SidebarHeader className="border-b border-gray-200 p-6">
        <div className="flex">
          <Link href="/">
            <Image src="/images/logo.png" alt="Logo" width={180} height={0} style={{ height: "auto" }} unoptimized/>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col flex-1">
        <nav className="mt-4 flex-1">
          <div className="px-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.url
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  onClick={(e) => handleMenuClick(item, e)}
                  {...(item.external && { target: "_blank", rel: "noopener noreferrer" })}
                  className={`flex items-center px-4 py-2 rounded-lg
                    ${isActive ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                  <span className="text-base">{item.title}</span>
                  {item.external && <span className="ml-auto text-xs text-gray-400">↗</span>}
                </Link>
              )
            })}
          </div>
        </nav>
        
        {/* Help section at bottom */}
        <div className="px-4 pb-4 border-t border-gray-200 pt-4"> 
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Butuh Bantuan?</h3>
              <p className="text-gray-600 text-sm mb-2">Tim support kami siap membantu Anda</p>
              <Link 
                href="https://wa.me/6282315555551?text=Halo%20Admin%20Rekber.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full h-10 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                onClick={() => isMobile && setOpenMobile(false)}
              >
                Chat WhatsApp
              </Link>
        </div>
      </SidebarContent>
    </Sidebar>

      {/* Dirender di luar <Sidebar> (bukan sebagai anak) karena di mobile,
          Sidebar membungkus children-nya dalam Radix Sheet yang unmount
          total begitu ditutup — kalau Dialog ini ikut jadi anaknya, modal
          KYC ikut hilang saat sidebar/menu slide-out ditutup. */}
      <Dialog open={kycBlockedFeature !== null}>
        <DialogContent
          showCloseButton={false}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <ShieldAlert className="h-6 w-6 text-amber-600" />
            </div>
            <DialogTitle className="text-center">Verifikasi KYC Diperlukan</DialogTitle>
            <DialogDescription className="text-center">
              Selesaikan verifikasi identitas (KYC) terlebih dahulu untuk menggunakan fitur{" "}
              <span className="font-medium text-gray-900">{kycBlockedFeature}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setKycBlockedFeature(null)}
              className="sm:flex-1"
            >
              Nanti Saja
            </Button>
            <Button onClick={goToVerification} className="sm:flex-1">
              Verifikasi Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}