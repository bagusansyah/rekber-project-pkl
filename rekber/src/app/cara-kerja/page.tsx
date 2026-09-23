 
import type { Metadata } from 'next'
import Link from 'next/link'
import { Card } from "@/components/ui/card"
import { Shield, Users, CreditCard, CheckCircle, Clock, MessageCircle, ArrowRight } from "lucide-react"
import NavBar from '@/app/components/slicings/navbar';
import Footer from '@/app/components/slicings/footer';

export const metadata: Metadata = {
  title: 'Cara Kerja - Rekber.com',
  description: 'Cara kerja Rekber.com untuk transaksi aman dan terpercaya.',
  alternates: {
    canonical: '/cara-kerja',
  },
  openGraph: {
    title: 'Cara Kerja - Rekber.com',
    description: 'Cara kerja Rekber.com untuk transaksi aman dan terpercaya.',
    url: 'https://www.rekber.com/cara-kerja',
    siteName: 'Rekber.com',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Cara Kerja - Rekber.com',
    description: 'Cara kerja Rekber.com untuk transaksi aman dan terpercaya.',
  },
};
export default function CaraKerja() {
     return (
         <>
           {' '}
      <NavBar />
    <div className="min-h-screen bg-white"> 
 
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Cara Kerja Rekber.com</h1>
            <p className="text-xl text-gray-600 mb-8">
              Sistem escrow yang aman dan terpercaya untuk melindungi transaksi jual beli online Anda
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>100% Aman</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Proses Cepat</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-purple-500" />
                <span>Support 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Langkah-Langkah Transaksi</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Proses transaksi yang mudah dan aman dalam 6 langkah sederhana
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center mb-12">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Pembeli dan Penjual Setuju</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Pembeli dan penjual menyepakati detail transaksi termasuk harga, spesifikasi barang, dan metode
                  pengiriman.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Diskusi detail produk</li>
                  <li>• Kesepakatan harga final</li>
                  <li>• Metode pengiriman</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <Card className="p-6 bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-center">
                    <Users className="w-16 h-16 text-blue-600" />
                  </div>
                </Card>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center mb-12">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pl-8">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Pembeli Membayar ke Rekber</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Pembeli melakukan pembayaran ke rekening Rekber.com, bukan langsung ke penjual.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Transfer ke rekening Rekber</li>
                  <li>• Upload bukti pembayaran</li>
                  <li>• Konfirmasi otomatis</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <Card className="p-6 bg-green-50 border-green-200">
                  <div className="flex items-center justify-center">
                    <CreditCard className="w-16 h-16 text-green-600" />
                  </div>
                </Card>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center mb-12">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Penjual Mengirim Barang</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Setelah pembayaran dikonfirmasi, penjual mengirim barang ke alamat pembeli.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Notifikasi pembayaran diterima</li>
                  <li>• Penjual kirim barang</li>
                  <li>• Nomor resi diberikan</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <Card className="p-6 bg-purple-50 border-purple-200">
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-16 h-16 text-purple-600" />
                  </div>
                </Card>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row-reverse items-center mb-12">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pl-8">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    4
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Pembeli Menerima Barang</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Pembeli menerima dan memeriksa barang sesuai dengan kesepakatan awal.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Cek kondisi barang</li>
                  <li>• Verifikasi spesifikasi</li>
                  <li>• Periode inspeksi 1x24 jam</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <Card className="p-6 bg-orange-50 border-orange-200">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-16 h-16 text-orange-600" />
                  </div>
                </Card>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col md:flex-row items-center mb-12">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    5
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Konfirmasi Penerimaan</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Pembeli mengkonfirmasi bahwa barang telah diterima dengan baik dan sesuai kesepakatan.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Login ke akun Rekber</li>
                  <li>• Klik konfirmasi penerimaan</li>
                  <li>• Berikan rating & review</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <Card className="p-6 bg-teal-50 border-teal-200">
                  <div className="flex items-center justify-center">
                    <Shield className="w-16 h-16 text-teal-600" />
                  </div>
                </Card>
              </div>
            </div>

            {/* Step 6 */}
            <div className="flex flex-col md:flex-row-reverse items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pl-8">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    6
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Dana Diteruskan ke Penjual</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Setelah konfirmasi, Rekber.com meneruskan pembayaran ke rekening penjual.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Transfer otomatis ke penjual</li>
                  <li>• Notifikasi pembayaran</li>
                  <li>• Transaksi selesai</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <Card className="p-6 bg-green-50 border-green-200">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 text-center">
        <p className="text-gray-600">
          Ingin penjelasan lengkap soal jasa rekber, mulai dari biaya sampai keamanannya?{' '}
          <Link href="/jasa-rekber" className="text-blue-600 font-medium hover:underline">
            Baca panduan lengkap Jasa Rekber
          </Link>
          .
        </p>
      </section>
    </div>
    <Footer />
    </>
  );
}
