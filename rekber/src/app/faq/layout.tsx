import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Rekber.com',
  description: 'Temukan jawaban atas pertanyaan yang sering diajukan mengenai Rekber.com.',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'FAQ - Rekber.com',
    description: 'Temukan jawaban atas pertanyaan yang sering diajukan mengenai Rekber.com.',
    url: 'https://www.rekber.com/faq',
    siteName: 'Rekber.com',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'FAQ - Rekber.com',
    description: 'Temukan jawaban atas pertanyaan yang sering diajukan mengenai Rekber.com.',
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}