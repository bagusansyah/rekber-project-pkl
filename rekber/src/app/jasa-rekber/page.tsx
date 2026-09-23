import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Wallet,
  PackageCheck,
  UserCheck,
  Scale,
  Sparkles,
  ShoppingBag,
  Store,
  MessageCircleWarning,
  HelpCircle,
} from 'lucide-react';
import NavBar from '@/app/components/slicings/navbar';
import Footer from '@/app/components/slicings/footer';

const TITLE = 'Jasa Rekber Terpercaya & Aman untuk Transaksi Online | Rekber.com';
const DESCRIPTION =
  'Jasa rekber Rekber.com menahan dana pembeli sampai barang diterima sesuai kesepakatan. Rekening bersama online dengan biaya transparan mulai 1%, aman untuk pembeli dan penjual.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/jasa-rekber',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://www.rekber.com/jasa-rekber',
    siteName: 'Rekber.com',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
};

const faqItems = [
  {
    question: 'Apa itu jasa rekber?',
    answer:
      'Jasa rekber (rekening bersama) adalah layanan pihak ketiga yang menahan sementara dana pembeli sampai kondisi transaksi yang disepakati pembeli dan penjual terpenuhi, baru kemudian dana diteruskan ke penjual. Tujuannya supaya pembeli tidak membayar langsung ke penjual yang belum dikenal, dan penjual tetap yakin akan dibayar setelah mengirim barang.',
  },
  {
    question: 'Apakah Rekber.com aman digunakan?',
    answer:
      'Rekber.com aman karena dana transaksi ditahan di rekening Rekber.com, bukan langsung ke rekening pribadi penjual. Pembeli dan penjual juga melalui proses verifikasi identitas (KYC), dan setiap perselisihan ditangani lewat mediasi berbasis bukti sebelum dana dilepaskan.',
  },
  {
    question: 'Berapa biaya jasa rekber di Rekber.com?',
    answer:
      'Biaya jasa rekber di Rekber.com adalah 1% dari nilai transaksi untuk transaksi hingga Rp100.000.000, dan turun menjadi 0,5% untuk transaksi di atas Rp100.000.000 — dengan biaya minimum Rp10.000 per transaksi. Tidak ada biaya tersembunyi; rincian lengkap dan kalkulator biaya tersedia di halaman Biaya.',
  },
  {
    question: 'Bagaimana jika terjadi masalah dengan transaksi?',
    answer:
      'Kalau barang tidak sesuai atau salah satu pihak tidak memenuhi kesepakatan, Anda bisa melaporkan masalah tersebut ke tim Rekber.com. Kami akan meminta bukti dari kedua belah pihak dan bertindak sebagai mediator untuk mencari solusi yang adil sebelum dana dilepaskan atau dikembalikan.',
  },
  {
    question: 'Apakah semua barang atau jasa bisa pakai Rekber?',
    answer:
      'Rekber.com mendukung berbagai kategori transaksi — mulai dari gadget dan elektronik, kendaraan, jasa profesional (desain, pembuatan website, jasa titip), hingga aset digital seperti akun media sosial dan domain. Untuk kategori barang/jasa yang tidak yakin, Anda bisa menghubungi tim support kami terlebih dahulu.',
  },
  {
    question: 'Berapa lama proses transaksi rekber?',
    answer:
      'Setelah pembeli mengonfirmasi penerimaan barang, dana diteruskan ke penjual dalam waktu maksimal 1x24 jam. Lama keseluruhan transaksi sendiri tergantung waktu pengiriman barang dari penjual ke pembeli.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export default function JasaRekberPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <NavBar />
      <div className="min-h-screen bg-white">
        {/* Hero */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-blue-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Jasa Rekber Terpercaya untuk Transaksi Online
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
                Rekber.com adalah jasa rekening bersama yang membantu mengamankan transaksi online
                antara pembeli dan penjual. Dana transaksi ditahan sementara oleh Rekber.com dan
                diteruskan kepada penjual setelah ketentuan transaksi terpenuhi.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/formrekber"
                  className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors w-full sm:w-auto"
                >
                  Buat Transaksi Rekber
                </Link>
                <Link
                  href="/fee"
                  className="inline-flex items-center justify-center border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-8 py-3 rounded-xl transition-colors w-full sm:w-auto"
                >
                  Cek Biaya Transaksi
                </Link>
              </div>
            </div>
          </div>
        </section>

        <main className="container mx-auto px-4 py-16 max-w-4xl">
          {/* Apa Itu Jasa Rekber */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Apa Itu Jasa Rekber?</h2>
            <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-4">
              <p>
                Jasa rekber, singkatan dari <strong>rekening bersama</strong>, adalah layanan escrow yang
                menempatkan pihak ketiga netral di tengah transaksi jual beli online. Alih-alih pembeli
                mengirim uang langsung ke rekening penjual yang belum tentu dikenal, dana tersebut lebih
                dulu ditahan oleh penyedia jasa rekber — dalam hal ini Rekber.com — sampai barang atau
                jasa yang dipesan benar-benar diterima dan sesuai kesepakatan.
              </p>
              <p>
                Konsep rekening bersama online ini populer di Indonesia karena transaksi jual beli lewat
                media sosial, grup jual beli, atau antar individu sering tidak punya jaminan seperti di
                marketplace besar. Modus penipuan seperti barang tidak dikirim, barang tidak sesuai
                deskripsi, atau pembayaran fiktif masih sering terjadi. Jasa rekber terpercaya seperti
                Rekber.com hadir untuk menutup celah risiko itu — baik untuk pembeli maupun penjual.
              </p>
              <p>
                Sebagai jasa rekber Indonesia, Rekber.com tidak hanya menahan dana, tapi juga
                memverifikasi identitas pengguna dan menyediakan mekanisme mediasi kalau terjadi
                perselisihan, sehingga transaksi tetap berjalan adil untuk kedua belah pihak.
              </p>
            </div>
          </section>

          {/* Cara Kerja */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Bagaimana Cara Kerja Rekber?</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Secara garis besar, cara kerja rekber online di Rekber.com berjalan lewat enam tahap
              berikut:
            </p>
            <ol className="space-y-4">
              {[
                {
                  icon: UserCheck,
                  title: 'Pembeli dan penjual sepakat',
                  desc: 'Kedua pihak menyepakati harga, spesifikasi barang/jasa, dan metode pengiriman.',
                },
                {
                  icon: Wallet,
                  title: 'Pembeli membayar ke Rekber.com',
                  desc: 'Dana ditransfer ke rekening Rekber.com, bukan langsung ke penjual, lalu dikonfirmasi sistem.',
                },
                {
                  icon: PackageCheck,
                  title: 'Penjual mengirim barang/jasa',
                  desc: 'Setelah pembayaran terkonfirmasi, penjual mengirim barang atau mulai mengerjakan jasa yang dipesan.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Pembeli memeriksa barang',
                  desc: 'Pembeli mendapat waktu pemeriksaan (1x24 jam) untuk mengecek kondisi dan kesesuaian barang.',
                },
                {
                  icon: Sparkles,
                  title: 'Konfirmasi penerimaan',
                  desc: 'Jika sesuai, pembeli mengonfirmasi penerimaan langsung dari akun Rekber.com miliknya.',
                },
                {
                  icon: Scale,
                  title: 'Dana diteruskan ke penjual',
                  desc: 'Rekber.com meneruskan dana ke rekening penjual, transaksi dinyatakan selesai.',
                },
              ].map((step, i) => (
                <li key={step.title} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="shrink-0 w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{step.title}</p>
                    <p className="text-gray-600 text-sm mt-1">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-gray-600 mt-6">
              Penjelasan lebih detail beserta ilustrasi tiap langkah bisa dilihat di halaman{' '}
              <Link href="/cara-kerja" className="text-blue-600 font-medium hover:underline">
                Cara Kerja Rekber.com
              </Link>
              .
            </p>
          </section>

          {/* Cara Menggunakan */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Cara Menggunakan Jasa Rekber.com
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Menggunakan jasa rekber di Rekber.com tidak memerlukan aplikasi tambahan — semua proses
                dilakukan langsung lewat browser, baik di HP maupun komputer. Berikut langkah praktisnya:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Daftar akun dengan klik tombol <strong>Register</strong> di halaman utama Rekber.com.</li>
                <li>
                  Buat transaksi baru lewat halaman{' '}
                  <Link href="/formrekber" className="text-blue-600 font-medium hover:underline">
                    Buat Transaksi Rekber
                  </Link>
                  , lalu pilih peran Anda sebagai pembeli atau penjual.
                </li>
                <li>Isi detail transaksi: nama produk/jasa, nominal, dan deskripsi kesepakatan dengan pihak lain.</li>
                <li>Bagikan link transaksi ke pihak lawan transaksi supaya keduanya berada di halaman yang sama.</li>
                <li>Pembeli melakukan pembayaran sesuai instruksi, penjual mengirim barang setelah pembayaran terkonfirmasi.</li>
                <li>Setelah barang diterima dan dikonfirmasi, dana otomatis diteruskan ke penjual.</li>
              </ul>
              <p>
                Seluruh riwayat dan status transaksi bisa dipantau real-time dari dashboard akun
                Rekber.com Anda, termasuk bukti pembayaran dan komunikasi antara pembeli dan penjual.
              </p>
            </div>
          </section>

          {/* Biaya */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Berapa Biaya Jasa Rekber?</h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Biaya jasa rekber di Rekber.com dihitung berdasarkan nilai transaksi, dengan struktur
                yang transparan dan lebih kompetitif dibanding rata-rata biaya penanganan di marketplace
                besar (yang bisa mencapai 4%–15%):
              </p>
              <div className="grid sm:grid-cols-3 gap-4 not-prose">
                <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
                  <p className="text-2xl font-bold text-green-600">1%</p>
                  <p className="text-sm text-gray-600 mt-1">Untuk transaksi hingga Rp100.000.000</p>
                </div>
                <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
                  <p className="text-2xl font-bold text-blue-600">0,5%</p>
                  <p className="text-sm text-gray-600 mt-1">Untuk transaksi di atas Rp100.000.000</p>
                </div>
                <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
                  <p className="text-2xl font-bold text-orange-600">Rp10.000</p>
                  <p className="text-sm text-gray-600 mt-1">Biaya minimum per transaksi</p>
                </div>
              </div>
              <p>
                Biaya ini dibayarkan oleh pembeli bersamaan dengan nominal transaksi, dan sudah termasuk
                perlindungan penuh selama dana berada di rekening bersama Rekber.com. Tidak ada biaya
                tersembunyi — Anda bisa menghitung estimasi biaya transaksi Anda lewat{' '}
                <Link href="/fee" className="text-blue-600 font-medium hover:underline">
                  kalkulator biaya di halaman Fee
                </Link>
                .
              </p>
            </div>
          </section>

          {/* Keamanan */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Apakah Rekber Aman?</h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Keamanan adalah alasan utama orang mencari jasa rekber terpercaya, dan Rekber.com
                dirancang di sekitar tiga lapis perlindungan:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Dana ditahan pihak ketiga netral</strong> — uang pembeli tidak langsung masuk ke
                  rekening penjual, sehingga penjual tidak bisa kabur begitu dana diterima.
                </li>
                <li>
                  <strong>Verifikasi identitas (KYC)</strong> — pengguna melewati proses verifikasi identitas
                  sebelum bertransaksi, mengurangi risiko akun palsu atau anonim.
                </li>
                <li>
                  <strong>Mediasi berbasis bukti</strong> — kalau terjadi perselisihan, tim Rekber.com meminta
                  bukti dari kedua pihak sebelum memutuskan ke mana dana harus diteruskan.
                </li>
              </ul>
              <p>
                Kombinasi ini yang membuat rekber online jadi jauh lebih aman dibanding transfer langsung
                antar individu tanpa perantara, terutama untuk transaksi dengan pihak yang baru pertama
                kali dikenal secara online.
              </p>
            </div>
          </section>

          {/* Keuntungan */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Keuntungan Menggunakan Rekber</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Terlindungi dari penipuan',
                  desc: 'Dana baru dilepaskan setelah barang diterima dan dikonfirmasi sesuai kesepakatan.',
                },
                {
                  icon: Wallet,
                  title: 'Biaya transparan',
                  desc: 'Mulai dari 1%, jauh lebih hemat dibanding fee marketplace pada umumnya.',
                },
                {
                  icon: ShoppingBag,
                  title: 'Mendukung banyak kategori',
                  desc: 'Gadget, kendaraan, jasa profesional, hingga aset digital.',
                },
                {
                  icon: MessageCircleWarning,
                  title: 'Ada jalur penyelesaian masalah',
                  desc: 'Tim mediasi siap membantu kalau transaksi tidak berjalan sesuai kesepakatan.',
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <item.icon className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Untuk Pembeli & Penjual */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Rekber untuk Pembeli</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Bagi pembeli, jasa rekber menghilangkan kekhawatiran membayar duluan ke penjual yang belum
                dikenal. Dana Anda ditahan Rekber.com dan baru diteruskan ke penjual setelah Anda sendiri
                yang mengonfirmasi barang sudah diterima sesuai kesepakatan. Kalau barang tidak sesuai
                atau tidak sampai, Anda bisa mengajukan penyelesaian masalah sebelum dana dilepaskan.
              </p>
            </section>
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Store className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Rekber untuk Penjual</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Bagi penjual, rekber membantu meyakinkan calon pembeli baru bahwa transaksi ini aman —
                termasuk pembeli yang belum pernah bertransaksi dengan Anda sebelumnya. Karena dana sudah
                ditahan Rekber.com sejak awal, Anda punya kepastian pembayaran begitu barang dikirim dan
                diterima, tanpa risiko pembeli kabur setelah barang sampai.
              </p>
            </section>
          </div>

          {/* Dispute */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Penyelesaian Masalah / Dispute
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p>
                Meski sudah dirancang aman, perselisihan tetap bisa terjadi — misalnya barang tidak sesuai
                deskripsi, rusak saat pengiriman, atau tidak dikirim sama sekali. Kalau ini terjadi, Anda
                bisa langsung melaporkannya lewat halaman{' '}
                <Link href="/laporkan-masalah" className="text-blue-600 font-medium hover:underline">
                  Laporkan Masalah
                </Link>{' '}
                dengan menyertakan detail dan bukti pendukung (foto, chat, resi pengiriman, dll).
              </p>
              <p>
                Tim Rekber.com akan bertindak sebagai mediator netral: meminta keterangan dan bukti dari
                kedua belah pihak, lalu mencari solusi yang adil sebelum dana diteruskan ke penjual atau
                dikembalikan ke pembeli. Tim support kami menargetkan respon awal dalam waktu 1x24 jam
                sejak laporan diterima.
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Pertanyaan Seputar Jasa Rekber
              </h2>
            </div>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <div key={item.question} className="p-5 rounded-xl bg-blue-50 border border-blue-100">
                  <h3 className="font-semibold text-gray-900 mb-2">{item.question}</h3>
                  <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mt-16 text-center p-10 rounded-2xl bg-blue-600">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Siap Bertransaksi dengan Aman?
            </h2>
            <p className="text-blue-100 mb-6 max-w-xl mx-auto">
              Mulai gunakan jasa rekber Rekber.com sekarang untuk melindungi transaksi jual beli online
              Anda, baik sebagai pembeli maupun penjual.
            </p>
            <Link
              href="/formrekber"
              className="inline-flex items-center justify-center bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Buat Transaksi Rekber Sekarang
            </Link>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}
