import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daftar Akun - Rekber.com',
  description: 'Buat akun baru untuk menggunakan layanan rekening bersama Rekber.com.',
  alternates: {
    canonical: '/auth/register',
  },
  openGraph: {
    title: 'Daftar Akun - Rekber.com',
    description: 'Buat akun baru untuk menggunakan layanan rekening bersama Rekber.com.',
    url: 'https://www.rekber.com/auth/register',
    siteName: 'Rekber.com',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Daftar Akun - Rekber.com',
    description: 'Buat akun baru untuk menggunakan layanan rekening bersama Rekber.com.',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}