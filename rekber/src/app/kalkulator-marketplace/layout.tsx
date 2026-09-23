import type { Metadata } from 'next';

const TITLE = 'Kalkulator Marketplace Shopee & TikTok Shop - Rekber.com';
const DESCRIPTION =
  'Hitung otomatis harga jual dan potongan komisi Shopee atau TikTok Shop, lalu bandingkan langsung dengan biaya jual pakai Rekber.com yang jauh lebih murah.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'kalkulator marketplace',
    'kalkulator harga jual',
    'kalkulator shopee',
    'kalkulator tiktok shop',
    'komisi shopee',
    'komisi tiktok shop',
    'biaya admin marketplace',
    'kalkulator rekber',
  ],
  alternates: {
    canonical: '/kalkulator-marketplace',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://www.rekber.com/kalkulator-marketplace',
    siteName: 'Rekber.com',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function KalkulatorMarketplaceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
