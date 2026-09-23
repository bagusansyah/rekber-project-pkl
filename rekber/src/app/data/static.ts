import {
  Shield,
  Zap,
  HeadphonesIcon,
  CheckCircle,
  Clock,
  Users,
} from 'lucide-react'; 

export const landingText = {
  heading: 'Transaksi Aman',
  highlight: 'Tanpa Khawatir',
  subheading: 'Penipuan',
  description:
    'Rekber.com jembatan pembayaran antara pembeli & penjual yang terpercaya',
  button: 'Mulai sekarang',
  placeholderNominal: '800.000',
  currency: 'Rp',
  selectStatus: [
    { value: 'penjual', label: 'Saya Penjual' },
    { value: 'pembeli', label: 'Saya Pembeli' },
  ],
  selectCategory: [
    { value: 'jual-beli', label: 'Akun, kendaraan, gadget...' },
    { value: 'akun', label: 'Akun Media Sosial' },
    { value: 'mobil', label: 'Kendaraan' },
    { value: 'gadget', label: 'Gadget & Elektronik' },
    { value: 'jasa', label: 'Jasa & Layanan' },
  ],
  selectCurrency: [
    { value: 'idr', label: 'IDR', flag: '🇮🇩', color: 'text-red-500' },
  ],
  processSteps: [
    'Pembeli dan penjual setuju dengan syarat',
    'Pembeli membayar Rekber.com',
    'Penjual mengirim {category}',
    'Pembeli memeriksa & menyetujui {category}',
    'Rekber.com membayar penjual',
  ],
  processStepHighlight: [false, false, true, true, false],
  processStepBold: [false, false, false, false, true],
  processStepIconColor: 'bg-green-500',
};
export const features = [
  {
    icon: Shield,
    iconClass: 'w-8 h-8 text-blue-600',
    bgClass: 'bg-blue-100',
    title: '100% Aman',
    desc: 'Dana Anda dijamin aman dengan sistem escrow terpercaya dan terenkripsi',
  },
  {
    icon: Zap,
    iconClass: 'w-8 h-8 text-green-600',
    bgClass: 'bg-green-100',
    title: 'Proses Cepat',
    desc: 'Transaksi diproses dengan cepat dan efisien dalam hitungan menit',
  },
  {
    icon: HeadphonesIcon,
    iconClass: 'w-8 h-8 text-purple-600',
    bgClass: 'bg-purple-100',
    title: 'Support 24/7',
    desc: 'Tim support profesional siap membantu Anda kapan saja dibutuhkan',
  },
  {
    icon: CheckCircle,
    iconClass: 'w-8 h-8 text-orange-600',
    bgClass: 'bg-orange-100',
    title: 'Terpercaya',
    desc: 'Dipercaya oleh ribuan pengguna dengan rating kepuasan tinggi',
  },
  {
    icon: Clock,
    iconClass: 'w-8 h-8 text-red-600',
    bgClass: 'bg-red-100',
    title: 'Real-time',
    desc: 'Pantau status transaksi Anda secara real-time dengan notifikasi instant',
  },
  {
    icon: Users,
    iconClass: 'w-8 h-8 text-indigo-600',
    bgClass: 'bg-indigo-100',
    title: 'Komunitas',
    desc: 'Bergabung dengan komunitas trader dan seller terpercaya di Indonesia',
  },
];
 
export const footerStatic = {
  description:
    'Rekber.com adalah platform rekening bersama terpercaya untuk transaksi online yang aman dan terjamin.',
  sections: [
    {
      title: 'Layanan',
      items: [
        { label: 'Rekening Bersama', href: '/' },
        { label: 'Biaya Layanan', href: '/fee' },
        // { label: 'Rekber Account Identity (RAI)', href: 'rekber-account-identity' },
        { label: 'Cara Kerja', href: 'cara-kerja' },
        { label: 'Payment Link & Link Produk', href: '/payment-link' },
        { label: 'Kalkulator Marketplace', href: '/kalkulator-marketplace' }
      ],
    },
    {
      title: 'Perusahaan',
      items: [
        { label: 'Tentang Kami', href: '/tentang-kami' },
        { label: 'Syarat & Ketentuan', href: '/syarat-dan-ketentuan' },
        { label: 'Kebijakan Privasi', href: '/kebijakan-privasi' },
        { label: 'Kebijakan Refund', href: '/kebijakan-refund' },
      ],
    },
    {
      title: 'Bantuan',
      items: [
        { label: 'FAQ', href: '/faq' },
        { label: 'Laporkan Masalah', href: '/laporkan-masalah' }, 
        { label: 'Hubungi Kami', href: '/hubungi-kami' }, 
      ],
    },
  ],
  copyright: [ 
    { type: 'link', label: ' © 2025 REKBER.COM, ALL RIGHT RESERVED.', href: 'https://www.rekber.com//' },
    { type: 'link', label: ' PART OF PT REKBER TRANSAKSI AMAN', href: 'https://rta.rekber.com/' }, 
  ],
};
export const notFoundStatic = {
  title: 'Segera Hadir',
  description: [
    { type: 'highlight', text: 'Rekber.com' },
    ' masih dalam proses pengembangan, silakan kembali lagi nanti.',
  ],
  button: {
    label: 'Kembali ke Beranda',
    href: '/',
  },
};
