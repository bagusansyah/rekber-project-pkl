'use client';

import type React from 'react';
import { AppSidebar } from '@/app/components/dashboard/app-sidebar';
import { DashboardHeader } from '@/app/components/dashboard/dashboard-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import BottomNav from '@/app/components/mobile/bottom-nav';
import { useBankValidation } from '@/hooks/useBankValidation';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Calculator, Tag, CheckCircle, User, ShoppingCart, AlertTriangle, ChevronDown, ChevronUp, ShieldCheck, ShieldAlert, Copy, ImagePlus, X } from 'lucide-react';
import NextImage from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { API_URL, getToken } from '@/constants/api';
import { encodeTransactionId } from '@/lib/transactionId';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

import NavBar from '../components/slicings/navbar';
import Footer from '../components/slicings/footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Toaster, toast } from 'sonner';

interface Voucher {
  id: number;
  code: string;
  discount_amount: number;
  discount_type: 'fixed' | 'percentage';
  min_transaction?: number;
  max_discount?: number;
  description?: string;
  expires_at?: string;
  is_active: boolean;
}

export const runtime = "edge";

const MAX_PRODUCT_IMAGES = 10;

// --- 1. KOMPONEN LOGIKA UTAMA ---
function RekberFormContent() {
  const { isLoading: isBankLoading, isBankValid, missingPhone, missingBank } = useBankValidation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [buyerContactInput, setBuyerContactInput] = useState('');
  const [foundUser, setFoundUser] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    is_verified?: boolean;
    is_partnership?: boolean;
    partnership_percentage?: number;
    partnership_expires_at?: string | null;
  } | null>(null);
  const [isSearchingBuyer, setIsSearchingBuyer] = useState(false);
  const [searchDone, setSearchDone] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [role, setRole] = useState('pembeli');
  const [product, setProduct] = useState('');
  const [productImages, setProductImages] = useState<File[]>([]);
  const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [fee, setFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const feeBy = 'buyer';
  const isShipping = 'tidak';
  const [workDays, setWorkDays] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    is_partnership?: boolean;
    partnership_percentage?: number;
    partnership_expires_at?: string | null;
  } | null>(null);

  // Voucher states
  const [showVoucherInput, setShowVoucherInput] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState('');

  const token = getToken();

  const counterpartyLabel = role === 'pembeli' ? 'Penjual' : 'Pembeli';

  const notesPlaceholder =
    category === '3'
      ? 'Cantumkan cakupan pekerjaan, jumlah revisi, durasi pengerjaan, dan garansi (jika ada)'
      : category === '2'
      ? 'Cantumkan jenis akun/lisensi, masa berlaku, cara pengiriman, dan garansi (jika ada)'
      : 'Cantumkan kondisi barang, ukuran/warna, kelengkapan, dan garansi (jika ada)';

  const isSellerPartnership = role === 'penjual'
    ? !!currentUser?.is_partnership
    : !!foundUser?.is_partnership;

  const sellerPartnershipPercentage = role === 'penjual'
    ? Number(currentUser?.partnership_percentage || 0)
    : Number(foundUser?.partnership_percentage || 0);

  const partnershipFee = isSellerPartnership ? Math.round((fee * sellerPartnershipPercentage) / 100) : 0;

  const calculateFee = (inputAmount: number) => {
    if (inputAmount <= 0) return 0;
    const hundredMillion = 100000000;
    let calculatedFee = 0;
    if (inputAmount <= hundredMillion) {
      calculatedFee = inputAmount * 0.01;
    } else {
      calculatedFee = inputAmount * 0.005;
    }
    return Math.max(calculatedFee, 10000);
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    setAmount(numericValue);
  };

  const handleProductImagesChange = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const remainingSlots = MAX_PRODUCT_IMAGES - productImages.length;
    if (remainingSlots <= 0) {
      toast.error(`Maksimal ${MAX_PRODUCT_IMAGES} foto produk`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} bukan file gambar`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} melebihi 5MB`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > remainingSlots) {
      toast.error(`Hanya ${remainingSlots} foto lagi yang bisa ditambahkan (maks. ${MAX_PRODUCT_IMAGES})`);
    }

    setProductImages((prev) => [...prev, ...validFiles].slice(0, MAX_PRODUCT_IMAGES));
  };

  const handleRemoveProductImage = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const urls = productImages.map((file) => URL.createObjectURL(file));
    setProductImagePreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [productImages]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, '');
    return new Intl.NumberFormat('id-ID').format(Number.parseInt(number) || 0);
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Masukkan kode voucher');
      return;
    }

    const parsedAmount = Number.parseInt(amount) || 0;
    if (parsedAmount < 10000) {
      setVoucherError('Silakan masukkan jumlah transaksi terlebih dahulu');
      return;
    }

    setIsApplyingVoucher(true);
    setVoucherError('');

    try {
      const res = await fetch(`${API_URL}/transactions/apply-voucher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          voucher_code: voucherCode,
          total_amount: parsedAmount
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Voucher tidak valid');
      }

      setAppliedVoucher(data.data);
      setVoucherDiscount(data.data.discount_amount || data.data.value || 0);
      setVoucherError('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setVoucherError(err.message);
      } else {
        setVoucherError('Gagal menerapkan voucher');
      }
      setAppliedVoucher(null);
      setVoucherDiscount(0);
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherDiscount(0);
    setVoucherCode('');
    setVoucherError('');
  };

  useEffect(() => {
    const fetchMyProfile = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/profile-detail`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setCurrentUser({
              email: data.profile.email,
              phone: data.profile.phone,
              name: data.profile.name,
              is_partnership: data.profile.is_partnership || false,
              partnership_percentage: parseFloat(data.profile.partnership_percentage || 0),
              partnership_expires_at: data.profile.partnership_expires_at || null
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch my profile:", err);
      }
    };
    fetchMyProfile();
  }, [token]);

  useEffect(() => {
    const parsedAmount = Number.parseInt(amount) || 0;
    const calculatedFee = calculateFee(parsedAmount);
    setFee(calculatedFee);
    setTotalAmount(parsedAmount);

    // Otomatis reset voucher HANYA jika pengguna iseng mengubah harga barang
    // setelah voucher diterapkan (karena perubahan harga bisa membatalkan syarat voucher).
    setAppliedVoucher(null);
    setVoucherDiscount(0);
    setVoucherCode('');
    setVoucherError('');
    
    // KOREKSI FATAL: Hapus 'appliedVoucher' dari array ini agar tidak memicu infinite reset loop
  }, [amount]);

  // --- REKAYASA STATE MANAGEMENT BERDASARKAN URL ---
  useEffect(() => {
    const productParam = searchParams.get('product') || '';
    const amountParam = searchParams.get('amount') || '';
    const roleParam = searchParams.get('role');

    setProduct(productParam);
    setAmount(amountParam);

    if (roleParam === 'penjual' || roleParam === 'pembeli') {
      setRole(roleParam);
      setCurrentStep(1); // Langsung bypass ke step isian, abaikan halaman pilih peran
    } else {
      setCurrentStep(0); // Tampilkan halaman pilih peran jika tidak ada parameter
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMessage('');
    const parsedAmount = Number.parseInt(amount) || 0;
    if (parsedAmount < 10000) {
      setErrorMessage('Minimum transaksi adalah Rp 10.000');
      setIsLoading(false);
      return;
    }

    const targetContact = buyerContactInput.trim().toLowerCase();
    if (currentUser && targetContact) {
      if (
        (currentUser.email && targetContact === currentUser.email.toLowerCase()) ||
        (currentUser.phone && targetContact === currentUser.phone)
      ) {
        setErrorMessage('Tidak dapat membuat transaksi dengan akun sendiri');
        setIsLoading(false);
        return;
      }
    }
    try {
      const formData = new FormData();
      formData.append('name', product);
      formData.append('email', buyerContactInput);
      formData.append('role', role);
      formData.append('total_amount', String(totalAmount));
      formData.append('notes', notes);
      formData.append('fee_by', feeBy);
      formData.append('status', 'wait_payment');
      formData.append('categ_id', category);
      formData.append('is_shipping', isShipping);
      if (category === '3' && workDays) formData.append('work_duration', workDays);
      if (appliedVoucher?.code) formData.append('voucher_code', appliedVoucher.code);
      formData.append('discount_amount', String(Math.min(voucherDiscount || 0, fee)));
      productImages.forEach((file) => formData.append('product_images', file));

      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error) {
          setShowProfileDialog(true);
          return;
        }
        throw new Error(data.error || 'Gagal membuat transaksi');
      }
      if (data.transaction.id) {
        router.push(`/dashboard/transactions/${encodeTransactionId(data.transaction.id)}`);
      } else {
        router.push('/dashboard/transactions');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Terjadi kesalahan');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const maskName = (name = '') => {
    if (!name) return '';
    return name
      // .split(' ')
      // .map((part) => {
      //   if (part.length <= 2) return part[0] + '*'.repeat(Math.max(0, part.length - 1));
      //   return part[0] + '*'.repeat(Math.max(0, part.length - 2)) + part.slice(-1);
      // })
      // .join(' ');
  };

  useEffect(() => {
    if (!buyerContactInput.trim()) {
      setFoundUser(null);
      setIsSearchingBuyer(false);
      setSearchDone(false);
      return;
    }

    const id = setTimeout(async () => {
      setIsSearchingBuyer(true);
      setSearchDone(false);
      try {
        const res = await fetch(`${API_URL}/usersearch?q=${encodeURIComponent(buyerContactInput)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        
        if (!res.ok) {
          setFoundUser(null);
          return;
        }

        const data = await res.json();
        const user = Array.isArray(data) ? data[0] : data.user || data;

        if (user && (user.name || user.email || user.phone)) {
          setFoundUser({
            name: user.name,
            email: user.email,
            phone: user.phone,
            is_verified: !!user.is_verified,
            is_partnership: user.is_partnership || false,
            partnership_percentage: parseFloat(user.partnership_percentage || 0),
            partnership_expires_at: user.partnership_expires_at || null
          });
        } else {
          setFoundUser(null);
        }
      } catch (err) {
        console.error("Koneksi API gagal.", err);
        setFoundUser(null);
      } finally {
        setIsSearchingBuyer(false);
        setSearchDone(true);
      }
    }, 450);

    return () => clearTimeout(id);
}, [buyerContactInput, token]);



  const copyPhoneNumber = (phone: string | null | undefined) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    toast.success('Nomor HP berhasil disalin!');
  };

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setBuyerContactInput('');
    setFoundUser(null);
    setSearchDone(false);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return role === 'pembeli' || role === 'penjual';
      case 1:
        const parsedAmount = Number.parseInt(amount) || 0;
        const isProductValid = product.trim() !== '';
        const isAmountValid = parsedAmount >= 10000;
        const isCategoryValid = category.trim() !== '';
        const isWorkDaysValid = category === '3' ? (Number.parseInt(workDays) > 0) : true;
        const isImageValid = productImages.length > 0;
        const isNotesValid = notes.trim() !== '';
        return isProductValid && isAmountValid && isCategoryValid && isWorkDaysValid && isImageValid && isNotesValid;
      case 2:
        return foundUser !== null;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      if (currentStep === 3) {
        handleSubmit();
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    const hasRoleParam = searchParams.get('role');
    // Jika ada parameter peran dari URL, jangan pernah kembalikan pengguna ke step 0 (Pemilihan Peran)
    if (currentStep === 0 || (currentStep === 1 && hasRoleParam)) {
      router.push('/dashboard/transactions');
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const steps = [
    { id: 0, title: 'Pilih Peran' },
    { id: 1, title: 'Produk' },
    { id: 2, title: counterpartyLabel },
    { id: 3, title: 'Ringkasan' },
  ];

  // Jika sedang memvalidasi bank, tahan rendering form
  // 1. PENAHAN LAYAR LAPIS 1: Loading pengecekan bank
  if (isBankLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full"></div>
          <p className="text-sm text-slate-500 font-medium">Memeriksa persyaratan akun...</p>
        </div>
      </div>
    );
  }

  // 2. PENAHAN LAYAR LAPIS 2: Peringatan Profil Belum Lengkap (No HP dan/atau Rekening Bank)
  if (!isBankValid) {
    const profileGap = missingPhone && missingBank
      ? {
          title: 'Profil Belum Lengkap',
          description: 'Anda wajib melengkapi Nomor HP dan Rekening Bank terlebih dahulu untuk membuat transaksi baru.',
          cta: 'Lengkapi Profil Sekarang',
          target: '/dashboard/profile#profile',
        }
      : missingPhone
      ? {
          title: 'Nomor HP Belum Diisi',
          description: 'Anda wajib melengkapi Nomor HP terlebih dahulu untuk membuat transaksi baru.',
          cta: 'Isi Nomor HP Sekarang',
          target: '/dashboard/profile#profile',
        }
      : {
          title: 'Rekening Belum Lengkap',
          description: 'Anda wajib melengkapi data Rekening Bank terlebih dahulu untuk membuat transaksi baru.',
          cta: 'Isi Rekening Sekarang',
          target: '/dashboard/profile#bank',
        };

    return (
      <SidebarProvider>
        <div className='flex min-h-screen w-full bg-gray-50 relative'>

          {/* Sidebar Desktop */}
          <div className="hidden md:block">
            <AppSidebar />
          </div>

          <div className='flex-1 flex flex-col min-w-0'>
            {/* Header Atas (Lonceng & Profil) */}
            <DashboardHeader />

            {/* Konten Peringatan Utama */}
            <main className="p-4 pb-28 md:pb-4 flex-1 flex items-center justify-center">
            <div className="-mt-24 bg-white p-8 rounded-3xl shadow-sm border border-orange-100 max-w-md w-full text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{profileGap.title}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed mt-2">
                    Sistem menolak akses Anda. {profileGap.description}
                  </p>
                </div>
                <Button
                  onClick={() => router.push(profileGap.target)}
                  className="w-full bg-[#2b66f6] hover:bg-[#1a55e5] text-white rounded-2xl h-12 font-bold shadow-lg shadow-blue-500/20"
                >
                  {profileGap.cta}
                </Button>
              </div>
            </main>
          </div>

          {/* Navigasi Bawah Khusus Mobile */}
          <div className="md:hidden block">
            <BottomNav />
          </div>

        </div>
      </SidebarProvider>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white'>
      <Toaster richColors position='top-center' />
      <NavBar />
      <main className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-5'>

        <div className='relative w-full max-w-xl mx-auto mb-0 px-2'>
          <div className='flex justify-between items-center text-center relative z-10'>
            {steps.map((step, idx) => {
              const isCompleted = idx < currentStep;
              const isActive = idx === currentStep;
              return (
                <button
                  key={step.id}
                  type='button'
                  onClick={() => {
                    if (idx < currentStep) {
                      setCurrentStep(idx);
                    }
                  }}
                  disabled={idx >= currentStep}
                  className={`flex-1 text-xs sm:text-sm font-semibold transition-all duration-300 pb-3 cursor-pointer ${isActive || isCompleted ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium'
                    }`}
                >
                  {step.title}
                </button>
              );
            })}
          </div>
          <div className='absolute bottom-0 left-0 w-full h-[4px] bg-slate-100 rounded-full overflow-hidden'>
            <div
              className='h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-full transition-all duration-500 ease-out'
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className='shadow-xl border-0 bg-white rounded-3xl overflow-hidden mt-6'>
          <CardContent className='p-6 sm:p-10'>

            {currentStep === 0 && (
              <div className='space-y-6'>
                <div className='text-center mb-6'>
                  <h3 className='text-xl font-bold text-slate-800'>Pilih Peran</h3>
                  <p className='text-sm text-slate-400 mt-1'>Silakan pilih peran Anda dalam transaksi ini</p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div
                    onClick={() => handleRoleSelect('pembeli')}
                    className={`relative flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${role === 'pembeli'
                      ? 'border-blue-600 bg-white shadow-sm'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                  >
                    <div className='w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-blue-600'>
                      <User className='w-6 h-6' />
                    </div>
                    <h4 className='text-lg font-bold text-slate-800'>Pembeli</h4>
                    <p className='text-sm text-slate-500 mt-1 leading-relaxed'>
                      Saya ingin melakukan pembayaran
                    </p>
                    {role === 'pembeli' && (
                      <span className='absolute top-4 right-4 bg-blue-600 text-white rounded-full p-1'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </span>
                    )}
                  </div>

                  <div
                    onClick={() => handleRoleSelect('penjual')}
                    className={`relative flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${role === 'penjual'
                      ? 'border-blue-600 bg-white shadow-sm'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                  >
                    <div className='w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center mb-4 text-purple-600'>
                      <ShoppingCart className='w-6 h-6' />
                    </div>
                    <h4 className='text-lg font-bold text-slate-800'>Penjual</h4>
                    <p className='text-sm text-slate-500 mt-1 leading-relaxed'>
                      Saya ingin menerima pembayaran
                    </p>
                    {role === 'penjual' && (
                      <span className='absolute top-4 right-4 bg-blue-600 text-white rounded-full p-1'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className='space-y-6'>
                <h3 className='text-xl font-bold text-slate-800'>Informasi {counterpartyLabel}</h3>

                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label className='text-sm font-semibold text-slate-700'>Email / No HP {counterpartyLabel} <span className='text-red-500'>*</span></Label>
                    <Input
                      type='text'
                      placeholder={`Masukkan email atau no. HP ${counterpartyLabel.toLowerCase()}`}
                      value={buyerContactInput}
                      onChange={(e) => setBuyerContactInput(e.target.value)}
                      className='h-12 border-slate-200 bg-white rounded-2xl px-4'
                    />
                    {isSearchingBuyer && <div className="text-xs text-blue-500 animate-pulse mt-1">Mencari {counterpartyLabel.toLowerCase()}...</div>}
                  </div>

                  {foundUser ? (
                    <div className='p-5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-4 mt-4'>
                      <div className='flex items-center justify-between flex-wrap gap-2'>
                        <h4 className='text-sm font-bold text-blue-800 flex items-center gap-1.5'>
                          <CheckCircle className='w-4 h-4 text-blue-600' />
                          Data {counterpartyLabel} Ditemukan:
                        </h4>
                        {foundUser.is_verified ? (
                          <span className='inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full'>
                            <ShieldCheck className='w-3.5 h-3.5' /> Terverifikasi
                          </span>
                        ) : (
                          <span className='inline-flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full'>
                            <ShieldAlert className='w-3.5 h-3.5' /> Belum Verifikasi
                          </span>
                        )}
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold text-slate-600'>Nama Lengkap</Label>
                        <Input
                          type='text'
                          value={maskName(foundUser.name)}
                          disabled
                          className='h-10 border-slate-200 bg-slate-50 rounded-xl px-3 text-sm'
                        />
                      </div>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                        <div className='space-y-1.5'>
                          <Label className='text-xs font-semibold text-slate-600'>Email</Label>
                          <Input
                            type='text'
                            value={foundUser.email || ''}
                            disabled
                            className='h-10 border-slate-200 bg-slate-50 rounded-xl px-3 text-sm'
                          />
                        </div>
                        <div className='space-y-1.5'>
                          <Label className='text-xs font-semibold text-slate-600'>Nomor Telepon</Label>
                          <Input
                            type='text'
                            value={foundUser.phone || ''}
                            disabled
                            className='h-10 border-slate-200 bg-slate-50 rounded-xl px-3 text-sm'
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    searchDone && !isSearchingBuyer && buyerContactInput.trim() !== '' && (
                      <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
                        {counterpartyLabel} tidak ditemukan. Pastikan email atau nomor HP {counterpartyLabel.toLowerCase()} terdaftar di Rekber.com.
                      </p>
                    )
                  )}
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className='space-y-5'>
                <h3 className='text-xl font-bold text-slate-800'>Detail Produk / Jasa</h3>

                <div className='space-y-2'>
                  <Label htmlFor='product' className='text-sm font-semibold text-slate-700'>
                    Nama Barang / Jasa <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='product'
                    type='text'
                    placeholder='Nama barang atau jasa'
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className='h-12 border-slate-200 bg-white rounded-2xl px-4'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='amount' className='text-sm font-semibold text-slate-700'>
                    Nilai Transaksi <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='amount'
                    inputMode='numeric'
                    value={formatNumber(amount)}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder='10.000 (minimum)'
                    className='h-12 border-slate-200 bg-white rounded-2xl px-4'
                  />
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-slate-700'>
                    Kategori <span className='text-red-500'>*</span>
                  </Label>
                  <div className='flex flex-wrap gap-3'>
                    {[
                      { value: '1', label: 'Barang Fisik', icon: '📦' },
                      { value: '3', label: 'Jasa', icon: '🔧' },
                      { value: '2', label: 'Digital', icon: '💻' },
                    ].map((option) => {
                      const isSelected = category === option.value;
                      return (
                        <button
                          key={option.value}
                          type='button'
                          onClick={() => setCategory(option.value)}
                          className={`flex items-center gap-2 h-12 px-5 rounded-full border text-sm font-semibold transition-colors ${
                            isSelected
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <span>{option.icon}</span>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {category === '3' && (
                  <div className='space-y-2'>
                    <Label htmlFor='workDays' className='text-sm font-semibold text-slate-700'>
                      Lama Waktu Pengerjaan (Hari) <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='workDays'
                      type='number'
                      min={1}
                      placeholder='Contoh: 3'
                      value={workDays}
                      onChange={e => setWorkDays(e.target.value)}
                      className='h-12 border-slate-200 bg-white rounded-2xl px-4'
                    />
                  </div>
                )}

                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-slate-700'>
                    Foto Produk <span className='text-red-500'>*</span>
                    <span className='text-slate-400 font-normal'> (maks. {MAX_PRODUCT_IMAGES})</span>
                  </Label>
                  <input
                    id='product-image-input'
                    type='file'
                    accept='image/*'
                    multiple
                    onChange={(e) => {
                      handleProductImagesChange(e.target.files);
                      e.target.value = '';
                    }}
                    className='hidden'
                  />
                  <div className='flex flex-wrap gap-3'>
                    {productImagePreviews.map((src, idx) => (
                      <div key={idx} className='relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200'>
                        <NextImage
                          src={src}
                          alt={`Preview produk ${idx + 1}`}
                          fill
                          className='object-cover'
                          unoptimized
                        />
                        <button
                          type='button'
                          onClick={() => handleRemoveProductImage(idx)}
                          className='absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors'
                          aria-label={`Hapus foto produk ${idx + 1}`}
                        >
                          <X className='w-3 h-3' />
                        </button>
                      </div>
                    ))}
                    {productImages.length < MAX_PRODUCT_IMAGES && (
                      <button
                        type='button'
                        onClick={() => document.getElementById('product-image-input')?.click()}
                        className='w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors'
                      >
                        <ImagePlus className='w-6 h-6' />
                        <span className='text-xs font-medium'>Tambah</span>
                      </button>
                    )}
                  </div>
                  {productImages.length > 0 && (
                    <p className='text-xs text-slate-400'>{productImages.length}/{MAX_PRODUCT_IMAGES} foto dipilih</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='notes' className='text-sm font-semibold text-slate-700'>
                    Deskripsi <span className='text-red-500'>*</span>
                  </Label>
                  <Textarea
                    id='notes'
                    placeholder={notesPlaceholder}
                    className='min-h-[90px] border-slate-200 bg-white rounded-2xl p-4 resize-none'
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>

                {/* --- TOGGLE VOUCHER SECTION --- */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowVoucherInput(!showVoucherInput)}
                    className="flex items-center justify-between w-full py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-blue-500" />
                      Punya Kode Voucher? (Opsional)
                    </span>
                    {showVoucherInput ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  {showVoucherInput && (
                    <div className='space-y-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-200'>
                      {!appliedVoucher ? (
                        <div className='flex gap-2'>
                          <Input
                            id='voucher'
                            type='text'
                            placeholder='Masukkan kode voucher'
                            value={voucherCode}
                            onChange={(e) => {
                              setVoucherCode(e.target.value.toUpperCase());
                              setVoucherError('');
                            }}
                            className='h-12 border-slate-200 bg-white rounded-2xl px-4'
                          />
                          <Button
                            type='button'
                            onClick={handleApplyVoucher}
                            disabled={isApplyingVoucher || !voucherCode.trim() || !amount}
                            className='h-12 px-6 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold transition-colors shadow-sm'
                          >
                            {isApplyingVoucher ? 'Mengecek...' : 'Terapkan'}
                          </Button>
                        </div>
                      ) : (
                        <div className='flex items-center justify-between p-3.5 bg-green-50 border border-green-200 rounded-2xl'>
                          <div className='flex items-center gap-2'>
                            <CheckCircle className='h-4 w-4 text-green-600' />
                            <span className='text-sm font-medium text-green-800'>
                              Voucher {appliedVoucher.code} diterapkan
                            </span>
                          </div>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={handleRemoveVoucher}
                            className='text-red-600 border-red-200 hover:bg-red-50 rounded-xl bg-white'
                          >
                            Hapus
                          </Button>
                        </div>
                      )}
                      {voucherError && (
                        <p className='text-sm text-red-600 mt-1 font-medium'>{voucherError}</p>
                      )}
                    </div>
                  )}
                </div>

                {amount && Number.parseInt(amount) > 0 && (
                  <Card className='bg-blue-50/50 border border-blue-100 rounded-3xl p-6 shadow-none'>
                    <div className='flex items-center space-x-2 text-blue-700 mb-4'>
                      <Calculator className='h-5 w-5' />
                      <span className='font-bold text-base'>Kalkulasi Rincian Biaya</span>
                    </div>
                    <div className='space-y-3.5 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-slate-500 font-medium'>Jumlah Transaksi</span>
                        <span className='font-bold text-slate-800'>
                          {formatCurrency(Number.parseInt(amount))}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-slate-500 font-medium flex items-center gap-1'>
                          Biaya Rekber ({Number.parseInt(amount) <= 100000000 ? '1%' : '0.5%'}, min. Rp 10k)
                        </span>
                        <span className='font-bold text-orange-600'>{formatCurrency(fee)}</span>
                      </div>
                      {appliedVoucher && voucherDiscount > 0 && (
                        <div className='flex justify-between'>
                          <span className='text-slate-500 font-medium flex items-center gap-1.5'>
                            <Tag className='h-4 w-4 text-green-600' />
                            Diskon Biaya Admin
                          </span>
                          <span className='font-bold text-green-600'>
                            -{formatCurrency(Math.min(voucherDiscount, fee))}
                          </span>
                        </div>
                      )}
                      {role === 'penjual' && isSellerPartnership && partnershipFee > 0 && (
                        <>
                          <div className='flex justify-between'>
                            <span className='text-slate-500 font-medium flex items-center gap-1'>
                              <CheckCircle className='h-4 w-4 text-slate-400' />
                              Fee Partnership ({sellerPartnershipPercentage}%)
                            </span>
                            <span className='font-bold text-slate-600'>{formatCurrency(partnershipFee)}</span>
                          </div>
                          <div className='flex justify-between text-emerald-600 font-bold'>
                            <span className='flex items-center gap-1'>
                              <CheckCircle className='h-4 w-4 text-emerald-600' />
                              Cashback (Fee Partnership)
                            </span>
                            <span>+{formatCurrency(partnershipFee)}</span>
                          </div>
                        </>
                      )}
                      <Separator className='bg-blue-100/50' />
                      <div className='flex justify-between text-base pt-1'>
                        <span className='font-bold text-blue-800'>Total Pembayaran</span>
                        <span className='font-extrabold text-lg text-blue-800'>
                          {formatCurrency(totalAmount + Math.max(0, fee - voucherDiscount))}
                        </span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className='space-y-6'>
                <h3 className='text-xl font-bold text-slate-800'>Ringkasan Transaksi</h3>

                <div className='border border-slate-100 rounded-3xl p-6 bg-slate-50/30 space-y-4'>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <p className='text-slate-400 font-medium'>Nama Barang / Jasa</p>
                      <p className='text-slate-800 font-bold'>{product}</p>
                    </div>
                    <div>
                      <p className='text-slate-400 font-medium'>Kategori</p>
                      <p className='text-slate-800 font-bold'>
                        {category === '1' ? 'Barang Fisik' : category === '2' ? 'Produk Digital' : 'Jasa dan Layanan'}
                      </p>
                    </div>
                  </div>

                  <Separator className='bg-slate-100' />

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                    <div>
                      <p className='text-slate-400 font-medium mb-1'>Pembeli</p>
                      <p className='text-slate-800 font-bold'>
                        {role === 'pembeli'
                          ? (currentUser?.name || localStorage.getItem('name') || '-')
                          : (foundUser?.name ? maskName(foundUser.name) : '-')}
                      </p>
                      <p className='text-slate-500 text-xs mt-0.5'>
                        {role === 'pembeli'
                          ? (currentUser?.email || localStorage.getItem('email') || '-')
                          : (foundUser?.email || '-')}
                      </p>
                      {(() => {
                        const buyerPhone = role === 'pembeli' ? currentUser?.phone : foundUser?.phone;
                        return buyerPhone ? (
                          <div className='flex items-center gap-1.5 mt-0.5'>
                            <span className='text-slate-500 text-xs'>{buyerPhone}</span>
                            <button
                              type='button'
                              onClick={() => copyPhoneNumber(buyerPhone)}
                              className='text-slate-400 hover:text-blue-600 transition-colors'
                              aria-label='Salin nomor HP pembeli'
                            >
                              <Copy className='w-3.5 h-3.5' />
                            </button>
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <div>
                      <p className='text-slate-400 font-medium mb-1'>Penjual</p>
                      <p className='text-slate-800 font-bold'>
                        {role === 'penjual'
                          ? (currentUser?.name || localStorage.getItem('name') || '-')
                          : (foundUser?.name ? maskName(foundUser.name) : '-')}
                      </p>
                      <p className='text-slate-500 text-xs mt-0.5'>
                        {role === 'penjual'
                          ? (currentUser?.email || localStorage.getItem('email') || '-')
                          : (foundUser?.email || '-')}
                      </p>
                      {(() => {
                        const sellerPhone = role === 'penjual' ? currentUser?.phone : foundUser?.phone;
                        return sellerPhone ? (
                          <div className='flex items-center gap-1.5 mt-0.5'>
                            <span className='text-slate-500 text-xs'>{sellerPhone}</span>
                            <button
                              type='button'
                              onClick={() => copyPhoneNumber(sellerPhone)}
                              className='text-slate-400 hover:text-green-600 transition-colors'
                              aria-label='Salin nomor HP penjual'
                            >
                              <Copy className='w-3.5 h-3.5' />
                            </button>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  <Separator className='bg-slate-100' />

                  {productImagePreviews.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                      {productImagePreviews.map((src, idx) => (
                        <div key={idx} className='w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 relative'>
                          <NextImage
                            src={src}
                            alt={`Foto produk ${idx + 1}`}
                            fill
                            className='object-cover'
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {notes && (
                    <div className='text-sm'>
                      <p className='text-slate-400 font-medium'>Deskripsi</p>
                      <p className='text-slate-600 mt-1 bg-white p-3 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap'>{notes}</p>
                    </div>
                  )}

                  {category === '3' && workDays && (
                    <div className='text-sm'>
                      <p className='text-slate-400 font-medium'>Lama Pengerjaan</p>
                      <p className='text-slate-800 font-bold mt-0.5'>{workDays} Hari</p>
                    </div>
                  )}
                </div>

                {amount && Number.parseInt(amount) > 0 && (
                  <Card className='bg-blue-50/50 border border-blue-100 rounded-3xl p-6 shadow-none'>
                    <div className='flex items-center space-x-2 text-blue-700 mb-4'>
                      <Calculator className='h-5 w-5' />
                      <span className='font-bold text-base'>Kalkulasi Rincian Biaya</span>
                    </div>
                    <div className='space-y-3.5 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-slate-500 font-medium'>Jumlah Transaksi</span>
                        <span className='font-bold text-slate-800'>
                          {formatCurrency(Number.parseInt(amount))}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-slate-500 font-medium flex items-center gap-1'>
                          Biaya Rekber ({Number.parseInt(amount) <= 100000000 ? '1%' : '0.5%'}, min. Rp 10k)
                        </span>
                        <span className='font-bold text-orange-600'>{formatCurrency(fee)}</span>
                      </div>
                      {appliedVoucher && voucherDiscount > 0 && (
                        <div className='flex justify-between'>
                          <span className='text-slate-500 font-medium flex items-center gap-1.5'>
                            <Tag className='h-4 w-4 text-green-600' />
                            Diskon Biaya Admin
                          </span>
                          <span className='font-bold text-green-600'>
                            {/* KOREKSI 1: Diskon yang tampil tidak boleh melebihi jumlah Fee */}
                            -{formatCurrency(Math.min(voucherDiscount, fee))}
                          </span>
                        </div>
                      )}
                      {role === 'penjual' && isSellerPartnership && partnershipFee > 0 && (
                        <>
                          <div className='flex justify-between'>
                            <span className='text-slate-500 font-medium flex items-center gap-1'>
                              <CheckCircle className='h-4 w-4 text-slate-400' />
                              Fee Partnership ({sellerPartnershipPercentage}%)
                            </span>
                            <span className='font-bold text-slate-600'>{formatCurrency(partnershipFee)}</span>
                          </div>
                          <div className='flex justify-between text-emerald-600 font-bold'>
                            <span className='flex items-center gap-1'>
                              <CheckCircle className='h-4 w-4 text-emerald-600' />
                              Cashback (Fee Partnership)
                            </span>
                            <span>+{formatCurrency(partnershipFee)}</span>
                          </div>
                        </>
                      )}
                      <Separator className='bg-blue-100/50' />
                      <div className='flex justify-between text-base pt-1'>
                        <span className='font-bold text-blue-800'>Total Pembayaran</span>
                        <span className='font-extrabold text-lg text-blue-800'>
                          {/* KOREKSI 2: Diskon Ditarik HANYA dari Fee, bukan dari Grand Total */}
                          {formatCurrency(totalAmount + Math.max(0, fee - voucherDiscount))}
                        </span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="mt-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 leading-relaxed">
                {errorMessage}
              </div>
            )}

            <div className='flex items-center justify-between gap-4 pt-5 border-t border-slate-100'>
              {currentStep === 0 ? (
                <Button
                  type='button'
                  onClick={handleNext}
                  disabled={!isStepValid(currentStep) || isLoading}
                  className='w-full bg-[#2b66f6] hover:bg-[#1a55e5] text-white font-bold rounded-2xl h-14 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none'
                >
                  Lanjut
                </Button>
              ) : (
                <>
                  <Button
                    type='button'
                    onClick={handleBack}
                    disabled={isLoading}
                    className='bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-bold rounded-2xl px-8 h-12 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-50'
                  >
                    Kembali
                  </Button>

                  {currentStep < 3 ? (
                    <Button
                      type='button'
                      onClick={handleNext}
                      disabled={!isStepValid(currentStep) || isLoading}
                      className='bg-[#2b66f6] hover:bg-[#1a55e5] text-white font-bold rounded-2xl px-8 h-12 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none'
                    >
                      Lanjut
                    </Button>
                  ) : (
                    <Button
                      type='button'
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl px-8 h-12 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50'
                    >
                      {isLoading ? 'Memproses...' : 'Submit Transaksi'}
                    </Button>
                  )}
                </>
              )}
            </div>

          </CardContent>
        </Card>
      </main>
      <Footer />
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-md mx-auto z-[999]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-600 flex items-center gap-2">
              Lengkapi Profil Rekening
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700">
              Buyer atau Seller belum melengkapi nomor rekening di profil.<br />
              Silakan lengkapi data rekening Anda terlebih dahulu agar bisa membuat transaksi.
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  window.open('/dashboard/profile', '_blank');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Lengkapi Profil Rekening
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- 2. BUNGKUSAN SUSPENSE UTAMA (WAJIB NEXT.JS APP ROUTER) ---
export default function RekberForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full"></div>
          <p className="text-slate-500 font-medium">Mempersiapkan form transaksi...</p>
        </div>
      </div>
    }>
      <RekberFormContent />
    </Suspense>
  );
}