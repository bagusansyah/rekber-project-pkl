import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan - Rekber.com',
  description: 'Ketentuan dan syarat di layanan Rekber.com.',
  alternates: {
    canonical: '/syarat-dan-ketentuan',
  },
  openGraph: {
    title: 'Syarat & Ketentuan - Rekber.com',
    description: 'Ketentuan dan syarat di layanan Rekber.com.',
    url: 'https://www.rekber.com/syarat-dan-ketentuan',
    siteName: 'Rekber.com',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Syarat & Ketentuan - Rekber.com',
    description: 'Ketentuan dan syarat di layanan Rekber.com.',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}