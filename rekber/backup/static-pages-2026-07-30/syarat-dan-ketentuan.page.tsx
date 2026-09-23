"use client"

import { Shield, FileText, AlertTriangle, Users, Scale } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card" 
import NavBar from '@/app/components/slicings/navbar';
import Footer from '@/app/components/slicings/footer';
import Link from 'next/link'
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Syarat dan Ketentuan</h1>
              <p className="text-gray-600 mb-6">
                Rekber.com berkomitmen untuk memberikan layanan rekening bersama yang aman dan terpercaya untuk semua
                pengguna.
              </p>
              <p className="text-sm text-gray-500 mb-8">Terakhir diperbarui: 15 Januari 2025</p>

              {/* Section 1: Definisi */}
              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <FileText className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">1. Definisi dan Interpretasi</h2>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <strong>Rekber.com</strong> adalah platform layanan rekening bersama yang memfasilitasi transaksi
                    jual beli online.
                  </p>
                  <p>
                    <strong>Pengguna</strong> adalah setiap individu atau entitas yang menggunakan layanan Rekber.com.
                  </p>
                  <p>
                    <strong>Penjual</strong> adalah pengguna yang menawarkan barang atau jasa untuk dijual.
                  </p>
                  <p>
                    <strong>Pembeli</strong> adalah pengguna yang membeli barang atau jasa dari penjual.
                  </p>
                  <p>
                    <strong>Transaksi</strong> adalah proses jual beli yang difasilitasi melalui layanan Rekber.com.
                  </p>
                </div>
              </section>

              {/* Section 2: Layanan */}
              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">2. Layanan Rekber.com</h2>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p>Rekber.com menyediakan layanan rekening bersama dengan fitur:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Penyimpanan dana sementara dari pembeli</li>
                    <li>Verifikasi pengiriman barang/jasa</li>
                    <li>Penerusan pembayaran kepada penjual setelah konfirmasi</li>
                    <li>Mediasi dalam penyelesaian sengketa</li>
                    <li>Sistem keamanan berlapis untuk melindungi transaksi</li>
                  </ul>
                </div>
              </section>

              {/* Section 3: Kewajiban Pengguna */}
              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">3. Kewajiban dan Tanggung Jawab Pengguna</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold mb-2">Kewajiban Umum:</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Memberikan informasi yang akurat dan lengkap</li>
                      <li>Menjaga kerahasiaan akun dan kata sandi</li>
                      <li>Tidak menggunakan layanan untuk kegiatan ilegal</li>
                      <li>Mematuhi semua ketentuan yang berlaku</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Kewajiban Penjual:</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Mengirim barang sesuai deskripsi dan kondisi yang dijanjikan</li>
                      <li>Memberikan informasi pengiriman yang akurat</li>
                      <li>Merespons komunikasi dari pembeli dan Rekber.com</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Kewajiban Pembeli:</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Melakukan pembayaran sesuai kesepakatan</li>
                      <li>Memeriksa barang yang diterima dengan teliti</li>
                      <li>Memberikan konfirmasi penerimaan dalam waktu yang ditentukan</li>
                    </ul>
                  </div>
                </div>
              </section>
 
              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <Scale className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">4. Proses dan Prosedur Transaksi</h2>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p>Setiap transaksi melalui Rekber.com mengikuti tahapan berikut:</p>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Pembeli dan penjual menyepakati detail transaksi</li>
                    <li>Pembeli melakukan pembayaran ke rekening Rekber.com</li>
                    <li>Rekber.com mengkonfirmasi penerimaan pembayaran</li>
                    <li>Penjual mengirim barang/jasa kepada pembeli</li>
                    <li>Pembeli memeriksa dan mengkonfirmasi penerimaan</li>
                    <li>Rekber.com meneruskan pembayaran kepada penjual</li>
                  </ol>
                  <p className="mt-4">
                    <strong>Batas Waktu:</strong> Pembeli memiliki waktu maksimal 3x24 jam untuk melakukan konfirmasi
                    penerimaan barang. Jika tidak ada konfirmasi, pembayaran akan otomatis diteruskan kepada penjual.
                  </p>
                </div>
              </section>

              {/* Section 6: Penyelesaian Sengketa */}
              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">5. Penyelesaian Sengketa</h2>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p>Dalam hal terjadi sengketa antara pembeli dan penjual:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Rekber.com akan bertindak sebagai mediator netral</li>
                    <li>Kedua belah pihak wajib menyediakan bukti-bukti yang diperlukan</li>
                    <li>Keputusan Rekber.com bersifat final dan mengikat</li>
                    <li>Proses mediasi akan diselesaikan dalam waktu maksimal 7 hari kerja</li>
                  </ul>
                </div>
              </section>

              {/* Section 7: Pembatasan Tanggung Jawab */}
              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">6. Pembatasan Tanggung Jawab</h2>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p>Rekber.com tidak bertanggung jawab atas:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Kualitas, keaslian, atau kondisi barang yang diperjualbelikan</li>
                    <li>Kerugian akibat kelalaian pengguna dalam mengikuti prosedur</li>
                    <li>Gangguan teknis di luar kendali Rekber.com</li>
                    <li>Tindakan penipuan yang dilakukan oleh pihak ketiga</li>
                    <li>Force majeure atau keadaan kahar</li>
                  </ul>
                </div>
              </section>

              {/* Section 8: Perubahan Ketentuan */}
              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <FileText className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">7. Perubahan Syarat dan Ketentuan</h2>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p>
                    Rekber.com berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan
                    melalui website dan email terdaftar. Penggunaan layanan setelah perubahan dianggap sebagai
                    persetujuan terhadap ketentuan baru.
                  </p>
                </div>
              </section>

              {/* Section 9: Kontak */}
              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">8 Hubungi Kami</h2>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p>Untuk pertanyaan mengenai syarat dan ketentuan ini, silakan hubungi:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Email: support@rekber.com</li>
                    <li>WhatsApp: </li>
                    <li>Website: www.rekber.com</li>
                  </ul>
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-blue-600 text-white mb-6">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-white" />
                <h3 className="text-xl font-semibold mb-2">Keamanan Terjamin</h3>
                <p className="text-blue-100">Transaksi Anda dilindungi dengan standar keamanan internasional</p>
              </CardContent>
            </Card> 

            <Card>
                <CardContent className="p-6">
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
