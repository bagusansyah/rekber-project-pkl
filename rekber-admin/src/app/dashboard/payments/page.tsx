"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  CreditCard,
  Banknote,
  Wallet,
} from "lucide-react"

const payments = [
  {
    id: "PAY-001",
    transactionId: "TRX-001",
    payer: "John Doe",
    payee: "Jane Smith",
    amount: 2575000, // including escrow fee
    escrowFee: 75000,
    netAmount: 2500000,
    method: "Bank Transfer",
    bank: "BCA",
    status: "completed",
    date: "2024-01-15",
    processedDate: "2024-01-15",
    reference: "TF240115001",
  },
  {
    id: "PAY-002",
    transactionId: "TRX-002",
    payer: "Ahmad Rizki",
    payee: "Sari Indah",
    amount: 1236000,
    escrowFee: 36000,
    netAmount: 1200000,
    method: "E-Wallet",
    bank: "GoPay",
    status: "pending",
    date: "2024-01-15",
    processedDate: null,
    reference: "GP240115002",
  },
  {
    id: "PAY-003",
    transactionId: "TRX-003",
    payer: "Maria Santos",
    payee: "Tech Store",
    amount: 875500,
    escrowFee: 25500,
    netAmount: 850000,
    method: "Bank Transfer",
    bank: "Mandiri",
    status: "waiting_confirmation",
    date: "2024-01-14",
    processedDate: null,
    reference: "TF240114003",
  },
  {
    id: "PAY-004",
    transactionId: "TRX-004",
    payer: "Budi Santoso",
    payee: "Fashion Hub",
    amount: 3296000,
    escrowFee: 96000,
    netAmount: 3200000,
    method: "Bank Transfer",
    bank: "BNI",
    status: "failed",
    date: "2024-01-14",
    processedDate: null,
    reference: "TF240114004",
  },
  {
    id: "PAY-005",
    transactionId: "TRX-005",
    payer: "Lisa Wong",
    payee: "Auto Parts",
    amount: 772500,
    escrowFee: 22500,
    netAmount: 750000,
    method: "E-Wallet",
    bank: "OVO",
    status: "refunded",
    date: "2024-01-13",
    processedDate: "2024-01-13",
    reference: "OV240113005",
  },
]

const statusConfig = {
  completed: { label: "Selesai", variant: "default" as const, icon: CheckCircle },
  pending: { label: "Menunggu", variant: "outline" as const, icon: Clock },
  waiting_confirmation: { label: "Menunggu Konfirmasi", variant: "secondary" as const, icon: Clock },
  failed: { label: "Gagal", variant: "destructive" as const, icon: XCircle },
  refunded: { label: "Dikembalikan", variant: "destructive" as const, icon: AlertTriangle },
}

const methodConfig = {
  "Bank Transfer": { icon: Banknote, color: "text-blue-600" },
  "E-Wallet": { icon: Wallet, color: "text-green-600" },
  "Credit Card": { icon: CreditCard, color: "text-purple-600" },
}

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesMethod = methodFilter === "all" || payment.method === methodFilter

    return matchesSearch && matchesStatus && matchesMethod
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate stats
  const totalPayments = payments.length
  const completedPayments = payments.filter((p) => p.status === "completed").length
  const pendingPayments = payments.filter((p) => p.status === "pending" || p.status === "waiting_confirmation").length
  const totalVolume = payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-balance">Manajemen Pembayaran</h1>
        <p className="text-sm sm:text-base text-muted-foreground text-balance">Kelola semua pembayaran dan transfer dana</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
            <CardTitle className="text-[13px] font-medium text-muted-foreground">Total Pembayaran</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-foreground">{totalPayments}</div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
            <CardTitle className="text-[13px] font-medium text-muted-foreground">Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-foreground">{completedPayments}</div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
            <CardTitle className="text-[13px] font-medium text-muted-foreground">Menunggu</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-foreground">{pendingPayments}</div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
            <CardTitle className="text-[13px] font-medium text-muted-foreground">Volume Total</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-foreground">{formatCurrency(totalVolume)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white rounded-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari ID pembayaran, transaksi, pengguna, atau referensi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="waiting_confirmation">Menunggu Konfirmasi</SelectItem>
                <SelectItem value="failed">Gagal</SelectItem>
                <SelectItem value="refunded">Dikembalikan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Metode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Metode</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                <SelectItem value="Credit Card">Kartu Kredit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="bg-white rounded-sm">
        <CardHeader>
          <CardTitle>Daftar Pembayaran</CardTitle>
          <CardDescription>
            Menampilkan {filteredPayments.length} dari {payments.length} pembayaran
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Pembayaran</TableHead>
                  <TableHead>Transaksi</TableHead>
                  <TableHead>Pembayar</TableHead>
                  <TableHead>Penerima</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const status = statusConfig[payment.status as keyof typeof statusConfig]
                  const method = methodConfig[payment.method as keyof typeof methodConfig]
                  const StatusIcon = status.icon
                  const MethodIcon = method.icon

                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/transactions/${payment.transactionId}`}
                          className="text-accent hover:underline"
                        >
                          {payment.transactionId}
                        </Link>
                      </TableCell>
                      <TableCell>{payment.payer}</TableCell>
                      <TableCell>{payment.payee}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                          <p className="text-xs text-muted-foreground">Fee: {formatCurrency(payment.escrowFee)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MethodIcon className={`h-4 w-4 ${method.color}`} />
                          <div>
                            <p className="text-sm font-medium">{payment.method}</p>
                            <p className="text-xs text-muted-foreground">{payment.bank}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{payment.date}</p>
                          {payment.processedDate && (
                            <p className="text-xs text-muted-foreground">Diproses: {payment.processedDate}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/payments/${payment.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
