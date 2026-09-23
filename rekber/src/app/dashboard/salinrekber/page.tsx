"use client"

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, CreditCard, Share2, ArrowRight, CheckCircle, Users, ShieldCheck, Calculator, Wallet, Sparkles, ImagePlus, X } from "lucide-react"
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import NextImage from 'next/image';

import { API_URL } from '@/constants/api';
import { useRequireKycVerified } from '@/hooks/useRequireKycVerified';

const categoryOptions = [
  { value: '1', label: 'Barang Fisik', icon: '📦' },
  { value: '3', label: 'Jasa', icon: '🔧' },
  { value: '2', label: 'Digital', icon: '💻' },
];

const MAX_PRODUCT_IMAGES = 10;

const notesPlaceholderFor = (categoryValue: string) => {
  if (categoryValue === '3') {
    return 'Cantumkan cakupan pekerjaan, jumlah revisi, durasi pengerjaan, dan garansi (jika ada)';
  }
  if (categoryValue === '2') {
    return 'Cantumkan jenis akun/lisensi, masa berlaku, cara pengiriman, dan garansi (jika ada)';
  }
  return 'Cantumkan kondisi barang, ukuran/warna, kelengkapan, dan garansi (jika ada)';
};

export default function Component() {
  const { ready } = useRequireKycVerified();
  const [copiedLink, setCopiedLink] = useState(false)
  const [generatedLink, setGeneratedLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [barang, setBarang] = useState("")
  const [harga, setAmount] = useState("")
  const [deskripsi, setDeskripsi] = useState("")
  const [category, setCategory] = useState('1')
  const [totalAmount, setTotalAmount] = useState(0);
  const [isShipping] = useState('tidak');
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [workDays, setWorkDays] = useState('');
  const [fee, setFee] = useState(0);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);
  const successSectionRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState({
    barang: '',
    category: '',
    harga: '',
    foto: '',
  })

  const handleProductImagesChange = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const remainingSlots = MAX_PRODUCT_IMAGES - productImages.length;
    if (remainingSlots <= 0) {
      alert(`Maksimal ${MAX_PRODUCT_IMAGES} foto produk`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} bukan file gambar`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} melebihi 5MB`);
        continue;
      }
      validFiles.push(file);
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
  const handleGenerateLink = async () => {
    // Reset errors
    setErrors({ barang: '', category: '', harga: '', foto: '' })

    // Validate all required fields
    let hasErrors = false
    const newErrors = { barang: '', category: '', harga: '', foto: '' }

    if (!barang.trim()) {
      newErrors.barang = 'Nama barang/jasa harus diisi'
      hasErrors = true
    }

    if (!category) {
      newErrors.category = 'Kategori harus dipilih'
      hasErrors = true
    }

    if (!harga || Number(harga) <= 0) {
      newErrors.harga = 'Harga harus diisi dengan nilai lebih dari 0'
      hasErrors = true
    }

    if (productImages.length === 0) {
      newErrors.foto = 'Minimal 1 foto produk harus diunggah'
      hasErrors = true
    }

    if (hasErrors) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("Anda harus login terlebih dahulu.")
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append('name', barang)
      formData.append('total_amount', harga)
      formData.append('role', 'penjual')
      formData.append('fee_by', 'buyer')
      formData.append('notes', deskripsi)
      formData.append('status', 'draft')
      formData.append('categ_id', category)
      formData.append('is_shipping', isShipping)
      if (category === '3' && workDays) formData.append('work_duration', workDays)
      productImages.forEach((file) => formData.append('product_images', file))

      const res = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        // Cek error seller belum melengkapi nomor rekening
        if (data.error && data.error.includes('Seller belum melengkapi nomor rekening')) {
          setShowProfileDialog(true);
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Gagal membuat transaksi');
      }
      if (res.ok && data.transaction) {
        // Buat Payment Link publik menggunakan token acak (bukan id transaksi)
        // sehingga siapa pun yang menerima link bisa membuka & membayar tanpa login.
        const newLink = `${window.location.origin}/pay/${data.transaction.public_token}`
        setGeneratedLink(newLink)
        setTimeout(() => {
          successSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      } else {
        alert(data.error || "Gagal membuat transaksi")
      }
    } catch {
      alert("Terjadi kesalahan, coba lagi.")
    }
    setLoading(false)
  }

   useEffect(() => {
     const parsedAmount = Number.parseInt(harga) || 0;
     const calculatedFee = calculateFee(parsedAmount);
     setFee(calculatedFee);
     setTotalAmount(parsedAmount);
   }, [harga]);

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    setAmount(numericValue);
  };

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, '');
    return new Intl.NumberFormat('id-ID').format(Number.parseInt(number) || 0);
  };


  const getShareTemplate = (barang: string, harga: string, deskripsi: string, link: string) => {
    return `💳 *Payment Link Aman via Rekber.com*

  ~ *${barang}*
  ~ Harga: ${formatCurrency(Number.parseInt(harga)+fee)}
  ${deskripsi ? `📝 ${deskripsi}\n` : ''}
  ~ Bayar langsung di sini (tidak perlu akun/login):
  ${link}

  ~ Dana disimpan aman di rekening bersama
  ~ Cukup isi nama, email & no HP untuk membayar
  ~ Proses cepat & terlindungi

  #RekberCom #PaymentLink #TransaksiAman`
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/20 to-white -m-3 p-3 sm:p-6 rounded-2xl">
      <div className="max-w-2xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-slate-800">Payment Link</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-lg mx-auto">
            Buat link pembayaran yang bisa langsung dibagikan ke siapa saja — tanpa perlu akun Rekber.com untuk membayar.
          </p>
        </div>

        {/* How It Works */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { step: '1', title: 'Buat Payment Link', desc: 'Isi detail barang/jasa dan harga' },
              { step: '2', title: 'Bagikan ke Pembeli', desc: 'Kirim link lewat chat, email, atau sosmed' },
              { step: '3', title: 'Pembeli Bayar Langsung', desc: 'Isi nama, email & no HP, lalu bayar' },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  {item.step}
                </div>
                <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Link Generator */}
        <Card className="shadow-xl border-0 bg-white rounded-3xl overflow-hidden">
          <CardContent className="p-6 sm:p-10 space-y-5">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Buat Payment Link Baru
            </h3>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Nama Barang/Jasa <span className="text-red-500">*</span>
              </Label>
              <Input
                value={barang}
                onChange={e => setBarang(e.target.value)}
                placeholder="Contoh: iPhone 14 Pro Max"
                className="h-12 border-slate-200 bg-white rounded-2xl px-4"
              />
              {errors.barang && (
                <p className="text-red-500 text-xs">{errors.barang}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Nilai Transaksi <span className="text-red-500">*</span>
              </Label>
              <Input
                inputMode="numeric"
                value={formatNumber(harga)}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                className="h-12 border-slate-200 bg-white rounded-2xl px-4"
              />
              {errors.harga && (
                <p className="text-red-500 text-xs">{errors.harga}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Kategori <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-wrap gap-3">
                {categoryOptions.map((option) => {
                  const isSelected = category === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
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
              {errors.category && (
                <p className="text-red-500 text-xs">{errors.category}</p>
              )}
            </div>

            {category === '3' && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Lama Waktu Pengerjaan (Hari)
                </Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Contoh: 3"
                  value={workDays}
                  onChange={e => setWorkDays(e.target.value)}
                  className="h-12 border-slate-200 bg-white rounded-2xl px-4"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Foto Produk <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal"> (maks. {MAX_PRODUCT_IMAGES})</span>
              </Label>
              <input
                id="payment-link-image-input"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  handleProductImagesChange(e.target.files);
                  e.target.value = '';
                }}
                className="hidden"
              />
              <div className="flex flex-wrap gap-3">
                {productImagePreviews.map((src, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200">
                    <NextImage
                      src={src}
                      alt={`Preview produk ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveProductImage(idx)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                      aria-label={`Hapus foto produk ${idx + 1}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {productImages.length < MAX_PRODUCT_IMAGES && (
                  <button
                    type="button"
                    onClick={() => document.getElementById('payment-link-image-input')?.click()}
                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
                  >
                    <ImagePlus className="w-6 h-6" />
                    <span className="text-xs font-medium">Tambah</span>
                  </button>
                )}
              </div>
              {productImages.length > 0 && (
                <p className="text-xs text-slate-400">{productImages.length}/{MAX_PRODUCT_IMAGES} foto dipilih</p>
              )}
              {errors.foto && (
                <p className="text-red-500 text-xs">{errors.foto}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Deskripsi {category === '3' ? 'Jasa/Layanan' : category === '2' ? 'Produk Digital' : 'Barang Fisik'}
              </Label>
              <Textarea
                value={deskripsi}
                onChange={e => setDeskripsi(e.target.value)}
                placeholder={notesPlaceholderFor(category)}
                className="min-h-[90px] border-slate-200 bg-white rounded-2xl p-4 resize-none"
              />
            </div>

            {harga && Number.parseInt(harga) > 0 && (
              <Card className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 shadow-none">
                <div className="flex items-center space-x-2 text-blue-700 mb-4">
                  <Calculator className="h-5 w-5" />
                  <span className="font-bold text-base">Kalkulasi Rincian Biaya</span>
                </div>
                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Jumlah Transaksi</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(Number.parseInt(harga))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">
                      Biaya Rekber ({Number.parseInt(harga) <= 100000000 ? '1%' : '0.5%'}, min. Rp 10k)
                    </span>
                    <span className="font-bold text-orange-600">{formatCurrency(fee)}</span>
                  </div>
                  <Separator className="bg-blue-100/50" />
                  <div className="flex justify-between text-base pt-1">
                    <span className="font-bold text-blue-800">Total yang Harus Dibayar</span>
                    <span className="font-extrabold text-lg text-blue-800">{formatCurrency(totalAmount+fee)}</span>
                  </div>
                </div>
              </Card>
            )}

            <Button
              onClick={handleGenerateLink}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl h-14 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
                  Memproses...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Buat Payment Link
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedLink && (
          <Card ref={successSectionRef} className="mt-6 border border-green-100 bg-green-50/50 rounded-3xl shadow-none">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <h3 className="text-lg font-bold text-slate-800 leading-tight">Payment Link Berhasil Dibuat!</h3>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <code className="text-xs sm:text-sm text-slate-600 w-full break-all">{generatedLink}</code>
                  <Button
                    size="sm"
                    onClick={handleCopyLink}
                    className={`${copiedLink ? "bg-green-600 hover:bg-green-600" : "bg-slate-700 hover:bg-slate-800"} rounded-xl w-full sm:w-auto flex-shrink-0`}
                  >
                    {copiedLink ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs">Tersalin</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Copy className="w-4 h-4" />
                        <span className="text-xs">Salin</span>
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-200 bg-white rounded-xl w-full sm:w-auto"
                  onClick={() => {
                    const shareText = getShareTemplate(barang, harga, deskripsi, generatedLink)
                    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
                  }}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  <span className="text-xs">WhatsApp</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-blue-600 border-blue-200 bg-white rounded-xl w-full sm:w-auto"
                  onClick={() => {
                    const shareText = getShareTemplate(barang, harga, deskripsi, generatedLink)
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(generatedLink)}&text=${encodeURIComponent(shareText)}`, '_blank')
                  }}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  <span className="text-xs">Telegram</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <div className="bg-white rounded-3xl border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-blue-500" />
              <h3 className="text-base font-bold text-slate-800">Mudah untuk Pembeli</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                Tidak perlu punya akun untuk membuka & membayar
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                Cukup isi nama, email & no HP
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                Detail barang & harga sudah terisi otomatis
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-green-500" />
              <h3 className="text-base font-bold text-slate-800">Aman & Terpercaya</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                Link berisi token unik dan tidak bisa ditebak
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                Dana disimpan aman di rekening bersama sampai transaksi selesai
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                Perlindungan untuk kedua belah pihak
              </li>
            </ul>
          </div>
        </div>

        {/* Example Usage */}
        <Card className="mt-6 mb-8 bg-blue-50/50 border border-blue-100 rounded-3xl shadow-none">
          <CardContent className="p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              Contoh Penggunaan
            </h3>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
              <div>
                <p className="text-sm font-bold text-slate-700">Penjual:</p>
                <p className="text-sm text-slate-500 mt-1">
                  Halo, saya jual iPhone 14 Pro Max seharga Rp 15.000.000. Silakan bayar dengan aman lewat
                  Payment Link berikut:
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl text-sm text-blue-600 break-all">
                https://www.rekber.com/pay/AbCdEfGhIjKlMnOp
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Pembeli:</p>
                <p className="text-sm text-slate-500 mt-1">
                  *Klik link* → Lihat ringkasan transaksi → Isi nama, email & no HP → Langsung bayar,
                  tanpa perlu daftar/login terlebih dahulu.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogContent className="max-w-md mx-auto z-[999] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
                Lengkapi Profil Rekening
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Seller belum melengkapi nomor rekening di profil.<br />
                Silakan lengkapi data rekening Anda terlebih dahulu agar bisa membuat transaksi.
              </p>
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    window.open('/dashboard/profile', '_blank');
                  }}
                  className="bg-[#2b66f6] hover:bg-[#1a55e5] text-white rounded-2xl font-bold"
                >
                  Lengkapi Profil Rekening
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
