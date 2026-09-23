import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan Verifikasi Identitas (KYC) - Rekber.com',
  description: 'Syarat dan ketentuan proses verifikasi identitas (KYC) di layanan Rekber.com.',
  alternates: {
    canonical: '/syarat-dan-ketentuan-kyc',
  },
  openGraph: {
    title: 'Syarat & Ketentuan Verifikasi Identitas (KYC) - Rekber.com',
    description: 'Syarat dan ketentuan proses verifikasi identitas (KYC) di layanan Rekber.com.',
    url: 'https://www.rekber.com/syarat-dan-ketentuan-kyc',
    siteName: 'Rekber.com',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Syarat & Ketentuan Verifikasi Identitas (KYC) - Rekber.com',
    description: 'Syarat dan ketentuan proses verifikasi identitas (KYC) di layanan Rekber.com.',
  },
};

export default function KycTermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
