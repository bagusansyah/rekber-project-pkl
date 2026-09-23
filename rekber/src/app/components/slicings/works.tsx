import { ChevronDown, Star, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Works() {
  return (
    <>
    <section id='works' className='py-20 bg-gray-50'>
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Cara Kerja Rekber.com</h2>
            <p className="text-xl text-gray-600">Proses sederhana dalam 4 langkah untuk transaksi yang aman</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Daftar</h3>
              <p className="text-gray-600">Buat akun dan verifikasi identitas Anda dengan mudah</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Deposit</h3>
              <p className="text-gray-600">Pembeli melakukan deposit dana ke rekening bersama</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Transaksi</h3>
              <p className="text-gray-600">Penjual mengirim barang, pembeli konfirmasi penerimaan</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">4. Selesai</h3>
              <p className="text-gray-600">Dana otomatis diteruskan ke penjual setelah konfirmasi</p>
            </div>
          </div>
        </div>
    </section> 
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">FAQ</h2>
            <p className="text-xl text-gray-600">Pertanyaan yang sering diajukan tentang layanan Rekber.com</p>
          </div>

          <div className="space-y-4">
            <Collapsible>
              <CollapsibleTrigger className="flex justify-between items-center w-full p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-left font-semibold text-lg">Apa itu layanan Rekber.com?</span>
                <ChevronDown className="w-5 h-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-6 bg-white border border-gray-200 rounded-b-lg">
                <p className="text-gray-700">
                  Rekber.com adalah layanan escrow yang bertindak sebagai pihak ketiga terpercaya dalam
                  transaksi jual beli online. Kami menjaga dana pembeli hingga barang diterima dengan baik, sehingga
                  melindungi kedua belah pihak dari penipuan.
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex justify-between items-center w-full p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-left font-semibold text-lg">Bagaimana cara kerja sistem Rekber.com?</span>
                <ChevronDown className="w-5 h-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-6 bg-white border border-gray-200 rounded-b-lg">
                <p className="text-gray-700">
                  1. Pembeli dan penjual sepakat menggunakan layanan Rekber.com
                  <br />
                  2. Pembeli melakukan deposit ke rekening Rekber.com
                  <br />
                  3. Penjual mengirim barang setelah deposit dikonfirmasi
                  <br />
                  4. Pembeli mengecek barang dan konfirmasi penerimaan
                  <br />
                  5. Dana diteruskan ke penjual setelah konfirmasi
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex justify-between items-center w-full p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-left font-semibold text-lg">Berapa biaya layanan Rekber.com?</span>
                <ChevronDown className="w-5 h-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-6 bg-white border border-gray-200 rounded-b-lg">
                <p className="text-gray-700">
                  Biaya layanan Rekber sangat terjangkau, mulai dari 1% dari nilai transaksi dengan minimum Rp 5.000.
                  Biaya ini sudah termasuk asuransi dan perlindungan penuh untuk transaksi Anda. Detail lengkap dapat
                  dilihat di halaman Fee.
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex justify-between items-center w-full p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-left font-semibold text-lg">Apakah dana saya aman di Rekber.com?</span>
                <ChevronDown className="w-5 h-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-6 bg-white border border-gray-200 rounded-b-lg">
                <p className="text-gray-700">
                  Ya, dana Anda 100% aman. Kami menggunakan sistem keamanan berlapis, rekening terpisah untuk setiap
                  transaksi, dan bekerja sama dengan bank-bank terpercaya. Selain itu, semua transaksi diasuransikan dan
                  diawasi oleh otoritas keuangan.
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex justify-between items-center w-full p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-left font-semibold text-lg">Berapa lama proses transaksi?</span>
                <ChevronDown className="w-5 h-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-6 bg-white border border-gray-200 rounded-b-lg">
                <p className="text-gray-700">
                  Proses deposit biasanya dikonfirmasi dalam 1-3 jam kerja. Setelah pembeli konfirmasi penerimaan
                  barang, dana akan diteruskan ke penjual dalam maksimal 24 jam. Untuk transaksi mendesak, tersedia
                  layanan express dengan biaya tambahan.
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex justify-between items-center w-full p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-left font-semibold text-lg">Apa yang terjadi jika ada dispute?</span>
                <ChevronDown className="w-5 h-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-6 bg-white border border-gray-200 rounded-b-lg">
                <p className="text-gray-700">
                  Jika terjadi sengketa, tim mediasi kami akan membantu menyelesaikan masalah secara adil. Kami akan
                  meminta bukti dari kedua belah pihak dan memberikan keputusan berdasarkan evidence yang ada. Proses
                  mediasi biasanya selesai dalam 3-7 hari kerja.
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex justify-between items-center w-full p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-left font-semibold text-lg">Apakah bisa untuk transaksi internasional?</span>
                <ChevronDown className="w-5 h-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-6 bg-white border border-gray-200 rounded-b-lg">
                <p className="text-gray-700">
                  Saat ini layanan Rekber.com fokus untuk transaksi domestik dalam mata uang Rupiah. Untuk transaksi
                  internasional, silakan hubungi customer service kami untuk informasi lebih lanjut mengenai kemungkinan
                  layanan khusus.
                </p>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </section>
      <section className="py-20 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Testimoni Pengguna</h2>
      <p className="text-xl text-gray-600">Apa kata mereka yang telah menggunakan layanan Rekber.com</p>
    </div>

    <div className="grid md:grid-cols-3 gap-8">
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Avatar className="w-12 h-12 mr-4">
              <AvatarImage src="/placeholder.svg?height=48&width=48" />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">Sari Andini</h4>
              <p className="text-sm text-gray-600">Online Shop Owner</p>
            </div>
          </div>
          <div className="flex mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-gray-700">
            &quot;Sudah 2 tahun menggunakan Rekber.com untuk toko online saya. Customer jadi lebih percaya dan
            penjualan meningkat drastis. Prosesnya cepat dan customer service sangat responsif!&quot;
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Avatar className="w-12 h-12 mr-4">
              <AvatarImage src="/placeholder.svg?height=48&width=48" />
              <AvatarFallback>BW</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">Budi Wijaya</h4>
              <p className="text-sm text-gray-600">Freelancer</p>
            </div>
          </div>
          <div className="flex mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-gray-700">
            &quot;Sebagai freelancer, Rekber.com memberikan rasa aman saat menerima project dari client baru. Dana
            sudah pasti aman dan client juga merasa terlindungi. Win-win solution!&quot;
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Avatar className="w-12 h-12 mr-4">
              <AvatarImage src="/placeholder.svg?height=48&width=48" />
              <AvatarFallback>DP</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">Dewi Permata</h4>
              <p className="text-sm text-gray-600">Pembeli Online</p>
            </div>
          </div>
          <div className="flex mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-gray-700">
            &quot;Pernah hampir kena tipu beli barang mahal online. Sejak pakai Rekber.com, belanja jadi tenang. Barang
            tidak sesuai? Dana pasti kembali. Recommended banget!&quot;
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Avatar className="w-12 h-12 mr-4">
              <AvatarImage src="/placeholder.svg?height=48&width=48" />
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">Ahmad Santoso</h4>
              <p className="text-sm text-gray-600">Pengusaha</p>
            </div>
          </div>
          <div className="flex mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-gray-700">
            &quot;Untuk transaksi bisnis B2B yang nilainya besar, Rekber.com memberikan kepercayaan ekstra. Partner
            bisnis jadi lebih yakin dan proses negosiasi lebih lancar.&quot;
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Avatar className="w-12 h-12 mr-4">
              <AvatarImage src="/placeholder.svg?height=48&width=48" />
              <AvatarFallback>LM</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">Lisa Maharani</h4>
              <p className="text-sm text-gray-600">Mahasiswa</p>
            </div>
          </div>
          <div className="flex mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-gray-700">
            &quot;Sebagai mahasiswa yang sering jual-beli barang bekas, Rekber.com sangat membantu. Biayanya murah,
            prosesnya mudah, dan yang penting aman dari penipuan!&quot;
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Avatar className="w-12 h-12 mr-4">
              <AvatarImage src="/placeholder.svg?height=48&width=48" />
              <AvatarFallback>RH</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">Rudi Hartono</h4>
              <p className="text-sm text-gray-600">Kolektor</p>
            </div>
          </div>
          <div className="flex mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-gray-700">
            &quot;Hobi koleksi barang antik membuat saya sering transaksi dengan nilai tinggi. Rekber.com memberikan
            perlindungan yang saya butuhkan. Tim support juga sangat profesional.&quot;
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</section>

      </>
  )
}