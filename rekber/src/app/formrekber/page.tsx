// app/formrekber/page.tsx
// import React, { Suspense } from 'react';
// import RekberForm from '../components/RekberForm';

// export default function Page() {
//   return (
//     <Suspense fallback={<div>Loading form...</div>}>
//       <RekberForm />
//     </Suspense>
//   );
// }

import { Suspense } from 'react';
import type { Metadata } from 'next';
import RekberForm from '../components/RekberForm';
import { Loader2 } from 'lucide-react';

const TITLE = 'Buat Transaksi Rekber - Rekening Bersama Aman | Rekber.com';
const DESCRIPTION =
  'Buat transaksi rekber dalam hitungan menit. Dana pembeli aman ditahan Rekber.com sampai barang/jasa diterima sesuai kesepakatan dengan penjual.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/formrekber',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://www.rekber.com/formrekber',
    siteName: 'Rekber.com',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function FormRekberPage() {
  return (
    // Suspense Boundary mutlak dibutuhkan di Next.js saat memanggil Client Component 
    // yang menggunakan useSearchParams()
    <Suspense 
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Memuat Formulir Transaksi...</p>
        </div>
      }
    >
      <RekberForm />
    </Suspense>
  );
}