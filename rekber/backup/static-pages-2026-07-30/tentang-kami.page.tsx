import type { Metadata } from 'next'
import { CheckCircle } from "lucide-react"
import NavBar from '../components/slicings/navbar';
import Footer from '../components/slicings/footer';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Tentang Kami - Rekber.com',
  description: 'Pelajari visi, misi, dan tim di balik layanan rekening bersama Rekber.com.',
  alternates: {
    canonical: '/tentang-kami',
  },
  openGraph: {
    title: 'Tentang Kami - Rekber.com',
    description: 'Pelajari visi, misi, dan tim di balik layanan rekening bersama Rekber.com.',
    url: 'https://www.rekber.com/tentang-kami',
    siteName: 'Rekber.com',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Tentang Kami - Rekber.com',
    description: 'Pelajari visi, misi, dan tim di balik layanan rekening bersama Rekber.com.',
  },
};

export default function AboutPage() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50">
    <NavBar />

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
            <span className="text-gray-900">Tentang</span>
            <br />
            <span className="text-blue-600">Rekber.com</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Platform rekening bersama terpercaya yang menghubungkan pembeli dan penjual dengan sistem pembayaran yang
            aman dan transparan
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Misi Kami</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Menciptakan ekosistem perdagangan online yang aman dan terpercaya di Indonesia. Kami berkomitmen untuk
              melindungi setiap transaksi dan memberikan ketenangan pikiran bagi pembeli dan penjual.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Keamanan Terjamin</h3>
                  <p className="text-gray-600">Sistem enkripsi tingkat bank untuk melindungi data dan transaksi</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Transparansi Penuh</h3>
                  <p className="text-gray-600">Proses yang jelas dan dapat dilacak di setiap tahap transaksi</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Dukungan 24/7</h3>
                  <p className="text-gray-600">Tim customer service siap membantu kapan saja</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
          <div className="w-full h-96  rounded-2xl flex items-center justify-center  ">
              <Image 
                src="/images/logo-apps.png"
                alt="Rekber.com Logo"
                width={228}
                height={228}
                className="opacity-80"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    <Footer/>
    </div>
  )
}