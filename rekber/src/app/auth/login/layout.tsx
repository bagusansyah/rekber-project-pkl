import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Masuk - Rekber.com',
  description: 'Masuk ke akun Rekber.com Anda untuk mengakses layanan.',
  alternates: {
    canonical: '/auth/login',
  },
  openGraph: {
    title: 'Masuk - Rekber.com',
    description: 'Masuk ke akun Rekber.com Anda untuk mengakses layanan.',
    url: 'https://www.rekber.com/auth/login',
    siteName: 'Rekber.com',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Masuk - Rekber.com',
    description: 'Masuk ke akun Rekber.com Anda untuk mengakses layanan.',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}