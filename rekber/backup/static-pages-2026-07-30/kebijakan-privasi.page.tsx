import type { Metadata } from 'next'
import { Shield, Lock, Eye, Users, FileText, Mail } from "lucide-react" 
import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'
import NavBar from '@/app/components/slicings/navbar';
import Footer from '@/app/components/slicings/footer';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi - Rekber.com',
  description: 'Kebijakan privasi pengguna Rekber.com dan perlindungan data pribadi.',
  alternates: {
    canonical: '/kebijakan-privasi',
  },
  openGraph: {
    title: 'Kebijakan Privasi - Rekber.com',
    description: 'Kebijakan privasi pengguna Rekber.com dan perlindungan data pribadi.',
    url: 'https://www.rekber.com/kebijakan-privasi',
    siteName: 'Rekber.com',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Kebijakan Privasi - Rekber.com',
    description: 'Kebijakan privasi pengguna Rekber.com dan perlindungan data pribadi.',
  },
};

export default function PrivacyPolicy() {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50"> 
        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Privacy Policy Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">Kebijakan Privasi</h1>
                  <p className="text-gray-600 text-lg">
                    Rekber.com berkomitmen untuk melindungi privasi dan keamanan data pribadi Anda.
                  </p>
                  <div className="mt-4 text-sm text-gray-500">Terakhir diperbarui: 15 Januari 2025</div>
                </div>

                {/* Privacy Sections */}
                <div className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-6 h-6 mr-2 text-blue-600" />
                      Informasi yang Kami Kumpulkan
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 mb-4">
                        Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami, termasuk:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Informasi akun (nama, email, nomor telepon)</li>
                        <li>Informasi transaksi dan pembayaran</li>
                        <li>Komunikasi dengan layanan pelanggan</li>
                        <li>Informasi verifikasi identitas</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Eye className="w-6 h-6 mr-2 text-blue-600" />
                      Bagaimana Kami Menggunakan Informasi
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 mb-4">Informasi yang kami kumpulkan digunakan untuk:</p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Memproses dan memfasilitasi transaksi escrow</li>
                        <li>Verifikasi identitas dan pencegahan penipuan</li>
                        <li>Memberikan layanan pelanggan</li>
                        <li>Mengirim notifikasi penting terkait layanan</li>
                        <li>Meningkatkan keamanan platform</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Lock className="w-6 h-6 mr-2 text-blue-600" />
                      Keamanan Data
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 mb-4">
                        Kami menerapkan langkah-langkah keamanan yang ketat untuk melindungi informasi Anda:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Enkripsi SSL 256-bit untuk semua transmisi data</li>
                        <li>Sistem autentikasi dua faktor (2FA)</li>
                        <li>Monitoring keamanan 24/7</li>
                        <li>Akses terbatas pada data sensitif</li>
                        <li>Audit keamanan berkala</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Users className="w-6 h-6 mr-2 text-blue-600" />
                      Berbagi Informasi
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 mb-4">
                        Kami tidak menjual atau menyewakan informasi pribadi Anda. Kami hanya membagikan informasi dalam
                        situasi berikut:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Dengan persetujuan eksplisit dari Anda</li>
                        <li>Untuk memenuhi kewajiban hukum</li>
                        <li>Dengan penyedia layanan tepercaya yang membantu operasional kami</li>
                        <li>Dalam kasus investigasi penipuan atau aktivitas ilegal</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Hak-Hak Anda</h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 mb-4">Anda memiliki hak untuk:</p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Mengakses dan memperbarui informasi pribadi Anda</li>
                        <li>Meminta penghapusan data (dengan ketentuan tertentu)</li>
                        <li>Menarik persetujuan penggunaan data</li>
                        <li>Mengajukan keluhan terkait penggunaan data</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Mail className="w-6 h-6 mr-2 text-blue-600" />
                      Hubungi Kami
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 mb-4">
                        Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami:
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 mb-2">
                          <strong>Email:</strong> privacy@rekber.com
                        </p>
                        <p className="text-gray-700 mb-2">
                          <strong>WhatsApp:</strong> +62 812-3456-7890
                        </p>
                        <p className="text-gray-700">
                          <strong>Alamat:</strong> Jl. Teknologi No. 123, Jakarta 12345
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Trust Badge */}
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Privasi Terjamin</h3>
                    <p className="text-blue-100 text-sm">Data Anda dilindungi dengan standar keamanan internasional</p>
                  </CardContent>
                </Card>

                {/* Contact Support */}
              
              <Card className="mt-5"> 
                <CardContent >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Butuh Bantuan?</h3>
                  <p className="text-gray-600 text-sm mb-4">Tim support kami siap membantu Anda</p>
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
        </main> 
      </div>
      <Footer />
    </>
  );
}