'use client';

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertTriangle,
  ChevronRight,
  CircleHelp,
  FileText,
  Headphones,
  Info,
  Newspaper,
  ShieldAlert,
  ShieldCheck,
  Pencil,
  ArrowLeft,
  CreditCard,
  Key,
} from "lucide-react"
import { toast } from "sonner"
import { Toaster } from "sonner";
import Select from 'react-select';
import { API_URL } from '@/constants/api';
import { useKycStatus, type KycStatus } from '@/hooks/useKycStatus';

// --- Tambahan: State dan logic untuk dropdown bertingkat alamat ---
interface Province { id: number; name: string }
interface Regency { id: number; name: string; type: string }
interface District { id: number; name: string }

const KYC_STATUS_BADGE: Record<KycStatus, { label: string; className: string }> = {
  approved: { label: 'Terverifikasi', className: 'bg-green-50 text-green-700' },
  pending: { label: 'Diproses', className: 'bg-yellow-50 text-yellow-700' },
  rejected: { label: 'Ditolak', className: 'bg-red-50 text-red-700' },
  none: { label: 'Belum Verifikasi', className: 'bg-gray-100 text-gray-600' },
}

// Daftar bank populer di Indonesia. Field bank memakai Select biasa (bukan
// creatable) dengan opsi "Lainnya" yang mengganti dropdown jadi input teks bebas.
const BANK_OPTIONS = [
  "Bank Central Asia (BCA)",
  "Bank Rakyat Indonesia (BRI)",
  "Bank Negara Indonesia (BNI)",
  "Bank Mandiri",
  "Bank Syariah Indonesia (BSI)",
  "Bank CIMB Niaga",
  "Bank Danamon",
  "Bank Permata",
  "Bank Tabungan Negara (BTN)",
  "Bank Maybank Indonesia",
  "Bank OCBC NISP",
  "Bank Panin",
  "Bank UOB Indonesia",
  "Bank HSBC Indonesia",
  "Citibank Indonesia",
  "Bank DBS Indonesia",
  "Bank Mega",
  "Bank BTPN",
  "BTPN Syariah",
  "Bank Sinarmas",
  "KB Bank (Bukopin)",
  "Bank Commonwealth",
  "Bank ANZ Indonesia",
  "Bank Mayapada",
  "Bank Mestika Dharma",
  "Nationalnobu (Bank Nobu)",
  "Bank Woori Saudara",
  "Bank China Construction Bank Indonesia",
  "Bank ICBC Indonesia",
  "Bank Ganesha",
  "Bank Artha Graha Internasional",
  "Bank Sahabat Sampoerna",
  "Bank Jago",
  "Bank Neo Commerce (BNC)",
  "SeaBank Indonesia",
  "Bank Amar Indonesia",
  "Bank Raya Indonesia",
  "Bank Muamalat Indonesia",
  "Bank Victoria International",
  "Bank Capital Indonesia",
  "Bank Multiarta Sentosa",
  "Bank Oke Indonesia",
  "Bank Mandiri Taspen",
  "Krom Bank Indonesia",
  "Bank DKI",
  "Bank Jatim",
  "Bank Jabar Banten (BJB)",
  "Bank Jateng",
  "Bank Sumut",
  "Bank Nagari",
  "Bank Riau Kepri",
  "Bank Sumsel Babel",
  "Bank Lampung",
  "Bank Kalbar",
  "Bank Kalsel",
  "Bank Kalteng",
  "Bank Kaltimtara",
  "Bank Sulselbar",
  "Bank Sultra",
  "Bank Sulteng",
  "Bank Sulutgo",
  "Bank NTB Syariah",
  "Bank NTT",
  "Bank Maluku Malut",
  "Bank Papua",
  "Bank Aceh Syariah",
].map((name) => ({ value: name, label: name }));

const EWALLET_OPTIONS = [
  "GoPay",
  "OVO",
  "DANA",
  "ShopeePay",
  "LinkAja",
  "i.saku",
  "Jenius Pay",
  "Sakuku",
  "DOKU Wallet",
].map((name) => ({ value: name, label: name }));

