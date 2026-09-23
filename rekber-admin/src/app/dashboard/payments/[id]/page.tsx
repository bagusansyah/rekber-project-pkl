"use client"
export const runtime = 'edge'

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  CreditCard,
  Banknote,
  Wallet,
  User,
  Calendar,
  Hash,
  Receipt,
  RefreshCw,
} from "lucide-react"

// Mock data - in real app this would come from API
const paymentDetails = {
  "PAY-001": {
    id: "PAY-001",
    transactionId: "TRX-001",
    payer: "John Doe",
    payee: "Jane Smith",
    payerEmail: "john.doe@email.com",
    payeeEmail: "jane.smith@email.com",
    amount: 2575000,
    escrowFee: 75000,
    netAmount: 2500000,
    method: "Bank Transfer",
    bank: "BCA",
    accountNumber: "1234567890",
    status: "completed",
    date: "2024-01-15",
    processedDate: "2024-01-15",
    reference: "TF240115001",
    description: "Pembayaran untuk pembelian laptop gaming ASUS ROG Strix G15",
    timeline: [
      { date: "2024-01-15 09:00", status: "initiated", description: "Pembayaran dimulai oleh pembeli" },
      { date: "2024-01-15 09:15", status: "pending", description: "Menunggu konfirmasi bank" },
      { date: "2024-01-15 09:30", status: "confirmed", description: "Pembayaran dikonfirmasi bank" },
      {
        date: "2024-01-15 09:35",
        status: "completed",
        description: "Dana masuk ke escrow, siap untuk transfer ke penjual",
      },
    ],
    bankDetails: {
      bankName: "Bank Central Asia (BCA)",
      accountName: "John Doe",
      accountNumber: "1234567890",
      branchCode: "0123",
      transactionId: "TF240115001",
    },
    adminNotes: [
      { date: "2024-01-15", admin: "Admin", note: "Pembayaran berhasil diverifikasi dan dana masuk ke escrow" },
    ],
  },
}

const statusConfig = {
  completed: { label: "Selesai", variant: "default" as const, icon: CheckCircle, color: "text-green-500" },
  pending: { label: "Menunggu", variant: "outline" as const, icon: Clock, color: "text-yellow-500" },
  waiting_confirmation: {
    label: "Menunggu Konfirmasi",
    variant: "secondary" as const,
    icon: Clock,
    color: "text-blue-500",
  },
  failed: { label: "Gagal", variant: "destructive" as const, icon: XCircle, color: "text-red-500" },
  refunded: { label: "Dikembalikan", variant: "destructive" as const, icon: AlertTriangle, color: "text-red-500" },
  initiated: { label: "Dimulai", variant: "outline" as const, icon: Clock, color: "text-gray-500" },
  confirmed: { label: "Dikonfirmasi", variant: "secondary" as const, icon: CheckCircle, color: "text-blue-500" },
}

const methodConfig = {
  "Bank Transfer": { icon: Banknote, color: "text-blue-600" },
  "E-Wallet": { icon: Wallet, color: "text-green-600" },
  "Credit Card": { icon: CreditCard, color: "text-purple-600" },
}

export default function PaymentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [newNote, setNewNote] = useState("")

  const paymentId = params.id as string
  const payment = paymentDetails[paymentId as keyof typeof paymentDetails]

  if (!payment) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <Card className="bg-white rounded-sm">
          <CardContent className="p-4 text-center">
            <p>Pembayaran tidak ditemukan</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const status = statusConfig[payment.status as keyof typeof statusConfig]
  const method = methodConfig[payment.method as keyof typeof methodConfig]
  const StatusIcon = status.icon
  const MethodIcon = method.icon

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      // In real app, this would save note via API
      console.log("Adding note:", newNote)
      setNewNote("")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-balance">Detail Pembayaran</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{payment.id}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Payment Info */}
          <Card className="bg-white rounded-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Informasi Pembayaran
                </CardTitle>
                <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pembayar</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{payment.payer}</p>
                      <p className="text-sm text-muted-foreground">{payment.payerEmail}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Penerima</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{payment.payee}</p>
                      <p className="text-sm text-muted-foreground">{payment.payeeEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-muted-foreground">Transaksi Terkait</label>
                <Link
                  href={`/dashboard/transactions/${payment.transactionId}`}
                  className="text-accent hover:underline font-medium"
                >
                  {payment.transactionId}
                </Link>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Deskripsi</label>
                <p className="mt-1">{payment.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Jumlah Total</label>
                  <p className="font-bold text-lg">{formatCurrency(payment.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Biaya Escrow</label>
                  <p className="font-medium text-destructive">-{formatCurrency(payment.escrowFee)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Jumlah Bersih</label>
                  <p className="font-bold text-lg text-green-600">{formatCurrency(payment.netAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Details */}
          <Card className="bg-white rounded-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MethodIcon className={`h-5 w-5 ${method.color}`} />
                Detail Metode Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Metode</label>
                  <p className="font-medium">{payment.method}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bank/Provider</label>
                  <p className="font-medium">{payment.bank}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nomor Rekening</label>
                  <p className="font-medium">{payment.accountNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Referensi</label>
                  <p className="font-medium">{payment.reference}</p>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-muted-foreground">Detail Bank</label>
                <div className="mt-2 p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Nama Bank:</span>
                    <span className="text-sm font-medium">{payment.bankDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Nama Pemilik:</span>
                    <span className="text-sm font-medium">{payment.bankDetails.accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Nomor Rekening:</span>
                    <span className="text-sm font-medium">{payment.bankDetails.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Kode Cabang:</span>
                    <span className="text-sm font-medium">{payment.bankDetails.branchCode}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-white rounded-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payment.timeline.map((item, index) => {
                  const timelineStatus = statusConfig[item.status as keyof typeof statusConfig]
                  const TimelineIcon = timelineStatus.icon

                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`p-2 rounded-full bg-background border-2 ${timelineStatus.color}`}>
                        <TimelineIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <Card className="bg-white rounded-sm">
            <CardHeader>
              <CardTitle>Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-transparent" variant="outline">
                <Hash className="h-4 w-4 mr-2" />
                Lihat Transaksi
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                <Receipt className="h-4 w-4 mr-2" />
                Cetak Bukti
              </Button>
              {payment.status === "completed" && (
                <Button className="w-full" variant="destructive">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Proses Refund
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="bg-white rounded-sm">
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Tanggal Pembayaran:</span>
                <span className="text-sm font-medium">{payment.date}</span>
              </div>
              {payment.processedDate && (
                <div className="flex justify-between">
                  <span className="text-sm">Tanggal Diproses:</span>
                  <span className="text-sm font-medium">{payment.processedDate}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm">Status:</span>
                <Badge variant={status.variant} className="flex items-center gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>{formatCurrency(payment.amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card className="bg-white rounded-sm">
            <CardHeader>
              <CardTitle>Catatan Admin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {payment.adminNotes.map((note, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{note.note}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      <span>{note.admin}</span>
                      <span>{note.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Tambah catatan admin..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleAddNote} className="w-full">
                  Tambah Catatan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
