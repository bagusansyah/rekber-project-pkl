"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Copy, Share2, Sparkles, ImagePlus, X, QrCode, Power, Store, CheckCircle,
  ChevronDown, ChevronUp, ExternalLink,
} from "lucide-react"
import NextImage from 'next/image';
import QRCode from 'qrcode';

import { API_URL, getToken } from '@/constants/api';
import { encodeTransactionId } from '@/lib/transactionId';
import { useRequireKycVerified } from '@/hooks/useRequireKycVerified';

const categoryOptions = [
  { value: '1', label: 'Barang Fisik', icon: '📦' },
  { value: '3', label: 'Jasa', icon: '🔧' },
  { value: '2', label: 'Digital', icon: '💻' },
];

const MAX_PRODUCT_IMAGES = 10;

interface ProductLink {
  id: number;
  token: string;
  share_url: string;
  title: string;
  total_amount: number;
  fee_by: string;
  categ_id: number;
  product_images: string[] | null;
  is_active: boolean;
  total_transactions: number;
  paid_transactions: number;
  created_at: string;
}

interface LinkTransaction {
  id: number;
  kode_transaksi: string;
  status: string;
  total_amount: number;
  amount_paid: number;
  buyer_name: string | null;
  created_at: string;
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  draft: { label: 'Belum Diklaim', className: 'bg-slate-100 text-slate-600' },
  wait_payment: { label: 'Menunggu Bayar', className: 'bg-amber-50 text-amber-700' },
  paid: { label: 'Sudah Dibayar', className: 'bg-blue-50 text-blue-700' },
  waiting_confirmation: { label: 'Menunggu Konfirmasi', className: 'bg-blue-50 text-blue-700' },
  completed: { label: 'Selesai', className: 'bg-green-50 text-green-700' },
  disbursed: { label: 'Dana Dicairkan', className: 'bg-green-50 text-green-700' },
  cancel: { label: 'Dibatalkan', className: 'bg-red-50 text-red-600' },
  cancelled: { label: 'Kedaluwarsa', className: 'bg-red-50 text-red-600' },
  failed: { label: 'Gagal', className: 'bg-red-50 text-red-600' },
};

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

function QrCodeButton({ shareUrl }: { shareUrl: string }) {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (open && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, shareUrl, { width: 200, margin: 2 }).catch(() => {});
    }
  }, [open, shareUrl]);

  return (
    <>
      <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setOpen((v) => !v)}>
        <QrCode className="w-4 h-4 mr-1" />
        <span className="text-xs">QR Code</span>
      </Button>
      {open && (
        <div className="w-full flex justify-center p-4 bg-white rounded-2xl border border-slate-100 mt-2">
          <canvas ref={canvasRef} />
        </div>
      )}
    </>
  );
}

