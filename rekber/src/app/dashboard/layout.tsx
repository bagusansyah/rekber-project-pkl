import { AppSidebar } from '@/app/components/dashboard/app-sidebar'
import { DashboardHeader } from '@/app/components/dashboard/dashboard-header'
import { SidebarProvider } from '@/components/ui/sidebar'
import Footer from '@/app/components/slicings/footer'

// IMPORT BOTTOM NAV YANG BARU KITA BUAT
import BottomNav from '@/app/components/mobile/bottom-nav'

export const runtime = "edge";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SidebarProvider>
        <div className='flex min-h-screen w-full bg-gray-50 relative'>

          {/* SIDEBAR DESKTOP 
              (Komponen ini biasanya sudah responsif otomatis dari shadcn, 
              tapi kita pastikan ia bekerja harmoni dengan layout kita) 
          */}
          <div className="hidden md:block">
            <AppSidebar />
          </div>

          <div className='flex-1 flex flex-col min-w-0'>
            {/* HEADER */}
            {/* <div className="hidden md:block"> */}
            <DashboardHeader />
            {/* </div> */}

            {/* KONTEN UTAMA 
                Perhatikan perubahan pada className di bawah ini.
                'pb-28' ditambahkan khusus mobile agar list transaksi/chat 
                paling bawah tidak tertindih oleh Bottom Nav.
                Di layar menengah ke atas (md:pb-3), padding kembali normal.
            */}
            <main className="p-3 pb-28 md:pb-3 flex-1 overflow-y-auto">
              {children}
            </main>
          </div>

          {/* BOTTOM NAVIGATION (HANYA MOBILE)
              'md:hidden' memastikan navigasi ini lenyap saat dibuka di laptop
          */}
          <div className="md:hidden block">
            <BottomNav />
          </div>

        </div>
      </SidebarProvider>

      {/* FOOTER
          'hidden md:block' ditambahkan karena dashboard mobile ("Web Rasa Aplikasi") 
          tidak boleh memiliki footer web raksasa di bagian bawahnya.
      */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  )
}

