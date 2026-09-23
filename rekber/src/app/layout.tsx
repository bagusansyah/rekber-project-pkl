import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.rekber.com'),
  title: 'Rekber.com - Platform Rekening Bersama Terpercaya untuk Transaksi Online',
  description: 'Rekber.com adalah platform rekening bersama yang menjembatani transaksi online antara pembeli dan penjual dengan aman, transparan, dan biaya terjangkau.',
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/images/logo-apps.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/logo-apps.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/images/logo-apps.png',
    shortcut: '/images/logo-apps.png',
  },
  keywords: ['rekber', 'jasa rekber', 'rekening bersama', 'transaksi aman', 'escrow indonesia'],
  authors: [{ name: 'Rekber.com' }],
  creator: 'Rekber.com',
  publisher: 'Rekber.com',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://www.rekber.com',
    title: 'Rekber.com - Platform Rekening Bersama Terpercaya untuk Transaksi Online',
    description: 'Rekber.com adalah platform rekening bersama yang menjembatani transaksi online antara pembeli dan penjual dengan aman, transparan, dan biaya terjangkau.',
    siteName: 'Rekber.com',
    images: [
      {
        url: '/images/logo-og.jpg',
        width: 200,
        height: 200,
        alt: 'Rekber.com Logo',
      }
    ],
  }, 
};

// Organization + WebSite structured data: membantu Google mengenali
// Rekber.com sebagai entitas brand resmi (logo di hasil pencarian, sitelinks
// search box, dsb), bukan cuma sebagai kumpulan halaman lepas.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.rekber.com/#organization',
      name: 'Rekber.com',
      url: 'https://www.rekber.com',
      logo: 'https://www.rekber.com/images/logo-apps.png',
      description:
        'Rekber.com adalah platform rekening bersama yang menjembatani transaksi online antara pembeli dan penjual dengan aman, transparan, dan biaya terjangkau.',
      sameAs: [
        'https://www.facebook.com/rekbercom',
        'https://www.instagram.com/rekbercom',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.rekber.com/#website',
      name: 'Rekber.com',
      url: 'https://www.rekber.com',
      publisher: { '@id': 'https://www.rekber.com/#organization' },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='id'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}