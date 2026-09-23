 
import type { Metadata } from 'next'
import { ShieldCheck, FileText, Mail, Clock, Ban } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card" 
import Link from 'next/link'
import NavBar from '@/app/components/slicings/navbar';
import Footer from '@/app/components/slicings/footer';
export const metadata: Metadata = {
  title: 'Kebijakan Refund - Rekber.com',
  description: 'Ketentuan dan syarat refund di layanan Rekber.com.',
  alternates: {
    canonical: '/kebijakan-refund',
  },
  openGraph: {
    title: 'Kebijakan Refund - Rekber.com',
    description: 'Ketentuan dan syarat refund di layanan Rekber.com.',
    url: 'https://www.rekber.com/kebijakan-refund',
    siteName: 'Rekber.com',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Kebijakan Refund - Rekber.com',
    description: 'Ketentuan dan syarat refund di layanan Rekber.com.',
  },
};
export default function PrivacyPolicy() {
   
    return (
      <>
        {' '}
              <NavBar />
    <div className="min-h-screen bg-gray-50">   

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Kebijakan Refund</h1>
            <p className="text-gray-600 mb-6">
                Rekber.com berkomitmen untuk memastikan kepuasan Anda dengan layanan kami. Kebijakan pengembalian dana ini
                menjelaskan syarat dan ketentuan untuk pengembalian dana.
            </p>
            <p className="text-sm text-gray-500 mb-8">Terakhir diperbarui: 26 Juli 2025</p>
           
          <div className="space-y-8">
            {/* Section 1: Kelayakan Pengembalian Dana */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <FileText className="w-6 h-6 text-blue-600 mr-2" />
                Kelayakan Pengembalian Dana
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Pengembalian dana hanya berlaku untuk transaksi yang memenuhi kriteria tertentu.</li>
                <li>Permintaan pengembalian dana harus diajukan dalam waktu 7 hari setelah transaksi.</li>
                <li>Layanan atau produk yang dikembalikan harus dalam kondisi asli dan belum digunakan.</li>
                <li>Bukti pembelian atau nomor transaksi diperlukan untuk semua permintaan pengembalian dana.</li>
              </ul>
            </div>

            {/* Section 2: Proses Pengajuan Pengembalian Dana */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <Mail className="w-6 h-6 text-blue-600 mr-2" />
                Proses Pengajuan Pengembalian Dana
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  Untuk mengajukan pengembalian dana, silakan hubungi tim dukungan pelanggan kami melalui email atau
                  formulir kontak.
                </li>
                <li>Sertakan detail transaksi Anda dan alasan permintaan pengembalian dana secara jelas.</li>
                <li>Tim kami akan meninjau permintaan Anda dan memberikan tanggapan dalam waktu 3-5 hari kerja.</li>
              </ul>
            </div>

            {/* Section 3: Jangka Waktu Pengembalian Dana */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <Clock className="w-6 h-6 text-blue-600 mr-2" />
                Jangka Waktu Pengembalian Dana
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Setelah permintaan pengembalian dana disetujui, dana akan diproses dalam waktu 5-10 hari kerja.</li>
                <li>
                  Waktu yang dibutuhkan dana untuk masuk ke rekening Anda dapat bervariasi tergantung pada metode
                  pembayaran dan kebijakan bank Anda.
                </li>
              </ul>
            </div>

            {/* Section 4: Pengecualian */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <Ban className="w-6 h-6 text-blue-600 mr-2" />
                Pengecualian
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  Pengembalian dana tidak akan diberikan untuk layanan yang telah digunakan sepenuhnya atau produk
                  digital yang telah diunduh.
                </li>
                <li>Biaya transaksi atau biaya layanan tertentu mungkin tidak dapat dikembalikan.</li>
                <li>Rekber.com berhak menolak permintaan pengembalian dana yang tidak memenuhi syarat.</li>
                <li>Jika transaksi batal, biaya (fee) tidak dapat dikembalikan.</li>
                <li>
                  Selama transaksi sedang berlangsung, tidak dapat mengajukan pengembalian dana secara sepihak, kecuali
                  ada perjanjian kedua belah pihak.
                </li>
              </ul>
            </div>
          </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
          <Card className="bg-blue-600 text-white p-6 shadow-md rounded-lg text-center">
            <ShieldCheck className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Transaksi Aman</h3>
            <p className="text-blue-100 text-sm">
              Setiap transaksi Anda dilindungi dengan sistem keamanan terenkripsi dan standar internasional.
            </p>
          </Card>


            <Card className="mt-5"> 
                <CardContent >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Butuh Bantuan?</h3>
                  <p className="text-gray-600 text-sm mb-4">Tim support kami siap membantu Anda 24/7</p>
                  <Link 
                      href="https://wa.me/6282315555551?text=Halo%20Admin%20Rekber.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full h-10 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                    >
                      Chat WhatsApp
                    </Link>
                </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
