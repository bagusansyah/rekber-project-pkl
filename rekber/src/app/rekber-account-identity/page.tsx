import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Users, CreditCard, CheckCircle, ArrowRight, Lock, Zap, Globe, HelpCircle } from "lucide-react"
import NavBar from '@/app/components/slicings/navbar';
import Footer from '@/app/components/slicings/footer';
import Link from 'next/link';
export const metadata: Metadata = {
  title: 'Rekber Account Identity (RAI) - Rekber.com',
  description: 'Rekber Account Identity (RAI) adalah sistem identitas digital yang aman dan terpercaya untuk melakukan transaksi rekening bersama di platform Rekber.com.',
};
export default function RAIInfoPage() {
     return (
       <>
         {' '}
    <NavBar />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Rekber Account Identity
              <span className="text-blue-600"> (RAI)</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sistem identitas digital yang aman dan terpercaya untuk melakukan transaksi rekening bersama di platform
              Rekber.com
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Shield className="h-4 w-4 mr-2" />
              100% Aman
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Zap className="h-4 w-4 mr-2" />
              Instan
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Globe className="h-4 w-4 mr-2" />
              Terpercaya
            </Badge>
          </div>
        </div>

        {/* RAI Card Example */}
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Contoh RAI Card</h2>
          <Card className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white transform hover:scale-105 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">REKBER ACCOUNT IDENTITY</CardTitle>
                  <CardDescription className="text-blue-100">Digital Transaction ID</CardDescription>
                </div>
                <Shield className="h-8 w-8 text-white/80" />
              </div>
            </CardHeader>

            <CardContent className="relative z-10 space-y-4">
              <div>
                <p className="text-blue-100 text-sm">RAI Number</p>
                <p className="text-2xl font-mono font-bold">RAI-2024-001234</p>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-blue-100 text-sm">Pemegang</p>
                  <p className="font-semibold">M. Haddit Azhizi</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Status</p>
                  <Badge variant="secondary" className="bg-green-500 text-white border-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* What is RAI */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Apa itu RAI?</h2>
            <div className="space-y-4 text-gray-600">
              <p className="text-lg">
                <strong className="text-gray-900">Rekber Account Identity (RAI)</strong> adalah sistem identitas digital
                unik yang diberikan kepada setiap pengguna Rekber.com untuk melakukan transaksi dengan aman.
              </p>
              <p>
                RAI berfungsi sebagai kartu identitas digital yang memungkinkan Anda melakukan transaksi rekening
                bersama tanpa perlu membagikan informasi pribadi yang sensitif kepada lawan transaksi.
              </p>
              <p>
                Setiap RAI memiliki nomor unik yang terhubung dengan profil terverifikasi Anda, memberikan jaminan
                keamanan dan kepercayaan dalam setiap transaksi.
              </p>
            </div>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Identitas Terverifikasi</h3>
                  <p className="text-sm text-gray-600">Data diri telah diverifikasi oleh sistem</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Lock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Keamanan Terjamin</h3>
                  <p className="text-sm text-gray-600">Enkripsi tingkat tinggi melindungi data</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Transaksi Mudah</h3>
                  <p className="text-sm text-gray-600">Cukup gunakan nomor RAI untuk bertransaksi</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* How RAI Works */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">Cara Kerja RAI</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Daftar & Verifikasi</h3>
              <p className="text-gray-600">
                Daftarkan akun Anda dan lakukan verifikasi identitas untuk mendapatkan RAI number yang unik
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Bagikan RAI</h3>
              <p className="text-gray-600">
                Bagikan nomor RAI Anda kepada lawan transaksi tanpa perlu memberikan data pribadi
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Transaksi Aman</h3>
              <p className="text-gray-600">
                Lakukan transaksi dengan sistem escrow yang aman menggunakan identitas RAI Anda
              </p>
            </Card>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Keuntungan Menggunakan RAI</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">Privasi Terlindungi</h3>
                  <p className="text-gray-600">Tidak perlu membagikan nomor rekening atau data pribadi sensitif</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">Verifikasi Otomatis</h3>
                  <p className="text-gray-600">Lawan transaksi dapat memverifikasi identitas Anda secara otomatis</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">Riwayat Transparan</h3>
                  <p className="text-gray-600">Semua transaksi tercatat dengan jelas dan dapat dilacak</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">Escrow Protection</h3>
                  <p className="text-gray-600">Dana dijamin aman dengan sistem escrow otomatis</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">Multi Platform</h3>
                  <p className="text-gray-600">Dapat digunakan di berbagai platform dan marketplace</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">Support 24/7</h3>
                  <p className="text-gray-600">Tim support siap membantu kapan saja jika ada masalah</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">Pertanyaan Umum</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Apakah RAI gratis?</h3>
                  <p className="text-gray-600 text-sm">
                    Ya, pendaftaran dan pembuatan RAI sepenuhnya gratis. Anda hanya perlu melakukan verifikasi
                    identitas.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Berapa lama proses verifikasi?</h3>
                  <p className="text-gray-600 text-sm">
                    Proses verifikasi biasanya memakan waktu 1-3 hari kerja setelah dokumen lengkap diunggah.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Apakah RAI bisa digunakan di platform lain?</h3>
                  <p className="text-gray-600 text-sm">
                    Saat ini RAI hanya berlaku di ekosistem Rekber.com, namun kami berencana ekspansi ke platform lain.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Bagaimana jika RAI hilang atau lupa?</h3>
                  <p className="text-gray-600 text-sm">
                    Anda dapat mengakses RAI kapan saja melalui dashboard akun atau menghubungi customer service.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold">Siap Memulai Transaksi Aman?</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Dapatkan RAI Anda sekarang dan nikmati transaksi yang lebih aman dan terpercaya
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Daftar Sekarang
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/tentang-kami">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                Pelajari Lebih Lanjut
              </Button>
            </Link>
          </div>
        </div>
      </div> 

    <Footer />
    </>
  );
}
