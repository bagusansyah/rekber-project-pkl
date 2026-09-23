import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Biaya Layanan - Rekber.com',
  description: 'Informasi lengkap mengenai struktur biaya layanan Rekber.com.',
  alternates: {
    canonical: '/fee',
  },
  openGraph: {
    title: 'Biaya Layanan - Rekber.com',
    description: 'Informasi lengkap mengenai struktur biaya layanan Rekber.com.',
    url: 'https://www.rekber.com/fee',
    siteName: 'Rekber.com',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Biaya Layanan - Rekber.com',
    description: 'Informasi lengkap mengenai struktur biaya layanan Rekber.com.',
  },
};

export default function FeeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}