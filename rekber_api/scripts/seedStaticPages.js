// One-off seed script: creates the static_pages table (if missing) and seeds it
// with the content that used to be hardcoded in the 4 Next.js pages
// (tentang-kami, syarat-dan-ketentuan, kebijakan-privasi, kebijakan-refund).
// Safe to re-run: uses ON CONFLICT (slug) DO NOTHING, so it never overwrites
// content an admin has already edited through the CMS.
//
// Usage: node scripts/seedStaticPages.js

const pool = require("../config/db");

const pages = [
  {
    slug: "tentang-kami",
    page_type: "about",
    title: "Tentang Kami",
    meta_description:
      "Pelajari visi, misi, dan tim di balik layanan rekening bersama Rekber.com.",
    content: {
      hero: {
        title_line1: "Tentang",
        title_line2: "Rekber.com",
        subtitle:
          "Platform rekening bersama terpercaya yang menghubungkan pembeli dan penjual dengan sistem pembayaran yang aman dan transparan",
      },
      mission: {
        title: "Misi Kami",
        description:
          "Menciptakan ekosistem perdagangan online yang aman dan terpercaya di Indonesia. Kami berkomitmen untuk melindungi setiap transaksi dan memberikan ketenangan pikiran bagi pembeli dan penjual.",
        points: [
          {
            title: "Keamanan Terjamin",
            description: "Sistem enkripsi tingkat bank untuk melindungi data dan transaksi",
          },
          {
            title: "Transparansi Penuh",
            description: "Proses yang jelas dan dapat dilacak di setiap tahap transaksi",
          },
          {
            title: "Dukungan 24/7",
            description: "Tim customer service siap membantu kapan saja",
          },
        ],
      },
      image_url: "/images/logo-apps.png",
    },
  },
  {
    slug: "syarat-dan-ketentuan",
    page_type: "legal",
    title: "Syarat dan Ketentuan",
    meta_description:
      "Syarat dan ketentuan penggunaan layanan rekening bersama Rekber.com.",
    content: {
      intro:
        "Rekber.com berkomitmen untuk memberikan layanan rekening bersama yang aman dan terpercaya untuk semua pengguna.",
      last_updated: "15 Januari 2025",
      sections: [
        {
          icon: "FileText",
          title: "1. Definisi dan Interpretasi",
          blocks: [
            {
              type: "definitions",
              items: [
                { term: "Rekber.com", description: "adalah platform layanan rekening bersama yang memfasilitasi transaksi jual beli online." },
                { term: "Pengguna", description: "adalah setiap individu atau entitas yang menggunakan layanan Rekber.com." },
                { term: "Penjual", description: "adalah pengguna yang menawarkan barang atau jasa untuk dijual." },
                { term: "Pembeli", description: "adalah pengguna yang membeli barang atau jasa dari penjual." },
                { term: "Transaksi", description: "adalah proses jual beli yang difasilitasi melalui layanan Rekber.com." },
              ],
            },
          ],
        },
        {
          icon: "Shield",
          title: "2. Layanan Rekber.com",
          blocks: [
            { type: "paragraph", text: "Rekber.com menyediakan layanan rekening bersama dengan fitur:" },
            {
              type: "list",
              style: "bullet",
              items: [
                "Penyimpanan dana sementara dari pembeli",
                "Verifikasi pengiriman barang/jasa",
                "Penerusan pembayaran kepada penjual setelah konfirmasi",
                "Mediasi dalam penyelesaian sengketa",
                "Sistem keamanan berlapis untuk melindungi transaksi",
              ],
            },
          ],
        },
        {
          icon: "Users",
          title: "3. Kewajiban dan Tanggung Jawab Pengguna",
          blocks: [
            { type: "subheading", text: "Kewajiban Umum:" },
            {
              type: "list",
              style: "bullet",
              items: [
                "Memberikan informasi yang akurat dan lengkap",
                "Menjaga kerahasiaan akun dan kata sandi",
                "Tidak menggunakan layanan untuk kegiatan ilegal",
                "Mematuhi semua ketentuan yang berlaku",
              ],
            },
            { type: "subheading", text: "Kewajiban Penjual:" },
            {
              type: "list",
              style: "bullet",
              items: [
                "Mengirim barang sesuai deskripsi dan kondisi yang dijanjikan",
                "Memberikan informasi pengiriman yang akurat",
                "Merespons komunikasi dari pembeli dan Rekber.com",
              ],
            },
            { type: "subheading", text: "Kewajiban Pembeli:" },
            {
              type: "list",
              style: "bullet",
              items: [
                "Melakukan pembayaran sesuai kesepakatan",
                "Memeriksa barang yang diterima dengan teliti",
                "Memberikan konfirmasi penerimaan dalam waktu yang ditentukan",
              ],
            },
          ],
        },
        {
          icon: "Scale",
          title: "4. Proses dan Prosedur Transaksi",
          blocks: [
            { type: "paragraph", text: "Setiap transaksi melalui Rekber.com mengikuti tahapan berikut:" },
            {
              type: "list",
              style: "number",
              items: [
                "Pembeli dan penjual menyepakati detail transaksi",
                "Pembeli melakukan pembayaran ke rekening Rekber.com",
                "Rekber.com mengkonfirmasi penerimaan pembayaran",
                "Penjual mengirim barang/jasa kepada pembeli",
                "Pembeli memeriksa dan mengkonfirmasi penerimaan",
                "Rekber.com meneruskan pembayaran kepada penjual",
              ],
            },
            {
              type: "definitions",
              items: [
                {
                  term: "Batas Waktu:",
                  description:
                    "Pembeli memiliki waktu maksimal 3x24 jam untuk melakukan konfirmasi penerimaan barang. Jika tidak ada konfirmasi, pembayaran akan otomatis diteruskan kepada penjual.",
                },
              ],
            },
          ],
        },
        {
          icon: "AlertTriangle",
          title: "5. Penyelesaian Sengketa",
          blocks: [
            { type: "paragraph", text: "Dalam hal terjadi sengketa antara pembeli dan penjual:" },
            {
              type: "list",
              style: "bullet",
              items: [
                "Rekber.com akan bertindak sebagai mediator netral",
                "Kedua belah pihak wajib menyediakan bukti-bukti yang diperlukan",
                "Keputusan Rekber.com bersifat final dan mengikat",
                "Proses mediasi akan diselesaikan dalam waktu maksimal 7 hari kerja",
              ],
            },
          ],
        },
        {
          icon: "Shield",
          title: "6. Pembatasan Tanggung Jawab",
          blocks: [
            { type: "paragraph", text: "Rekber.com tidak bertanggung jawab atas:" },
            {
              type: "list",
              style: "bullet",
              items: [
                "Kualitas, keaslian, atau kondisi barang yang diperjualbelikan",
                "Kerugian akibat kelalaian pengguna dalam mengikuti prosedur",
                "Gangguan teknis di luar kendali Rekber.com",
                "Tindakan penipuan yang dilakukan oleh pihak ketiga",
                "Force majeure atau keadaan kahar",
              ],
            },
          ],
        },
        {
          icon: "FileText",
          title: "7. Perubahan Syarat dan Ketentuan",
          blocks: [
            {
              type: "paragraph",
              text:
                "Rekber.com berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui website dan email terdaftar. Penggunaan layanan setelah perubahan dianggap sebagai persetujuan terhadap ketentuan baru.",
            },
          ],
        },
        {
          icon: "Users",
          title: "8. Hubungi Kami",
          blocks: [
            { type: "paragraph", text: "Untuk pertanyaan mengenai syarat dan ketentuan ini, silakan hubungi:" },
            {
              type: "list",
              style: "bullet",
              items: ["Email: support@rekber.com", "WhatsApp: ", "Website: www.rekber.com"],
            },
          ],
        },
      ],
      sidebar: {
        trust_badge: {
          icon: "Shield",
          title: "Keamanan Terjamin",
          description: "Transaksi Anda dilindungi dengan standar keamanan internasional",
        },
        cta: {
          title: "Butuh Bantuan?",
          description: "Tim support kami siap membantu Anda 24/7",
          whatsapp_number: "6282315555551",
          whatsapp_message: "Halo Admin Rekber.com",
        },
      },
    },
  },
  {
    slug: "syarat-dan-ketentuan-kyc",
    page_type: "legal",
    title: "Syarat dan Ketentuan Verifikasi Identitas (KYC)",
    meta_description:
      "Syarat dan ketentuan proses verifikasi identitas (KYC) di Rekber.com.",
    content: {
      last_updated: "10 Agustus 2026",
      body_html: `
        <p>Sebelum mengajukan verifikasi identitas (KYC), mohon baca dan pahami syarat dan ketentuan berikut. Dengan mencentang kotak persetujuan pada formulir verifikasi, Anda dianggap telah membaca, memahami, dan menyetujui seluruh ketentuan di bawah ini.</p>
        <h2>1. Tujuan Verifikasi Identitas</h2>
        <p>Verifikasi identitas (Know Your Customer/KYC) dilakukan oleh Rekber.com untuk:</p>
        <ul>
          <li>Memastikan identitas pengguna sesuai dengan dokumen resmi yang berlaku</li>
          <li>Mencegah penipuan, penyalahgunaan akun, dan pencucian uang</li>
          <li>Memenuhi kewajiban kepatuhan (compliance) sebagai penyedia layanan rekening bersama</li>
          <li>Meningkatkan keamanan transaksi bagi seluruh pengguna platform</li>
        </ul>
        <h2>2. Data dan Dokumen yang Dikumpulkan</h2>
        <p>Dalam proses verifikasi, Anda diminta untuk memberikan:</p>
        <ul>
          <li>Nomor Induk Kependudukan (NIK) sesuai KTP</li>
          <li>Foto KTP yang jelas dan tidak terpotong</li>
          <li>Foto diri sambil memegang KTP (selfie dengan KTP)</li>
          <li>Video singkat selfie wajah sebagai bukti keaslian (liveness check)</li>
        </ul>
        <h2>3. Keakuratan Data</h2>
        <p>Anda bertanggung jawab penuh atas kebenaran dan keakuratan data serta dokumen yang diunggah. Dengan mengajukan verifikasi, Anda menyatakan bahwa:</p>
        <ul>
          <li>Seluruh data dan dokumen yang diberikan adalah asli dan milik Anda sendiri</li>
          <li>Foto dan video diambil secara langsung (real-time) melalui fitur kamera pada formulir, bukan hasil rekayasa atau editan</li>
          <li>Anda tidak menyamarkan atau memalsukan identitas orang lain</li>
        </ul>
        <h2>4. Penggunaan dan Penyimpanan Data</h2>
        <p>Data dan dokumen yang Anda unggah akan:</p>
        <ul>
          <li>Digunakan semata-mata untuk keperluan verifikasi identitas dan kepatuhan hukum</li>
          <li>Disimpan secara aman menggunakan enkripsi dan akses terbatas hanya bagi tim yang berwenang</li>
          <li>Tidak dibagikan kepada pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh peraturan perundang-undangan</li>
        </ul>
        <p>Untuk informasi lebih lengkap mengenai pengelolaan data pribadi Anda, silakan baca <a href="/kebijakan-privasi">Kebijakan Privasi</a> kami.</p>
        <h2>5. Proses dan Hasil Verifikasi</h2>
        <ul>
          <li>Pengajuan verifikasi akan ditinjau oleh tim admin Rekber.com dalam waktu maksimal 1-3 hari kerja</li>
          <li>Rekber.com berhak menolak pengajuan apabila data atau dokumen tidak jelas, tidak sesuai, atau diduga tidak asli</li>
          <li>Jika pengajuan ditolak, Anda dapat mengajukan ulang dengan melengkapi atau memperbaiki data sesuai catatan yang diberikan</li>
          <li>Akun dengan indikasi pemalsuan identitas dapat ditangguhkan atau diblokir secara permanen</li>
        </ul>
        <h2>6. Perubahan Ketentuan</h2>
        <p>Rekber.com berhak mengubah syarat dan ketentuan verifikasi identitas ini sewaktu-waktu untuk mengikuti perkembangan regulasi dan kebutuhan keamanan platform. Perubahan akan diberitahukan melalui website.</p>
        <h2>7. Hubungi Kami</h2>
        <p>Jika Anda memiliki pertanyaan mengenai proses verifikasi identitas, silakan hubungi kami melalui email support@rekber.com atau WhatsApp yang tersedia pada halaman ini.</p>
      `,
      sidebar: {
        trust_badge: {
          icon: "Shield",
          title: "Data Anda Terlindungi",
          description: "Dokumen verifikasi identitas Anda disimpan dengan enkripsi dan akses terbatas",
        },
        cta: {
          title: "Butuh Bantuan?",
          description: "Tim support kami siap membantu proses verifikasi Anda",
          whatsapp_number: "6282315555551",
          whatsapp_message: "Halo Admin Rekber.com, saya butuh bantuan terkait verifikasi identitas (KYC)",
        },
      },
    },
  },
  {
    slug: "kebijakan-privasi",
    page_type: "legal",
    title: "Kebijakan Privasi",
    meta_description: "Kebijakan privasi pengguna Rekber.com dan perlindungan data pribadi.",
    content: {
      intro: "Rekber.com berkomitmen untuk melindungi privasi dan keamanan data pribadi Anda.",
      last_updated: "15 Januari 2025",
      sections: [
        {
          icon: "FileText",
          title: "Informasi yang Kami Kumpulkan",
          blocks: [
            { type: "paragraph", text: "Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami, termasuk:" },
            {
              type: "list",
              style: "bullet",
              items: [
                "Informasi akun (nama, email, nomor telepon)",
                "Informasi transaksi dan pembayaran",
                "Komunikasi dengan layanan pelanggan",
                "Informasi verifikasi identitas",
              ],
            },
          ],
        },
        {
          icon: "Eye",
          title: "Bagaimana Kami Menggunakan Informasi",
          blocks: [
            { type: "paragraph", text: "Informasi yang kami kumpulkan digunakan untuk:" },
            {
              type: "list",
              style: "bullet",
              items: [
                "Memproses dan memfasilitasi transaksi escrow",
                "Verifikasi identitas dan pencegahan penipuan",
                "Memberikan layanan pelanggan",
                "Mengirim notifikasi penting terkait layanan",
                "Meningkatkan keamanan platform",
              ],
            },
          ],
        },
        {
          icon: "Lock",
          title: "Keamanan Data",
          blocks: [
            { type: "paragraph", text: "Kami menerapkan langkah-langkah keamanan yang ketat untuk melindungi informasi Anda:" },
            {
              type: "list",
              style: "bullet",
              items: [
                "Enkripsi SSL 256-bit untuk semua transmisi data",
                "Sistem autentikasi dua faktor (2FA)",
                "Monitoring keamanan 24/7",
                "Akses terbatas pada data sensitif",
                "Audit keamanan berkala",
              ],
            },
          ],
        },
        {
          icon: "Users",
          title: "Berbagi Informasi",
          blocks: [
            {
              type: "paragraph",
              text: "Kami tidak menjual atau menyewakan informasi pribadi Anda. Kami hanya membagikan informasi dalam situasi berikut:",
            },
            {
              type: "list",
              style: "bullet",
              items: [
                "Dengan persetujuan eksplisit dari Anda",
                "Untuk memenuhi kewajiban hukum",
                "Dengan penyedia layanan tepercaya yang membantu operasional kami",
                "Dalam kasus investigasi penipuan atau aktivitas ilegal",
              ],
            },
          ],
        },
        {
          icon: null,
          title: "Hak-Hak Anda",
          blocks: [
            { type: "paragraph", text: "Anda memiliki hak untuk:" },
            {
              type: "list",
              style: "bullet",
              items: [
                "Mengakses dan memperbarui informasi pribadi Anda",
                "Meminta penghapusan data (dengan ketentuan tertentu)",
                "Menarik persetujuan penggunaan data",
                "Mengajukan keluhan terkait penggunaan data",
              ],
            },
          ],
        },
        {
          icon: "Mail",
          title: "Hubungi Kami",
          blocks: [
            { type: "paragraph", text: "Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami:" },
            {
              type: "contact_box",
              items: [
                { label: "Email", value: "privacy@rekber.com" },
                { label: "WhatsApp", value: "+62 812-3456-7890" },
                { label: "Alamat", value: "Jl. Teknologi No. 123, Jakarta 12345" },
              ],
            },
          ],
        },
      ],
      sidebar: {
        trust_badge: {
          icon: "Shield",
          title: "Privasi Terjamin",
          description: "Data Anda dilindungi dengan standar keamanan internasional",
        },
        cta: {
          title: "Butuh Bantuan?",
          description: "Tim support kami siap membantu Anda",
          whatsapp_number: "6282315555551",
          whatsapp_message: "Halo Admin Rekber.com",
        },
      },
    },
  },
  {
    slug: "kebijakan-refund",
    page_type: "legal",
    title: "Kebijakan Refund",
    meta_description: "Ketentuan dan syarat refund di layanan Rekber.com.",
    content: {
      intro:
        "Rekber.com berkomitmen untuk memastikan kepuasan Anda dengan layanan kami. Kebijakan pengembalian dana ini menjelaskan syarat dan ketentuan untuk pengembalian dana.",
      last_updated: "26 Juli 2025",
      sections: [
        {
          icon: "FileText",
          title: "Kelayakan Pengembalian Dana",
          blocks: [
            {
              type: "list",
              style: "bullet",
              items: [
                "Pengembalian dana hanya berlaku untuk transaksi yang memenuhi kriteria tertentu.",
                "Permintaan pengembalian dana harus diajukan dalam waktu 7 hari setelah transaksi.",
                "Layanan atau produk yang dikembalikan harus dalam kondisi asli dan belum digunakan.",
                "Bukti pembelian atau nomor transaksi diperlukan untuk semua permintaan pengembalian dana.",
              ],
            },
          ],
        },
        {
          icon: "Mail",
          title: "Proses Pengajuan Pengembalian Dana",
          blocks: [
            {
              type: "list",
              style: "bullet",
              items: [
                "Untuk mengajukan pengembalian dana, silakan hubungi tim dukungan pelanggan kami melalui email atau formulir kontak.",
                "Sertakan detail transaksi Anda dan alasan permintaan pengembalian dana secara jelas.",
                "Tim kami akan meninjau permintaan Anda dan memberikan tanggapan dalam waktu 3-5 hari kerja.",
              ],
            },
          ],
        },
        {
          icon: "Clock",
          title: "Jangka Waktu Pengembalian Dana",
          blocks: [
            {
              type: "list",
              style: "bullet",
              items: [
                "Setelah permintaan pengembalian dana disetujui, dana akan diproses dalam waktu 5-10 hari kerja.",
                "Waktu yang dibutuhkan dana untuk masuk ke rekening Anda dapat bervariasi tergantung pada metode pembayaran dan kebijakan bank Anda.",
              ],
            },
          ],
        },
        {
          icon: "Ban",
          title: "Pengecualian",
          blocks: [
            {
              type: "list",
              style: "bullet",
              items: [
                "Pengembalian dana tidak akan diberikan untuk layanan yang telah digunakan sepenuhnya atau produk digital yang telah diunduh.",
                "Biaya transaksi atau biaya layanan tertentu mungkin tidak dapat dikembalikan.",
                "Rekber.com berhak menolak permintaan pengembalian dana yang tidak memenuhi syarat.",
                "Jika transaksi batal, biaya (fee) tidak dapat dikembalikan.",
                "Selama transaksi sedang berlangsung, tidak dapat mengajukan pengembalian dana secara sepihak, kecuali ada perjanjian kedua belah pihak.",
              ],
            },
          ],
        },
      ],
      sidebar: {
        trust_badge: {
          icon: "ShieldCheck",
          title: "Transaksi Aman",
          description: "Setiap transaksi Anda dilindungi dengan sistem keamanan terenkripsi dan standar internasional.",
        },
        cta: {
          title: "Butuh Bantuan?",
          description: "Tim support kami siap membantu Anda 24/7",
          whatsapp_number: "6282315555551",
          whatsapp_message: "Halo Admin Rekber.com",
        },
      },
    },
  },
];

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS static_pages (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(100) UNIQUE NOT NULL,
      page_type VARCHAR(20) NOT NULL DEFAULT 'legal',
      title VARCHAR(255) NOT NULL,
      meta_description TEXT,
      content JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("static_pages table ready");

  for (const page of pages) {
    const result = await pool.query(
      `INSERT INTO static_pages (slug, page_type, title, meta_description, content)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (slug) DO NOTHING
       RETURNING slug`,
      [page.slug, page.page_type, page.title, page.meta_description, JSON.stringify(page.content)]
    );

    if (result.rows.length > 0) {
      console.log(`Seeded: ${page.slug}`);
    } else {
      console.log(`Skipped (already exists): ${page.slug}`);
    }
  }

  await pool.end();
}

run().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
