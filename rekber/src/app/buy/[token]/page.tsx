"use client"
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from '@/components/ui/separator';
import { CreditCard, AlertTriangle, Calculator, ShieldCheck, BadgeCheck, MessageCircle, Store } from "lucide-react"
import NavBar from '@/app/components/slicings/navbar';
import Footer from '@/app/components/slicings/footer';
import { API_URL } from '@/constants/api';

interface ProductLinkSummary {
  title: string;
  notes: string | null;
  categ_id: number;
  product_images: string[] | null;
  total_amount: number;
  fee_amount: number;
  fee_by: string;
  seller_name: string;
  seller_is_verified: boolean;
  is_active: boolean;
}

const getCategoryName = (categId: number) => {
  switch (categId) {
    case 2: return "Produk Digital";
    case 3: return "Jasa dan Layanan";
    default: return "Barang Fisik";
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function ProductPaymentLinkPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [product, setProduct] = useState<ProductLinkSummary | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch(`${API_URL}/public/product-links/${token}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        setProduct(await res.json());
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchSummary();
  }, [token]);

  const handleContinue = async () => {
    setError('');
    setStarting(true);
    try {
      const res = await fetch(`${API_URL}/public/product-links/${token}/redeem`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal memulai transaksi, coba lagi.');
        return;
      }
      router.push(`/pay/${data.public_token}`);
    } catch {
      setError('Terjadi kesalahan, coba lagi.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white'>
      <NavBar />
      <main className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-5'>
        <div className='text-center mb-6'>
          <h1 className='text-xl font-bold text-slate-800'>Beli Produk</h1>
          <p className='text-sm text-slate-400 mt-1'>Bayar dengan aman melalui Rekber.com</p>
        </div>

        {loading && (
          <div className='flex flex-col items-center justify-center gap-4 py-20'>
            <div className='animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full'></div>
            <p className='text-sm text-slate-500 font-medium'>Memuat detail produk...</p>
          </div>
        )}

        {!loading && (notFound || !product) && (
          <div className='bg-white p-8 rounded-3xl shadow-sm border border-red-100 max-w-md w-full mx-auto text-center space-y-5'>
            <div className='w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto'>
              <AlertTriangle className='w-8 h-8' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-slate-800'>Link Tidak Ditemukan</h2>
              <p className='text-sm text-slate-500 leading-relaxed mt-2'>
                Link produk ini tidak ditemukan. Periksa kembali link yang Anda terima.
              </p>
            </div>
          </div>
        )}

        {!loading && product && !product.is_active && (
          <div className='bg-white p-8 rounded-3xl shadow-sm border border-amber-100 max-w-md w-full mx-auto text-center space-y-5'>
            <div className='w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto'>
              <AlertTriangle className='w-8 h-8' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-slate-800'>Produk Tidak Tersedia</h2>
              <p className='text-sm text-slate-500 leading-relaxed mt-2'>
                Link produk ini sudah tidak aktif. Silakan hubungi penjual.
              </p>
            </div>
          </div>
        )}

        {!loading && product && product.is_active && (
          <Card className='shadow-xl border-0 bg-white rounded-3xl overflow-hidden'>
            <CardContent className='p-6 sm:p-10 space-y-6'>
              <div>
                <h3 className='text-xl font-bold text-slate-800'>{product.title}</h3>
                <p className='text-sm text-slate-400 mt-1'>{getCategoryName(product.categ_id)}</p>
                {product.notes && (
                  <p className='text-sm text-slate-500 mt-3 leading-relaxed'>{product.notes}</p>
                )}
              </div>

              <div className='flex items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100'>
                <div className='w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0'>
                  <Store className='w-5 h-5' />
                </div>
                <div className='min-w-0'>
                  <p className='text-xs text-slate-400'>Dijual oleh</p>
                  <div className='flex items-center flex-wrap gap-1.5'>
                    <p className='font-bold text-slate-800 truncate'>{product.seller_name}</p>
                    {product.seller_is_verified && (
                      <span className='inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex-shrink-0'>
                        <BadgeCheck className='w-3.5 h-3.5' />
                        Penjual Terverifikasi
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Card className='bg-blue-50/50 border border-blue-100 rounded-3xl p-6 shadow-none'>
                <div className='flex items-center space-x-2 text-blue-700 mb-4'>
                  <Calculator className='h-5 w-5' />
                  <span className='font-bold text-base'>Rincian Pembayaran</span>
                </div>
                <div className='space-y-3.5 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-slate-500 font-medium'>Harga</span>
                    <span className='font-bold text-slate-800'>{formatCurrency(product.total_amount)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-500 font-medium'>Biaya Layanan</span>
                    <span className='font-bold text-orange-600'>{formatCurrency(product.fee_amount)}</span>
                  </div>
                  <Separator className='bg-blue-100/50' />
                  <div className='flex justify-between text-base pt-1'>
                    <span className='font-bold text-blue-800'>Total Dibayar</span>
                    <span className='font-extrabold text-lg text-blue-800'>
                      {formatCurrency(product.fee_by === 'buyer' ? product.total_amount + product.fee_amount : product.total_amount)}
                    </span>
                  </div>
                </div>
              </Card>

              {error && (
                <div className='text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 leading-relaxed'>
                  {error}
                </div>
              )}

              <Button
                onClick={handleContinue}
                disabled={starting}
                className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl h-14 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none'
              >
                {starting ? (
                  <>
                    <span className='animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full' />
                    Menyiapkan transaksi...
                  </>
                ) : (
                  <>
                    <CreditCard className='w-4 h-4' />
                    Lanjut ke Pembayaran
                  </>
                )}
              </Button>
              <p className='text-xs text-slate-400 text-center flex items-center justify-center gap-1'>
                <ShieldCheck className='w-3.5 h-3.5' />
                Dana Anda disimpan aman di rekening bersama sampai transaksi selesai
              </p>

              <p className='text-xs text-slate-400 text-center flex items-center justify-center gap-1.5 pt-2 border-t border-slate-100'>
                <MessageCircle className='w-3.5 h-3.5 flex-shrink-0' />
                Ada masalah dengan produk ini? <a href='/hubungi-kami' className='font-semibold text-blue-600 hover:underline'>Hubungi Rekber.com</a>
              </p>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
