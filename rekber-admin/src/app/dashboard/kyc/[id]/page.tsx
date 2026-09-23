"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, CheckCircle, Loader2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Toaster } from "sonner"
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"

const API_URL = process.env.NEXT_PUBLIC_API_URL
export const runtime = "edge";
interface KycDetail {
  id: number
  user_id: number
  user_name: string
  user_email: string
  user_phone: string
  nik: string
  ktp_photo_url: string
  selfie_with_ktp_url: string
  selfie_video_url: string
  status: "pending" | "approved" | "rejected"
  rejection_reason: string | null
  created_at: string
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
  }
  const labels: Record<string, string> = {
    pending: "Menunggu Review",
    approved: "Terverifikasi",
    rejected: "Ditolak",
  }
  return (
    <Badge variant="outline" className={`border-0 px-2 py-1 rounded text-xs font-medium ${styles[status] || "bg-muted text-muted-foreground"}`}>
      {labels[status] || status}
    </Badge>
  )
}

export default function KycDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [kyc, setKyc] = useState<KycDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [lightboxImage, setLightboxImage] = useState("")
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const fetchDetail = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/admin/dashboard/kyc/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      const data = await response.json()
      if (data.status) {
        setKyc(data.data)
      } else {
        toast.error(data.error || "Pengajuan KYC tidak ditemukan")
      }
    } catch (error) {
      console.error("Error fetching KYC detail:", error)
      toast.error("Gagal mengambil detail KYC")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const handleApprove = async () => {
    setProcessing(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/admin/dashboard/kyc/${params.id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.status) {
        toast.success("KYC berhasil diverifikasi")
        setIsApproveOpen(false)
        fetchDetail()
      } else {
        toast.error(data.error || "Gagal memverifikasi KYC")
      }
    } catch (error) {
      console.error("Error approving KYC:", error)
      toast.error("Terjadi kesalahan saat memverifikasi")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Alasan penolakan wajib diisi")
      return
    }
    setProcessing(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/admin/dashboard/kyc/${params.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: rejectReason }),
      })
      const data = await response.json()
      if (data.status) {
        toast.success("KYC ditolak")
        setIsRejectOpen(false)
        fetchDetail()
      } else {
        toast.error(data.error || "Gagal menolak KYC")
      }
    } catch (error) {
      console.error("Error rejecting KYC:", error)
      toast.error("Terjadi kesalahan saat menolak")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!kyc) {
    return (
      <div>
        <p className="text-sm text-muted-foreground">Pengajuan KYC tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <Toaster richColors position="top-center" />
      <div>
        <Link href="/dashboard/kyc" className="text-sm text-muted-foreground hover:underline flex items-center gap-1 mb-2">
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-balance">Detail Pengajuan KYC</h1>
          <StatusBadge status={kyc.status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Pengguna</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Nama</p>
            <p className="font-medium">{kyc.user_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Email</p>
            <p className="font-medium">{kyc.user_email}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Telepon</p>
            <p className="font-medium">{kyc.user_phone || "-"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">NIK</p>
            <p className="font-medium">{kyc.nik}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dokumen Verifikasi</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Foto KTP</p>
            <div className="relative w-full h-48 rounded-lg overflow-hidden border cursor-pointer" onClick={() => { setLightboxImage(kyc.ktp_photo_url); setLightboxOpen(true) }}>
              <Image src={kyc.ktp_photo_url} alt="Foto KTP" fill className="object-cover" unoptimized />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Foto Diri Memegang KTP</p>
            <div className="relative w-full h-48 rounded-lg overflow-hidden border cursor-pointer" onClick={() => { setLightboxImage(kyc.selfie_with_ktp_url); setLightboxOpen(true) }}>
              <Image src={kyc.selfie_with_ktp_url} alt="Selfie dengan KTP" fill className="object-cover" unoptimized />
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <p className="text-xs font-medium text-muted-foreground">Video Selfie Wajah</p>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video src={kyc.selfie_video_url} controls className="w-full max-h-96 rounded-lg border bg-black" />
          </div>
        </CardContent>
      </Card>

      {kyc.status === "rejected" && kyc.rejection_reason && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">
            <span className="font-medium">Alasan penolakan: </span>
            {kyc.rejection_reason}
          </CardContent>
        </Card>
      )}

      {kyc.status === "pending" && (
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button variant="destructive" onClick={() => setIsRejectOpen(true)}>
            <XCircle className="h-4 w-4 mr-2" /> Tolak
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsApproveOpen(true)}>
            <CheckCircle className="h-4 w-4 mr-2" /> Verifikasi
          </Button>
        </div>
      )}

      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={[{ src: lightboxImage }]}
        />
      )}

      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-green-600 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" /> Verifikasi KYC
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Yakin ingin memverifikasi identitas <strong>{kyc.user_name}</strong>? Status akun pengguna akan berubah menjadi terverifikasi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button variant="outline" onClick={() => setIsApproveOpen(false)}>Batal</Button>
              <Button onClick={handleApprove} disabled={processing} className="bg-green-600 hover:bg-green-700">
                {processing ? "Memproses..." : "Ya, Verifikasi"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" /> Tolak Pengajuan KYC
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Alasan penolakan (akan dilihat oleh pengguna)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Batal</Button>
              <Button variant="destructive" onClick={handleReject} disabled={processing}>
                {processing ? "Memproses..." : "Ya, Tolak"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
