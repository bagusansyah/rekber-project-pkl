"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Loader2, ShieldCheck } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface KycListItem {
  id: number
  user_id: number
  user_name: string
  user_email: string
  nik: string
  status: "pending" | "approved" | "rejected"
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
    <Badge variant="outline" className={`border-0 px-2 py-0.5 rounded text-[10px] font-medium ${styles[status] || "bg-muted text-muted-foreground"}`}>
      {labels[status] || status}
    </Badge>
  )
}

export default function KycListPage() {
  const router = useRouter()
  const [items, setItems] = useState<KycListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    const fetchKyc = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      setLoading(true)
      try {
        const params = statusFilter !== "all" ? `?status=${statusFilter}` : ""
        const response = await fetch(`${API_URL}/admin/dashboard/kyc${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token")
          router.push("/login")
          return
        }

        const data = await response.json()
        if (data.status) {
          setItems(data.data || [])
        }
      } catch (error) {
        console.error("Error fetching KYC list:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchKyc()
  }, [statusFilter, router])

  return (
    <div className="space-y-4 font-sans text-foreground">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-balance">
          <ShieldCheck className="h-6 w-6 text-blue-600 shrink-0" />
          Verifikasi KYC
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground text-balance">Tinjau pengajuan verifikasi identitas pengguna</p>
      </div>

      <Card className="bg-white rounded-sm overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base">Daftar Pengajuan</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu Review</SelectItem>
              <SelectItem value="approved">Terverifikasi</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0 relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-600 h-6 w-6" />
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="pl-4">Pengguna</TableHead>
                  <TableHead>NIK</TableHead>
                  <TableHead>Diajukan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-4">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <TableRow key={item.id} className="border-muted hover:bg-muted/50 transition-colors">
                      <TableCell className="pl-4 py-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground text-sm">{item.user_name}</span>
                          <span className="text-[11px] text-muted-foreground">{item.user_email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-sm text-muted-foreground">{item.nik}</TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="py-2">
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="text-right pr-4 py-2">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-blue-600 hover:bg-blue-50" asChild>
                          <Link href={`/dashboard/kyc/${item.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  !loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-sm text-muted-foreground">
                        Belum ada pengajuan KYC.
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
