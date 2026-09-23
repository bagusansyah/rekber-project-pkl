import type { Metadata } from 'next'
import Link from 'next/link'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Link2, Store, Share2, CreditCard, Repeat, Sparkles,
  ArrowRight, CheckCircle, ShieldCheck,
} from "lucide-react"
import NavBar from '@/app/components/slicings/navbar';
import Footer from '@/app/components/slicings/footer';

export const metadata: Metadata = {
  title: 'Payment Link & Link Produk - Rekber.com',
  description: 'Terima pembayaran dengan aman lewat Payment Link sekali pakai atau Link Produk permanen dari Rekber.com, tanpa perlu kode/developer.',
  alternates: {
    canonical: '/payment-link',
  },
  openGraph: {
    title: 'Payment Link & Link Produk - Rekber.com',
    description: 'Terima pembayaran dengan aman lewat Payment Link sekali pakai atau Link Produk permanen dari Rekber.com, tanpa perlu kode/developer.',
    url: 'https://www.rekber.com/payment-link',
    siteName: 'Rekber.com',
    type: 'website',
  },
};

const paymentLinkSteps = [
  { icon: Sparkles, title: 'Buat Payment Link', desc: 'Isi nama barang/jasa, harga, dan foto produk di dashboard.' },
  { icon: Share2, title: 'Bagikan ke Pembeli', desc: 'Kirim link lewat chat, email, atau media sosial ke satu pembeli.' },
  { icon: CreditCard, title: 'Pembeli Bayar', desc: 'Pembeli buka link, isi data, lalu bayar — tanpa perlu akun.' },
];

const productLinkSteps = [
  { icon: Store, title: 'Buat Link Produk Sekali', desc: 'Isi detail satu produk, dapatkan satu link permanen untuknya.' },
  { icon: Link2, title: 'Pasang di Website/Sosmed', desc: 'Tempel link (atau QR code-nya) di halaman produk, bio Instagram, atau WhatsApp.' },
  { icon: Repeat, title: 'Setiap Klik = Transaksi Baru', desc: 'Link yang sama bisa dipakai berkali-kali oleh pembeli berbeda-beda.' },
];

function StepCard({ icon: Icon, title, desc, step }: { icon: React.ElementType; title: string; desc: string; step: number }) {
  return (
    <Card className="p-6 rounded-3xl border-slate-100 shadow-none h-full">
      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold mb-4">
        {step}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-slate-800">{title}</h3>
      </div>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </Card>
  );
}

export default function PaymentLinkInfoPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Terima Pembayaran Aman, Tanpa Kode
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Rekber.com punya dua cara mudah untuk mulai menerima pembayaran yang dananya
              ditahan aman sampai pembeli konfirmasi terima barang — cukup buat link, bagikan, selesai.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-12 font-medium">
                <Link href="/dashboard/salinrekber">Buat Payment Link</Link>
              </Button>
              <Button asChild variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full px-8 h-12 font-medium">
                <Link href="/dashboard/product-links">Buat Link Produk</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Link (sekali pakai) */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <Link2 className="w-5 h-5" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Payment Link</h2>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700">Sekali Pakai</span>
            </div>
            <p className="text-gray-600 mb-8 max-w-2xl">
              Cocok untuk transaksi satu-lawan-satu: jual barang bekas, closing deal lewat chat, atau
              proyek jasa dengan satu klien. Satu link hanya bisa dipakai satu kali oleh satu pembeli.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {paymentLinkSteps.map((step, idx) => (
                <StepCard key={step.title} {...step} step={idx + 1} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Link Produk (reusable) */}
      <section className="py-16 bg-slate-50/70">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Link Produk</h2>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">Bisa Dipakai Berkali-kali</span>
            </div>
            <p className="text-gray-600 mb-8 max-w-2xl">
              Cocok untuk pengusaha yang punya toko/website sendiri dan mau pasang tombol
              &ldquo;Bayar Aman dengan Rekber&rdquo; secara permanen di halaman produknya — tanpa perlu
              developer atau kode sama sekali. Satu link, dipakai berulang oleh banyak pembeli berbeda,
              setiap klik otomatis membuat transaksi escrow baru.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {productLinkSteps.map((step, idx) => (
                <StepCard key={step.title} {...step} step={idx + 1} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Perbandingan */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
              Pilih yang Sesuai Kebutuhan Anda
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-4 px-4 font-semibold text-slate-500"></th>
                    <th className="text-left py-4 px-4 font-bold text-blue-700">Payment Link</th>
                    <th className="text-left py-4 px-4 font-bold text-indigo-700">Link Produk</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Jumlah pemakaian', 'Sekali pakai (1 link = 1 pembeli)', 'Berkali-kali (1 link = banyak pembeli)'],
                    ['Cocok untuk', 'Deal satu-satu lewat chat/sosmed', 'Produk tetap di website/toko online sendiri'],
                    ['Tempat pasang link', 'Dikirim langsung ke 1 pembeli', 'Ditempel permanen di halaman produk/bio'],
                    ['Butuh developer?', 'Tidak', 'Tidak'],
                    ['Buat di', 'Dashboard → Payment Link', 'Dashboard → Link Produk'],
                  ].map((row) => (
                    <tr key={row[0]} className="border-b border-slate-100">
                      <td className="py-4 px-4 font-medium text-slate-600">{row[0]}</td>
                      <td className="py-4 px-4 text-slate-700">{row[1]}</td>
                      <td className="py-4 px-4 text-slate-700">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Manfaat */}
      <section className="py-16 bg-slate-50/70">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            <Card className="p-6 rounded-3xl border-slate-100 shadow-none">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-6 h-6 text-green-500" />
                <h3 className="font-bold text-slate-800">Dana Ditahan Aman</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  Dana pembeli disimpan di rekening bersama Rekber.com
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  Diteruskan ke penjual hanya setelah pembeli konfirmasi terima
                </li>
              </ul>
            </Card>
            <Card className="p-6 rounded-3xl border-slate-100 shadow-none">
              <div className="flex items-center gap-3 mb-4">
                <ArrowRight className="w-6 h-6 text-blue-500" />
                <h3 className="font-bold text-slate-800">Mudah untuk Pembeli</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  Tidak perlu punya akun Rekber.com untuk membayar
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  Cukup isi nama, email &amp; no HP, lalu bayar
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA penutup */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Siap mulai jualan lebih aman?</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Daftar akun Rekber.com, lalu buat Payment Link atau Link Produk pertama Anda dari dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-12 font-medium">
              <Link href="/auth/register">Daftar Gratis</Link>
            </Button>
            <Button asChild variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full px-8 h-12 font-medium">
              <Link href="/cara-kerja">Pelajari Cara Kerja Rekber.com</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
