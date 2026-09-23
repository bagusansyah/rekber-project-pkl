import type { Metadata } from "next";
import { API_URL } from '@/constants/api';
import { cookies } from "next/headers";
import { decodeTransactionId } from "@/lib/transactionId";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const transactionId = decodeTransactionId(id);
  const cookieStore = await cookies(); // <-- tambahkan await
  const token = cookieStore.get("token")?.value || "";
  let title = "Detail Transaksi";
  let description = "Halaman detail transaksi Rekber.com";

  const requestUrl = `${API_URL}/transactions/${transactionId}`;
  console.log("Request metadata:", requestUrl);

  try {
    const res = await fetch(requestUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: "no-store"
    }); 
    if (res.ok) {
      const data = await res.json(); 
      if (data.transaction) {
        title = `Transaksi ${data.transaction.kode_transaksi} - ${data.transaction.title}`;
        description = data.transaction.notes || description;
      } else {
        console.log("Data transaksi kosong:", data);
      }
    } else {
      console.error("Gagal fetch metadata transaksi:", res.status, res.statusText);
    }
  } catch (err) {
    console.error("Error metadata transaksi:", err);
  }
 

  return {
    title,
    description,
  };
}

export default function TransactionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}