const OTHER_BANK_OPTION = { value: "__other__", label: "Lainnya" };

type AccountViewData = {
  name: string
  email: string
  phone: string
  isPartnership?: boolean
  role?: string
  partnershipExpiresAt?: string | null
}

// ── Avatar helpers (initial from name) ──
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getAvatarColor(name: string): string {
  // Pick a consistent gradient from a palette based on the name's char code
  const palettes = [
    'from-blue-400 to-indigo-500',
    'from-violet-400 to-purple-500',
    'from-emerald-400 to-teal-500',
    'from-orange-400 to-rose-500',
    'from-sky-400 to-cyan-500',
    'from-pink-400 to-fuchsia-500',
    'from-amber-400 to-orange-500',
    'from-lime-400 to-green-500',
  ]
  const sum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return palettes[sum % palettes.length]
}

function isExpiredPartnership(expiresAt?: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt).getTime() < Date.now()
}

function formatPartnershipExpiresAt(expiresAt?: string | null): string {
  if (!expiresAt) return ''
  const date = new Date(expiresAt)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function MobileAccountPage({ profile, onMenuClick }: { profile: AccountViewData, onMenuClick: (menu: 'profile' | 'bank' | 'password') => void }) {
  const displayName = profile.name || "Rekber.com"
  const displayEmail = profile.email || "support@rekber.com"
  const displayPhone = profile.phone || "6282315555551"
  const partnershipActive = !!profile.isPartnership
  const partnershipExpired = isExpiredPartnership(profile.partnershipExpiresAt)
  const partnershipExpiresLabel = "Partnership - "+formatPartnershipExpiresAt(profile.partnershipExpiresAt)
  const { status: kycStatus } = useKycStatus()

  const helpItems = [
    { label: "Pusat Bantuan", href: "/faq", icon: CircleHelp, color: "bg-blue-50 text-blue-500" },
    { label: "Hubungi Kami", href: "/hubungi-kami", icon: Headphones, color: "bg-green-50 text-green-500" },
    { label: "Kebijakan Privasi", href: "/kebijakan-privasi", icon: FileText, color: "bg-purple-50 text-purple-500" },
    { label: "Syarat & Ketentuan", href: "/syarat-dan-ketentuan", icon: ShieldAlert, color: "bg-orange-50 text-orange-500" },
  ]

  return (
    <div className="-mx-3 -mt-3 -mb-28 min-h-screen bg-[#f4f6fb] pb-28 text-[#1a1d23] md:hidden">
      {/* ── Hero Profile Card ── */}
      <section
        className="relative overflow-hidden px-4 pb-10 pt-8 text-white"
        style={{ background: "linear-gradient(145deg, #0f172a 0%, #1e3a8a 55%, #1d4ed8 100%)" }}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-indigo-400/10 blur-2xl" />

        {/* Profile row */}
        <div className="relative z-10 flex items-center gap-3">
          {/* Avatar — initials from name */}
          <div className="relative shrink-0">
            <div className={`absolute -inset-0.5 rounded-full bg-gradient-to-br ${getAvatarColor(displayName)} opacity-80 blur-[2px]`} />
            <div className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(displayName)} ring-2 ring-white/30`}>
              <span className="text-lg font-bold text-white tracking-wide select-none">
                {getInitials(displayName)}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-bold leading-tight">{displayName}</h1>
            {partnershipActive && (
              <span
                className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                  partnershipExpired
                    ? 'bg-rose-400/15 text-rose-200 ring-rose-400/30'
                    : 'bg-yellow-400/20 text-yellow-300 ring-yellow-400/40'
                }`}
              >
                {partnershipExpired ? 'Partnership - Expired' : partnershipExpiresLabel}
              </span>
            )}
            <p className="mt-0.5 truncate text-[11px] text-white/70">{displayEmail}</p>
            <p className="text-[11px] text-white/70">{displayPhone}</p>
          </div>
        </div>
      </section>

      {/* ── Menu Pengaturan Profil ── */}
      <section className="mt-5 px-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Pengaturan Akun</p>
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)] divide-y divide-gray-100">
          
          <button
            onClick={() => onMenuClick('profile')}
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-gray-50"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Pencil className="h-4 w-4" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-gray-800">Edit Profil</span>
            <ChevronRight className="h-4 w-4 text-gray-300" />
          </button>

          <button
            onClick={() => onMenuClick('bank')}
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-gray-50"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CreditCard className="h-4 w-4" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-gray-800">Nomor Rekening</span>
            <ChevronRight className="h-4 w-4 text-gray-300" />
          </button>

          <button
            onClick={() => onMenuClick('password')}
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-gray-50"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Key className="h-4 w-4" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-gray-800">Ganti Password</span>
            <ChevronRight className="h-4 w-4 text-gray-300" />
          </button>

          <Link
            href="/dashboard/verifikasi"
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-gray-50"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-gray-800">Verifikasi KYC</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${KYC_STATUS_BADGE[kycStatus].className}`}>
              {KYC_STATUS_BADGE[kycStatus].label}
            </span>
            <ChevronRight className="h-4 w-4 text-gray-300" />
          </Link>

        </div>
      </section>

      {/* ── Bantuan ── */}
      <section className="mt-5 px-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Bantuan</p>
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)] divide-y divide-gray-100">
          {helpItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-gray-50"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.color.split(" ")[0]}`}>
                <item.icon className={`h-4 w-4 ${item.color.split(" ")[1]}`} />
              </div>
              <span className="flex-1 text-sm font-medium text-gray-800">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Informasi ── */}
      <section className="mt-5 px-4 pb-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Informasi</p>
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
          <Link
            href="/blog"
            className="flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-gray-50"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50">
              <Newspaper className="h-4 w-4 text-rose-500" />
            </div>
            <span className="flex-1 text-sm font-medium text-gray-800">Blog</span>
            <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-semibold text-white">
              Soon
            </span>
          </Link>
        </div>
      </section>
    </div>
  )
}

