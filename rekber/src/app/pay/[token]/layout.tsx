import type { Metadata } from "next";
import { API_URL } from '@/constants/api';

export const runtime = 'edge';

const getCategoryName = (categId: number) => {
  switch (categId) {
    case 2: return "Produk Digital";
    case 3: return "Jasa dan Layanan";
    default: return "Barang Fisik";
  }
};

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;

  let title = "Payment Link - Rekber.com";
  let description = "Bayar transaksi dengan aman melalui Rekber.com.";

  try {
    const res = await fetch(`${API_URL}/public/transactions/${token}`, { cache: "no-store" });
    if (res.ok) {
      const transaction = await res.json();
      if (transaction && transaction.title) {
        const categoryLabel = getCategoryName(transaction.categ_id);
        title = `${transaction.title} - Payment Link Rekber.com`;
        description = `${categoryLabel}: ${transaction.title}${transaction.notes ? ` - ${transaction.notes}` : ''}. Bayar dengan aman melalui Rekber.com.`;
      }
    }
  } catch (err) {
    console.error("Error metadata payment link:", err);
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'id_ID',
      siteName: 'Rekber.com',
      images: [
        {
          url: '/images/logo-og.jpg',
          width: 200,
          height: 200,
          alt: 'Rekber.com Logo',
        },
      ],
    },
  };
}

export default function PayTokenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