function ProductLinkTransactionsPanel({ linkId }: { linkId: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<LinkTransaction[] | null>(null);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && transactions === null) {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/product-links/${linkId}/transactions`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) setTransactions(await res.json());
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
      >
        Lihat transaksi dari link ini
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {loading && <p className="text-xs text-slate-400">Memuat transaksi...</p>}
          {!loading && transactions?.length === 0 && (
            <p className="text-xs text-slate-400">Belum ada transaksi dari link ini.</p>
          )}
          {!loading && transactions?.map((t) => {
            const statusInfo = STATUS_LABEL[t.status] || { label: t.status, className: 'bg-slate-100 text-slate-600' };
            return (
              <Link
                key={t.id}
                href={`/dashboard/transactions/${encodeTransactionId(t.id)}`}
                className="flex items-center justify-between gap-3 bg-slate-50 hover:bg-slate-100 transition-colors p-3 rounded-2xl border border-slate-100"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{t.kode_transaksi}</p>
                  <p className="text-xs text-slate-400">{t.buyer_name || 'Belum ada pembeli'}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${statusInfo.className}`}>
                    {statusInfo.label}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{formatCurrency(t.amount_paid)}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProductLinksPage() {
  const { ready } = useRequireKycVerified();
  const [barang, setBarang] = useState("");
  const [harga, setHarga] = useState("");
  const [category, setCategory] = useState('1');
  const [workDays, setWorkDays] = useState('');
  const [deskripsi, setDeskripsi] = useState("");
  const [productImages, setProductImages] = useState<File[]>([]);
  const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [links, setLinks] = useState<ProductLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    setLoadingLinks(true);
    try {
      const res = await fetch(`${API_URL}/product-links`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setLinks(await res.json());
    } catch {
      // Non-fatal — list simply stays empty, form above still works.
    } finally {
      setLoadingLinks(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleProductImagesChange = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const remainingSlots = MAX_PRODUCT_IMAGES - productImages.length;
    if (remainingSlots <= 0) return;

    const validFiles: File[] = [];
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) continue;
      validFiles.push(file);
    }
    setProductImages((prev) => [...prev, ...validFiles].slice(0, MAX_PRODUCT_IMAGES));
  };

  useEffect(() => {
    const urls = productImages.map((file) => URL.createObjectURL(file));
    setProductImagePreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [productImages]);

  const handleCreate = async () => {
    setFormError('');
    if (!barang.trim()) return setFormError('Nama barang/jasa harus diisi');
    if (!harga || Number(harga) <= 0) return setFormError('Harga harus lebih dari 0');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', barang);
      formData.append('total_amount', harga);
      formData.append('categ_id', category);
      formData.append('fee_by', 'buyer');
      if (deskripsi) formData.append('notes', deskripsi);
      if (category === '3' && workDays) formData.append('work_duration', workDays);
      productImages.forEach((file) => formData.append('product_images', file));

      const res = await fetch(`${API_URL}/product-links`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Gagal membuat link produk');
        return;
      }

      setBarang(''); setHarga(''); setDeskripsi(''); setWorkDays(''); setProductImages([]);
      await fetchLinks();
    } catch {
      setFormError('Terjadi kesalahan, coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (link: ProductLink) => {
    try {
      const res = await fetch(`${API_URL}/product-links/${link.id}/active`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !link.is_active }),
      });
      if (res.ok) await fetchLinks();
    } catch {
      // Non-fatal — user can retry the toggle.
    }
  };

  const handleCopy = (link: ProductLink) => {
    navigator.clipboard.writeText(link.share_url);
    setCopiedToken(link.token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

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
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-slate-800">Link Produk</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-lg mx-auto">
            Buat satu link permanen untuk sebuah produk, lalu tempel di website/Instagram/WhatsApp Anda —
            tanpa kode. Setiap pembeli yang klik akan otomatis membuat transaksi baru.
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white rounded-3xl overflow-hidden">
          <CardContent className="p-6 sm:p-10 space-y-5">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Buat Link Produk Baru
            </h3>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Nama Barang/Jasa <span className="text-red-500">*</span>
              </Label>
              <Input
                value={barang}
                onChange={(e) => setBarang(e.target.value)}
                placeholder="Contoh: Sepatu Lari XYZ"
                className="h-12 border-slate-200 bg-white rounded-2xl px-4"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Harga <span className="text-red-500">*</span>
              </Label>
              <Input
                inputMode="numeric"
                value={formatNumber(harga)}
                onChange={(e) => setHarga(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                className="h-12 border-slate-200 bg-white rounded-2xl px-4"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Kategori</Label>
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
            </div>

            {category === '3' && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Lama Waktu Pengerjaan (Hari)</Label>
                <Input
                  type="number"
                  min={1}
                  value={workDays}
                  onChange={(e) => setWorkDays(e.target.value)}
                  className="h-12 border-slate-200 bg-white rounded-2xl px-4"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Foto Produk <span className="text-slate-400 font-normal">(opsional, maks. {MAX_PRODUCT_IMAGES})</span>
              </Label>
              <input
                id="product-link-image-input"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => { handleProductImagesChange(e.target.files); e.target.value = ''; }}
                className="hidden"
              />
              <div className="flex flex-wrap gap-3">
                {productImagePreviews.map((src, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200">
                    <NextImage src={src} alt={`Preview ${idx + 1}`} fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => setProductImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {productImages.length < MAX_PRODUCT_IMAGES && (
                  <button
                    type="button"
                    onClick={() => document.getElementById('product-link-image-input')?.click()}
                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-blue-300 hover:text-blue-500"
                  >
                    <ImagePlus className="w-6 h-6" />
                    <span className="text-xs font-medium">Tambah</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Deskripsi</Label>
              <Textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="min-h-[90px] border-slate-200 bg-white rounded-2xl p-4 resize-none"
              />
            </div>

            {formError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                {formError}
              </div>
            )}

            <Button
              onClick={handleCreate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl h-14 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
                  Memproses...
                </>
              ) : (
                <>
                  <Store className="w-4 h-4" />
                  Buat Link Produk
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Link Produk Saya</h3>

          {loadingLinks && <p className="text-sm text-slate-400">Memuat...</p>}
          {!loadingLinks && links.length === 0 && (
            <p className="text-sm text-slate-400">Belum ada link produk. Buat satu di atas.</p>
          )}

          {links.map((link) => (
            <Card key={link.id} className={`rounded-3xl border ${link.is_active ? 'border-slate-100' : 'border-slate-200 bg-slate-50/50 opacity-75'}`}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-800">{link.title}</h4>
                    <p className="text-sm text-slate-500">{formatCurrency(link.total_amount)}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${link.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                    {link.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <code className="text-xs text-slate-600 break-all">{link.share_url}</code>
                </div>

                <p className="text-xs text-slate-400">
                  {link.total_transactions} transaksi dibuat dari link ini &middot; {link.paid_transactions} berhasil dibayar
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => handleCopy(link)} className={`rounded-xl ${copiedToken === link.token ? 'bg-green-600 hover:bg-green-600' : 'bg-slate-700 hover:bg-slate-800'}`}>
                    {copiedToken === link.token ? <CheckCircle className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    <span className="text-xs">{copiedToken === link.token ? 'Tersalin' : 'Salin'}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-200 rounded-xl"
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Beli ${link.title} - ${formatCurrency(link.total_amount)}\n${link.share_url}`)}`, '_blank')}
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    <span className="text-xs">WhatsApp</span>
                  </Button>
                  <QrCodeButton shareUrl={link.share_url} />
                  <Button size="sm" variant="outline" className="rounded-xl ml-auto" onClick={() => handleToggleActive(link)}>
                    <Power className="w-4 h-4 mr-1" />
                    <span className="text-xs">{link.is_active ? 'Nonaktifkan' : 'Aktifkan'}</span>
                  </Button>
                </div>

                {link.total_transactions > 0 && (
                  <div className="pt-1 border-t border-slate-100">
                    <ProductLinkTransactionsPanel linkId={link.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