export const runtime = "edge";

export default function ProfilePage() {
  const { status: kycStatus } = useKycStatus()
  const [activeMobileMenu, setActiveMobileMenu] = useState<'profile' | 'bank' | 'password' | null>(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [bankLoading, setBankLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    province_id: "",
    regency_id: "",
    district_id: "",
    postal_code: "",
    role: "",
  })
  const [bankLocked, setBankLocked] = useState(false)
  const [accountType, setAccountType] = useState<'bank' | 'ewallet'>('bank')
  const [useCustomBankInput, setUseCustomBankInput] = useState(false)

  // Dropdown bertingkat
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  // Pendeteksi Deep Link dari halaman lain
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.location.hash === '#bank') {
      // Buka otomatis menu rekening di tampilan Mobile
      setActiveMobileMenu('bank');

      // Gulir otomatis layar tepat ke arah form rekening untuk tampilan Desktop
      setTimeout(() => {
        document.getElementById('form-rekening-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    } else if (window.location.hash === '#profile') {
      // Buka otomatis menu profil (No HP, dll) di tampilan Mobile
      setActiveMobileMenu('profile');

      // Gulir otomatis layar tepat ke arah form profil untuk tampilan Desktop
      setTimeout(() => {
        document.getElementById('form-profil-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, []);

  // Buka section akun (mobile) sambil push history entry, agar tombol back
  // (baik tombol di layar maupun tombol back HP/browser) kembali ke halaman
  // menu akun dulu, bukan langsung keluar dari halaman akun.
  const openAccountSection = (menu: 'profile' | 'bank' | 'password') => {
    setActiveMobileMenu(menu);
    if (typeof window !== 'undefined') {
      window.history.pushState({ accountSection: menu }, '', `#${menu}`);
    }
  };

  const closeAccountSection = () => {
    if (typeof window !== 'undefined' && window.history.state?.accountSection) {
      window.history.back();
    } else {
      setActiveMobileMenu(null);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'bank' || hash === 'profile' || hash === 'password') {
        setActiveMobileMenu(hash);
      } else {
        setActiveMobileMenu(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch provinces saat mount
  useEffect(() => {
    fetch(`${API_URL}/provinces`)
      .then(res => res.json())
      .then(res => setProvinces(res.data || []));
  }, []);

  // Fetch regencies saat province berubah
  useEffect(() => {
    if (formData.province_id) {
      fetch(`${API_URL}/regencies/${formData.province_id}`)
        .then(res => res.json())
        .then(res => setRegencies(res.data || []));
    } else {
      setRegencies([]);
      setFormData(prev => ({ ...prev, regency_id: "", district_id: "" }));
    }
  }, [formData.province_id]);

  // Fetch districts saat regency berubah
  useEffect(() => {
    if (formData.regency_id) {
      fetch(`${API_URL}/districts/${formData.regency_id}`)
        .then(res => res.json())
        .then(res => setDistricts(res.data || []));
    } else {
      setDistricts([]);
      setFormData(prev => ({ ...prev, district_id: "" }));
    }
  }, [formData.regency_id]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/profile-detail`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
        const data = await res.json()
        setFormData((prev) => ({
          ...prev,
          name: data.profile?.name || "",
          email: data.profile?.email || "",
          phone: data.profile?.phone || "",
          address: data.detail?.alamat || "",
          accountNumber: data.detail?.no_rek || "",
          accountHolder: data.detail?.nama_rekening || "",
          bankName: data.detail?.bank || "",
          province_id: data.detail?.province_id?.toString() || "",
          regency_id: data.detail?.regency_id?.toString() || "",
          district_id: data.detail?.district_id?.toString() || "",
          postal_code: data.detail?.postal_code || "",
          isPartnership: !!data.profile?.is_partnership,
          role: data.profile?.is_partnership ? 'partnership' : '',
          partnershipExpiresAt: data.profile?.partnership_expires_at || null,
        }))
        // "bank" tersimpan sebagai teks bebas; tebak jenisnya dari daftar e-wallet
        // supaya toggle & opsi dropdown yang benar langsung terpilih saat data dimuat.
        const savedBank = data.detail?.bank
        const isEwallet = EWALLET_OPTIONS.some((opt) => opt.value === savedBank)
        if (isEwallet) setAccountType('ewallet')

        // Kalau nilai tersimpan tidak ada di daftar bank/e-wallet manapun,
        // itu hasil input manual "Lainnya" — tampilkan sebagai input teks.
        const knownOptions = isEwallet ? EWALLET_OPTIONS : BANK_OPTIONS
        if (savedBank && !knownOptions.some((opt) => opt.value === savedBank)) {
          setUseCustomBankInput(true)
        }
        // Validasi: jika semua field bank sudah terisi, kunci form bank
        if (
          data.detail?.bank &&
          data.detail?.no_rek &&
          data.detail?.nama_rekening
        ) {
          setBankLocked(true)
        }
      } catch {
        // Optional: handle error
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const isProfileFormComplete = () => {
    return (
      formData.name.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.province_id !== "" &&
      formData.regency_id !== "" &&
      formData.district_id !== "" &&
      formData.postal_code.trim() !== "" &&
      formData.address.trim() !== ""
    )
  }

  const isBankFormComplete = () => {
    return (
      bankLocked ||
      (formData.bankName.trim() !== "" &&
        formData.accountNumber.trim() !== "" &&
        formData.accountHolder.trim() !== "")
    )
  }

  const goToBankSection = () => {
    openAccountSection('bank')
    setTimeout(() => {
      document.getElementById('form-rekening-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
  }

  const handleSaveProfile = async () => {
    if (!isProfileFormComplete()) {
      toast.error("Lengkapi semua data profil terlebih dahulu (Nama, No. WhatsApp, Provinsi, Kabupaten/Kota, Kecamatan, Kode Pos, dan Alamat).")
      return
    }
    setProfileLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/profile-detail`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          alamat: formData.address,
          province_id: formData.province_id,
          regency_id: formData.regency_id,
          district_id: formData.district_id,
          postal_code: formData.postal_code,
        }),
      })
      if (res.ok) {
        // Sinkronkan localStorage supaya nama yang dipakai di tempat lain
        // (navbar, hint video KYC) langsung ikut berubah, bukan cuma di DB.
        localStorage.setItem('name', formData.name)
        toast.success("Profil berhasil disimpan.")
        if (!isBankFormComplete()) {
          toast.info("Lanjutkan dengan melengkapi Nomor Rekening.")
          goToBankSection()
        }
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || errorData.message || "Gagal menyimpan profil.")
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan profil.")
    } finally {
      setProfileLoading(false)
    }
  }

  const handleSaveBank = async () => {
    setBankLoading(true)
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/profile-detail`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          no_rek: formData.accountNumber,
          nama_rekening: formData.accountHolder,
          bank: formData.bankName,
        }),
      });
      if (res.ok) {
        setBankLocked(true);
        toast.success("Rekening berhasil disimpan.");
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || errorData.message || "Gagal menyimpan rekening.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan rekening.");
    } finally {
      setBankLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordLoading(true)
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      if (res.ok) {
        toast.success("Password berhasil diganti.");
        setShowPasswordForm(false);
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || errorData.message || "Gagal mengganti password.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengganti password.");
    } finally {
      setPasswordLoading(false)
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCancelPasswordChange = () => {
    setShowPasswordForm(false)
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }))
  }
  const provinceOptions = provinces.map(p => ({
    value: p.id,
    label: p.name
  }));
  const regencyOptions = regencies.map(reg => ({
    value: reg.id,
    label: reg.name
  }));
  const districtOptions = districts.map(dis => ({
    value: dis.id,
    label: dis.name
  }));
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <>
      {/* TAMPILAN DASHBOARD MOBILE: Sembunyikan jika ada menu yang sedang aktif */}
      {!activeMobileMenu && (
        <div className="md:hidden">
          <MobileAccountPage profile={formData} onMenuClick={openAccountSection} />
        </div>
      )}

      {/* CONTAINER FORM UTAMA */}
      <div className={activeMobileMenu ? "block animate-in fade-in slide-in-from-bottom-4 duration-300" : "hidden md:block"}>

      {/* HEADER KEMBALI KHUSUS MOBILE */}
        {activeMobileMenu && (
          <div className="md:hidden flex items-center mb-6 mt-2 gap-3 px-4">
            <button
              onClick={closeAccountSection}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 text-gray-700 active:bg-gray-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              {activeMobileMenu === 'profile' ? 'Edit Profil' : activeMobileMenu === 'bank' ? 'Nomor Rekening' : 'Keamanan Akun'}
            </h2>
          </div>
        )}

      <Toaster richColors position="top-center" />

      <div className="pb-24 md:pb-0">
        <Link href="/dashboard/verifikasi" className="block mb-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">Verifikasi KYC</p>
                <p className="text-xs text-gray-500">Status verifikasi identitas akun Anda</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${KYC_STATUS_BADGE[kycStatus].className}`}>
                {KYC_STATUS_BADGE[kycStatus].label}
              </span>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </CardContent>
          </Card>
        </Link>

        <Alert className="border-orange-200 bg-orange-50 mb-6">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Lengkapi profil Anda. Nama harus sesuai rekening bank.
            </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Form 1: Profile Information */}
          <div id="form-profil-section" className={`md:block ${activeMobileMenu === 'profile' ? 'block' : 'hidden'}`}>
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-xl">Informasi Profil</CardTitle>
                      <CardDescription className="text-sm">Data pribadi dan kontak Anda</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-3 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <Input
                        id="name"
                        placeholder="Masukkan nama lengkap"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-3 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <Input id="email" type="email" value={formData.email} disabled className="pl-10 bg-gray-50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Nomor WhatsApp <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-3 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Masukkan nomor WhatsApp"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Dropdown bertingkat alamat */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province" className="text-sm font-medium">Provinsi <span className="text-red-500">*</span></Label>
                    <Select
                      options={provinceOptions}
                      value={provinceOptions.find(opt => opt.value === Number(formData.province_id))}
                      onChange={opt => handleInputChange("province_id", String(opt?.value))}
                      placeholder="Pilih Provinsi"
                      isClearable
                      isSearchable
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regency" className="text-sm font-medium">Kabupaten/Kota <span className="text-red-500">*</span></Label>
                    <Select
                      inputId="regency"
                      options={regencyOptions}
                      value={regencyOptions.find(opt => opt.value === Number(formData.regency_id))}
                      onChange={opt => handleInputChange("regency_id", String(opt?.value))}
                      placeholder="Pilih Kabupaten/Kota"
                      isClearable
                      isSearchable
                      isDisabled={!formData.province_id}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-sm font-medium">Kecamatan <span className="text-red-500">*</span></Label>
                    <Select
                      inputId="district"
                      options={districtOptions}
                      value={districtOptions.find(opt => opt.value === Number(formData.district_id))}
                      onChange={opt => handleInputChange("district_id", String(opt?.value))}
                      placeholder="Pilih Kecamatan"
                      isClearable
                      isSearchable
                      isDisabled={!formData.regency_id}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-sm font-medium">Kode Pos <span className="text-red-500">*</span></Label>
                    <Input
                      id="postalCode"
                      placeholder="Masukkan kode pos"
                      value={formData.postal_code}
                      onChange={e => handleInputChange("postal_code", e.target.value)}
                      disabled={!formData.district_id}
                    />
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Alamat Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="address"
                      placeholder="Masukkan alamat lengkap Anda"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">

                  </div>
                  <Button
                    className="bg-transparent bg-blue-600 hover:bg-blue-700"
                    onClick={handleSaveProfile}
                    disabled={profileLoading}
                  >
                    {profileLoading ? (
                      <span className="mr-2 animate-spin inline-block w-4 h-4 border-2 border-t-2 border-gray-400 rounded-full border-t-blue-600"></span>
                    ) : (
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    )}
                    Simpan Profil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 2. WRAPPER CARD REKENING */}
          {/* Hanya tampil di Desktop ATAU saat menu 'bank' dipilih di Mobile */}
          <div id="form-rekening-section" className={`md:block ${activeMobileMenu === 'bank' ? 'block' : 'hidden'}`}>
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-xl">Nomor Rekening</CardTitle>
                      <CardDescription className="text-sm">Informasi rekening bank untuk transaksi</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    <div className="space-y-1">
                      <p>Data lengkap wajib diisi sebelum transaksi. Nomor rekening hanya bisa disimpan sekali — hubungi kami untuk perubahan.</p>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Jenis Rekening</Label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'bank' as const, label: 'Rekening Bank', icon: '🏦' },
                      { value: 'ewallet' as const, label: 'E-Wallet', icon: '📱' },
                    ].map((option) => {
                      const isSelected = accountType === option.value;
                      return (
                        <button
                          key={option.value}
                          type='button' 
                          onClick={() => {
                            setAccountType(option.value);
                            setUseCustomBankInput(false);
                            handleInputChange("bankName", "");
                          }}
                          className={`flex items-center gap-2 h-11 px-5 rounded-full border text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bankName" className="text-sm font-medium">
                        {accountType === 'bank' ? 'Nama Bank' : 'Nama E-Wallet'}
                      </Label>
                      {useCustomBankInput && !bankLocked && (
                        <button
                          type="button"
                          onClick={() => {
                            setUseCustomBankInput(false);
                            handleInputChange("bankName", "");
                          }}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          Pilih dari daftar
                        </button>
                      )}
                    </div>
                    {useCustomBankInput ? (
                      <Input
                        id="bankName"
                        placeholder={accountType === 'bank' ? 'Masukkan nama bank' : 'Masukkan nama e-wallet'}
                        value={formData.bankName}
                        onChange={(e) => handleInputChange("bankName", e.target.value)} 
                      />
                    ) : (
                      <Select
                        inputId="bankName"
                        options={[...(accountType === 'bank' ? BANK_OPTIONS : EWALLET_OPTIONS), OTHER_BANK_OPTION]}
                        value={formData.bankName ? { value: formData.bankName, label: formData.bankName } : null}
                        onChange={(opt) => {
                          if (opt?.value === OTHER_BANK_OPTION.value) {
                            setUseCustomBankInput(true);
                            handleInputChange("bankName", "");
                            return;
                          }
                          handleInputChange("bankName", opt?.value || "");
                        }}
                        placeholder={accountType === 'bank' ? 'Pilih nama bank' : 'Pilih nama e-wallet'}
                        isClearable
                        isSearchable 
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber" className="text-sm font-medium">
                      {accountType === 'bank' ? 'Nomor Rekening' : 'Nomor HP Terdaftar'}
                    </Label>
                    <Input
                      id="accountNumber"
                      placeholder={accountType === 'bank' ? 'Masukkan nomor rekening' : 'Masukkan nomor HP e-wallet'}
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                      disabled={bankLocked}
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="accountHolder" className="text-sm font-medium">
                      Atas Nama
                    </Label>
                    <Input
                      id="accountHolder"
                      placeholder="Nama pemilik rekening (harus sama dengan nama profil)"
                      value={formData.accountHolder}
                      onChange={(e) => handleInputChange("accountHolder", e.target.value)}
                      disabled={bankLocked}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div>
                    </div>
                  </div>
                  <Button
                    className="bg-transparent bg-blue-600 hover:bg-blue-700"
                    onClick={handleSaveBank}
                    disabled={bankLocked || bankLoading}
                  >
                    {bankLoading ? (
                      <span className="mr-2 animate-spin inline-block w-4 h-4 border-2 border-t-2 border-gray-400 rounded-full border-t-green-600"></span>
                    ) : (
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    )}
                    Simpan Rekening
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Form 3: Password/Security */}
          <div className={`md:block ${activeMobileMenu === 'password' ? 'block' : 'hidden'}`}>
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl">Password</CardTitle>
                    <CardDescription className="text-sm">Kelola password dan pengaturan keamanan akun Anda</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {!showPasswordForm ? (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <svg
                        className="w-16 h-16 mx-auto text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600 mb-6 text-sm">Klik tombol di bawah untuk mengganti password Anda</p>
                    <Button onClick={() => setShowPasswordForm(true)} className="px-8">
                      Ganti Password
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2 lg:col-span-2">
                        <Label htmlFor="currentPassword" className="text-sm font-medium">
                          Password Saat Ini
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          placeholder="Masukkan password saat ini"
                          value={formData.currentPassword}
                          onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-medium">
                          Password Baru
                        </Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="Masukkan password baru"
                          value={formData.newPassword}
                          onChange={(e) => handleInputChange("newPassword", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                          Konfirmasi Password Baru
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Konfirmasi password baru"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        />
                      </div>
                    </div>

                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800 text-sm">
                        Pastikan password baru Anda kuat dan mudah diingat. Gunakan kombinasi huruf besar, huruf kecil,
                        angka, dan simbol.
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-end space-x-3 pt-2">
                      <Button variant="outline" onClick={handleCancelPasswordChange}>
                        Batal
                      </Button>
                      <Button className="bg-transparent bg-blue-600 hover:bg-blue-700" onClick={handleChangePassword} disabled={passwordLoading}>
                        {passwordLoading ? (
                          <span className="mr-2 animate-spin inline-block w-4 h-4 border-2 border-t-2 border-gray-400 rounded-full border-t-red-600"></span>
                        ) : null}
                        Simpan Password Baru
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div> 

        </div> 
      </div> 

      </div> 

    </>
  );
}
