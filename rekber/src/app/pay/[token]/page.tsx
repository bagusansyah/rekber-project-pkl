"use client"
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  ShieldCheck,
  BadgeCheck,
  AlertTriangle,
  Clock,
  Calculator,
  User,
  MessageCircle,
  Store,
} from "lucide-react"
import NavBar from '@/app/components/slicings/navbar';
import Footer from '@/app/components/slicings/footer';
import { API_URL } from '@/constants/api';
import { encodeTransactionId } from '@/lib/transactionId';

interface PublicTransactionSummary {
  id: number;
  kode_transaksi: string;
  title: string;
  notes: string | null;
  categ_id: number;
  total_amount: number;
  fee_amount: number;
  amount_paid: number;
  fee_by: string;
  status: string;
  seller_name: string;
  seller_is_verified: boolean;
  expired_at: string | null;
  is_claimed: boolean;
  is_expired: boolean;
  is_claimable: boolean;
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

export default function PublicPaymentLinkPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [transaction, setTransaction] = useState<PublicTransactionSummary | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [accountExists, setAccountExists] = useState<{ transactionId: number } | null>(null);

  const [loggedInSession, setLoggedInSession] = useState<{ token: string; name: string; email: string } | null>(null);
  const [useGuestForm, setUseGuestForm] = useState(false);

  useEffect(() => {
    const existingToken = localStorage.getItem('token');
    const existingName = localStorage.getItem('name');
    const existingEmail = localStorage.getItem('email');
    if (existingToken && existingName && existingEmail) {
      setLoggedInSession({ token: existingToken, name: existingName, email: existingEmail });
    }
  }, []);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch(`${API_URL}/public/transactions/${token}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setTransaction(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchSummary();
  }, [token]);

  const handlePayAsLoggedInUser = async () => {
    if (!loggedInSession) return;
    setFormError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/public/transactions/${token}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loggedInSession.token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Gagal memproses pembayaran, coba lagi.');
        return;
      }

      router.push(`/dashboard/transactions/${encodeTransactionId(data.transactionId)}`);
    } catch {
      setFormError('Terjadi kesalahan, coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setAccountExists(null);

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setFormError('Nama, email, dan nomor HP wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/public/transactions/${token}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() }),
      });
      const data = await res.json();

      if (res.status === 409 && data.code === 'ACCOUNT_EXISTS') {
        setAccountExists({ transactionId: data.transactionId });
        return;
      }

      if (!res.ok) {
        setFormError(data.error || 'Gagal memproses pembayaran, coba lagi.');
        return;
      }

      localStorage.setItem('user_id', data.id);
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', data.email);
      localStorage.setItem('name', data.name);
      Cookies.set('token', data.token, { expires: 5 });

      router.push(`/dashboard/transactions/${encodeTransactionId(data.transactionId)}`);
    } catch {
      setFormError('Terjadi kesalahan, coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white'>
      <NavBar />
      <main className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-5'>
        <div className='text-center mb-6'>
          <h1 className='text-xl font-bold text-slate-800'>Payment Link</h1>
          <p className='text-sm text-slate-400 mt-1'>Selesaikan pembayaran dengan aman melalui Rekber.com</p>
        </div>

        {loading && (
          <div className='flex flex-col items-center justify-center gap-4 py-20'>
            <div className='animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full'></div>
            <p className='text-sm text-slate-500 font-medium'>Memuat detail transaksi...</p>
          </div>
        )}

        {!loading && (notFound || !transaction) && (
          <div className='bg-white p-8 rounded-3xl shadow-sm border border-red-100 max-w-md w-full mx-auto text-center space-y-5'>
            <div className='w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto'>
              <AlertTriangle className='w-8 h-8' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-slate-800'>Link Tidak Valid</h2>
              <p className='text-sm text-slate-500 leading-relaxed mt-2'>
                Payment Link ini tidak ditemukan. Periksa kembali link yang Anda terima.
              </p>
            </div>
          </div>
        )}

        {!loading && transaction && transaction.is_expired && (
          <div className='bg-white p-8 rounded-3xl shadow-sm border border-amber-100 max-w-md w-full mx-auto text-center space-y-5'>
            <div className='w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto'>
              <Clock className='w-8 h-8' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-slate-800'>Link Sudah Kadaluarsa</h2>
              <p className='text-sm text-slate-500 leading-relaxed mt-2'>
                Payment Link ini sudah tidak berlaku. Silakan minta penjual membuat link baru.
              </p>
            </div>
          </div>
        )}

        {!loading && transaction && !transaction.is_expired && !transaction.is_claimable && (
          <div className='bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full mx-auto text-center space-y-5'>
            <div className='w-16 h-16 bg-slate-50 text-slate-500 rounded-full flex items-center justify-center mx-auto'>
              <ShieldCheck className='w-8 h-8' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-slate-800'>Link Sudah Digunakan</h2>
              <p className='text-sm text-slate-500 leading-relaxed mt-2'>
                Transaksi ini sudah diproses sebelumnya dan tidak bisa dibayar lagi lewat link ini.
              </p>
            </div>
          </div>
        )}

        {!loading && transaction && transaction.is_claimable && (
          <Card className='shadow-xl border-0 bg-white rounded-3xl overflow-hidden'>
            <CardContent className='p-6 sm:p-10 space-y-6'>
              <div>
                <h3 className='text-xl font-bold text-slate-800'>{transaction.title}</h3>
                <p className='text-sm text-slate-400 mt-1'>{getCategoryName(transaction.categ_id)}</p>
                {transaction.notes && (
                  <p className='text-sm text-slate-500 mt-3 leading-relaxed'>{transaction.notes}</p>
                )}
              </div>

              <div className='flex items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100'>
                <div className='w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0'>
                  <Store className='w-5 h-5' />
                </div>
                <div className='min-w-0'>
                  <p className='text-xs text-slate-400'>Dijual oleh</p>
                  <div className='flex items-center flex-wrap gap-1.5'>
                    <p className='font-bold text-slate-800 truncate'>{transaction.seller_name}</p>
                    {transaction.seller_is_verified && (
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
                    <span className='font-bold text-slate-800'>{formatCurrency(transaction.total_amount)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-500 font-medium'>Biaya Layanan</span>
                    <span className='font-bold text-orange-600'>{formatCurrency(transaction.fee_amount)}</span>
                  </div>
                  <Separator className='bg-blue-100/50' />
                  <div className='flex justify-between text-base pt-1'>
                    <span className='font-bold text-blue-800'>Total Dibayar</span>
                    <span className='font-extrabold text-lg text-blue-800'>
                      {formatCurrency(transaction.amount_paid)}
                    </span>
                  </div>
                </div>
              </Card>

              {formError && (
                <div className='text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 leading-relaxed'>
                  {formError}
                </div>
              )}

              {accountExists ? (
                <div className='bg-blue-50/50 border border-blue-100 rounded-3xl p-6 space-y-4'>
                  <p className='text-sm text-slate-600 leading-relaxed'>
                    Email ini sudah terdaftar di Rekber.com. Silakan login untuk melanjutkan pembayaran transaksi ini.
                  </p>
                  <Button
                    className='w-full bg-[#2b66f6] hover:bg-[#1a55e5] text-white font-bold rounded-2xl h-14 shadow-lg shadow-blue-500/20'
                    onClick={() => router.push(`/auth/login?next=/dashboard/transactions/${encodeTransactionId(accountExists.transactionId)}`)}
                  >
                    Login untuk Melanjutkan
                  </Button>
                </div>
              ) : loggedInSession && !useGuestForm ? (
                <div className='bg-blue-50/50 border border-blue-100 rounded-3xl p-6 space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0'>
                      <User className='w-5 h-5' />
                    </div>
                    <div>
                      <p className='text-sm font-bold text-slate-800'>{loggedInSession.name}</p>
                      <p className='text-xs text-slate-500'>{loggedInSession.email}</p>
                    </div>
                  </div>
                  <p className='text-sm text-slate-500'>Anda sudah login. Lanjutkan bayar transaksi ini menggunakan akun di atas?</p>

                  <Button
                    onClick={handlePayAsLoggedInUser}
                    disabled={submitting}
                    className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl h-14 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none'
                  >
                    {submitting ? (
                      <>
                        <span className='animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full' />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CreditCard className='w-4 h-4' />
                        Bayar Sekarang
                      </>
                    )}
                  </Button>
                  <button
                    type='button'
                    onClick={() => setUseGuestForm(true)}
                    className='w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors'
                  >
                    Bukan Anda? Bayar dengan data lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className='space-y-5'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-xl font-bold text-slate-800'>Data Pembayar</h3>
                    {loggedInSession && (
                      <button
                        type='button'
                        onClick={() => setUseGuestForm(false)}
                        className='text-xs text-blue-600 hover:text-blue-700 font-medium'
                      >
                        Pakai akun {loggedInSession.name}
                      </button>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='name' className='text-sm font-semibold text-slate-700'>Nama Lengkap</Label>
                    <Input
                      id='name'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder='Nama Anda'
                      className='h-12 border-slate-200 bg-white rounded-2xl px-4'
                      disabled={submitting}
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='email' className='text-sm font-semibold text-slate-700'>Email</Label>
                    <Input
                      id='email'
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder='email@contoh.com'
                      className='h-12 border-slate-200 bg-white rounded-2xl px-4'
                      disabled={submitting}
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='phone' className='text-sm font-semibold text-slate-700'>Nomor HP</Label>
                    <Input
                      id='phone'
                      type='tel'
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder='08xxxxxxxxxx'
                      className='h-12 border-slate-200 bg-white rounded-2xl px-4'
                      disabled={submitting}
                      required
                    />
                  </div>

                  <Button
                    type='submit'
                    disabled={submitting}
                    className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl h-14 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none'
                  >
                    {submitting ? (
                      <>
                        <span className='animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full' />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CreditCard className='w-4 h-4' />
                        Bayar Sekarang
                      </>
                    )}
                  </Button>
                  <p className='text-xs text-slate-400 text-center'>
                    Dengan melanjutkan, akun Rekber.com akan dibuat otomatis menggunakan data di atas
                    agar Anda bisa memantau transaksi ini setelah membayar.
                  </p>
                </form>
              )}

              <p className='text-xs text-slate-400 text-center flex items-center justify-center gap-1.5 pt-2 border-t border-slate-100'>
                <MessageCircle className='w-3.5 h-3.5 flex-shrink-0' />
                Ada masalah dengan transaksi ini? <a href='/hubungi-kami' className='font-semibold text-blue-600 hover:underline'>Hubungi Rekber.com</a>
              </p>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
