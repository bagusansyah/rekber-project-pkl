"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Search, RefreshCw, Filter, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

// Types
interface Voucher {
  id: number
  code: string
  value: number
  usage_limit: number
  used_count: number
  remaining_usage: number
  is_active: boolean
  created_at: string
  updated_at: string
  description?: string
}

interface CreateVoucherRequest {
  code: string
  value: number
  usage_limit: number
}

interface UpdateVoucherRequest {
  code?: string
  value?: number
  usage_limit?: number
  is_active?: boolean
}

// API Service
class VoucherService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL

  async getVouchers(search?: string): Promise<Voucher[]> {
    try {
      const token = localStorage.getItem("token");
      const url = new URL(`${this.baseUrl}/vouchers`)
      if (search) {
        url.searchParams.append('search', search)
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch vouchers')
      }
      
      return data.data.vouchers || []
    } catch (error) {
      console.error('Error fetching vouchers:', error)
      throw error
    }
  }

  async createVoucher(voucher: CreateVoucherRequest): Promise<Voucher> {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${this.baseUrl}/vouchers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voucher),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create voucher')
      }
      
      return data.data
    } catch (error) {
      console.error('Error creating voucher:', error)
      throw error
    }
  }

  async updateVoucher(id: number, voucher: UpdateVoucherRequest): Promise<Voucher> {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${this.baseUrl}/vouchers/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voucher),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update voucher')
      }
      
      return data.data
    } catch (error) {
      console.error('Error updating voucher:', error)
      throw error
    }
  }

  async deleteVoucher(id: number): Promise<void> {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${this.baseUrl}/vouchers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to delete voucher')
      }
    } catch (error) {
      console.error('Error deleting voucher:', error)
      throw error
    }
  }
}

const voucherService = new VoucherService()

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    value: 0,
    usage_limit: 1
  })

  // Load vouchers
  const loadVouchers = async () => {
    try {
      setLoading(true)
      let data: Voucher[]
      
      data = await voucherService.getVouchers()
      setVouchers(data)
      setFilteredVouchers(data)
    } catch (error) {
      toast.error("Gagal memuat data voucher")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVouchers()
  }, [])

  // Filter vouchers based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredVouchers(vouchers)
    } else {
      const filtered = vouchers.filter(voucher =>
        voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredVouchers(filtered)
    }
  }, [searchTerm, vouchers])

  const resetForm = () => {
    setFormData({ code: "", value: 0, usage_limit: 1 })
  }

  const handleCreate = async () => {
    if (!formData.code || formData.value <= 0 || formData.usage_limit <= 0) {
      toast.error("Harap isi semua field dengan benar")
      return
    }

    // Check if code already exists
    if (vouchers.some(v => v.code.toLowerCase() === formData.code.toLowerCase())) {
      toast.error("Kode voucher sudah ada")
      return
    }

    try {
      setLoading(true)
      
      // For mock implementation
      const newVoucher: Voucher = {
        id: Date.now(),
        code: formData.code.toUpperCase(),
        value: formData.value,
        usage_limit: formData.usage_limit,
        used_count: 0,
        remaining_usage: formData.usage_limit,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: ""
      }
      
      setVouchers([...vouchers, newVoucher])
      
      // Uncomment for real API
      await voucherService.createVoucher({
        code: formData.code.toUpperCase(),
        value: formData.value,
        usage_limit: formData.usage_limit
      })
      
      resetForm()
      setIsCreateOpen(false)
      toast.success("Voucher berhasil dibuat")
      
      // loadVouchers(false) // Use this for real API
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat voucher")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!editingVoucher || !formData.code || formData.value <= 0 || formData.usage_limit <= 0) {
      toast.error("Harap isi semua field dengan benar")
      return
    }

    // Check if code already exists (except current voucher)
    if (vouchers.some(v => v.id !== editingVoucher.id && v.code.toLowerCase() === formData.code.toLowerCase())) {
      toast.error("Kode voucher sudah ada")
      return
    }
    
    try {
      setLoading(true)
      
      // For mock implementation
      const updatedVouchers = vouchers.map(v => 
        v.id === editingVoucher.id 
          ? { 
              ...v, 
              code: formData.code.toUpperCase(), 
              value: formData.value, 
              usage_limit: formData.usage_limit,
              remaining_usage: formData.usage_limit - v.used_count,
              updated_at: new Date().toISOString()
            }
          : v
      )
      setVouchers(updatedVouchers)
      
      // Uncomment for real API
      await voucherService.updateVoucher(editingVoucher.id, {
        code: formData.code.toUpperCase(),
        value: formData.value,
        usage_limit: formData.usage_limit
      })
      
      setIsEditOpen(false)
      setEditingVoucher(null)
      resetForm()
      toast.success("Voucher berhasil diupdate")
      
      // loadVouchers(false) // Use this for real API
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengupdate voucher")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    const voucher = vouchers.find(v => v.id === id)
    if (voucher && voucher.used_count > 0) {
      toast.error("Tidak dapat menghapus voucher yang sudah digunakan")
      return
    }

    if (!confirm("Yakin ingin menghapus voucher ini?")) return
    
    try {
      setLoading(true)
      
      // For mock implementation
      setVouchers(vouchers.filter(v => v.id !== id))
       
      await voucherService.deleteVoucher(id)
      
      toast.success("Voucher berhasil dihapus")
      
      // loadVouchers(false) // Use this for real API
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus voucher")
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (voucher: Voucher) => {
    try {
      setLoading(true)
      
      // For mock implementation
      const updatedVouchers = vouchers.map(v => 
        v.id === voucher.id ? { ...v, is_active: !v.is_active, updated_at: new Date().toISOString() } : v
      )
      setVouchers(updatedVouchers)
      
      // Uncomment for real API
      await voucherService.updateVoucher(voucher.id, {
        is_active: !voucher.is_active
      })
      
      toast.success("Status voucher berhasil diubah")
      
      // loadVouchers(false) // Use this for real API
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengubah status voucher")
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (voucher: Voucher) => {
    setEditingVoucher(voucher)
    setFormData({
      code: voucher.code,
      value: voucher.value,
      usage_limit: voucher.usage_limit
    })
    setIsEditOpen(true)
  }

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100)
  }

  // Helper untuk warna badge UX Baru
  const getCustomBadgeClass = (voucher: Voucher) => {
    if (!voucher.is_active) return "bg-muted text-muted-foreground border-0"
    if (voucher.used_count >= voucher.usage_limit) return "bg-red-50 text-red-700 border-0"
    if (voucher.used_count / voucher.usage_limit > 0.8) return "bg-yellow-50 text-yellow-700 border-0"
    return "bg-emerald-50 text-emerald-700 border-0"
  }

  const getStatusText = (voucher: Voucher) => {
    if (!voucher.is_active) return "Non-Aktif"
    if (voucher.used_count >= voucher.usage_limit) return "Habis"
    return "Aktif"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    // Hapus min-h-screen, bg-muted/50, dan p-6. Gunakan space-y-4 agar konsisten.
    <div className="space-y-4 font-sans text-foreground">
      
      {/* HEADER UTAMA */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-balance">Manajemen Voucher</h1>
        <p className="text-sm sm:text-base text-muted-foreground text-balance">Kelola kode diskon dan kuota penggunaan untuk pengguna.</p>
      </div>

      {/* FILTER CARD KOMPAK (1 BARIS) */}
      <Card className="bg-white rounded-sm overflow-hidden">
        {/* Turunkan px-5 menjadi px-4 dan py-3 tetap */}
        <div className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Pencarian Voucher</h3>
          </div>

          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
            {/* Turunkan lebar max menjadi 300px agar tidak menabrak batas */}
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari kode voucher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
                className="pl-8 h-8 text-xs bg-white border-border focus-visible:ring-border shadow-sm transition-all"
              />
            </div>
            
            {searchTerm && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSearchTerm("")} 
                className="h-8 px-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0 transition-colors"
              >
                Reset
              </Button>
            )}
          </div>
          
        </div>
      </Card>

      {/* TABLE CARD */}
      <Card className="bg-white rounded-sm overflow-hidden">
        {/* Pangkas p-5 menjadi px-4 py-3 */}
        <CardHeader className="px-4 py-3 border-b border-muted bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-foreground">Daftar Voucher</CardTitle>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-[10px] font-medium px-2 py-0.5 border border-blue-200">
               {filteredVouchers.length} Total Data
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={() => loadVouchers()} disabled={loading} className="h-8 px-2.5 text-xs font-medium bg-white hover:bg-muted border-border shadow-sm transition-all">
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={loading} className="h-8 px-2.5 text-xs font-medium bg-foreground text-white hover:bg-foreground shadow-sm transition-all">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Tambah
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Buat Voucher Baru</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="code" className="text-xs font-medium text-foreground">Kode Voucher <span className="text-red-500">*</span></Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="Contoh: HEMAT10K"
                      style={{ textTransform: 'uppercase' }}
                      className="text-sm h-9 border-border focus-visible:ring-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="value" className="text-xs font-medium text-foreground">Potongan Harga (Rp) <span className="text-red-500">*</span></Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.value || ""}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                      placeholder="10000"
                      min="1"
                      className="text-sm h-9 border-border focus-visible:ring-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="usage_limit" className="text-xs font-medium text-foreground">Batas Penggunaan (Kuota) <span className="text-red-500">*</span></Label>
                    <Input
                      id="usage_limit"
                      type="number"
                      value={formData.usage_limit || ""}
                      onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
                      placeholder="100"
                      min="1"
                      className="text-sm h-9 border-border focus-visible:ring-border"
                    />
                  </div>
                  <Button onClick={handleCreate} className="w-full mt-4 h-9 text-xs bg-foreground text-white hover:bg-foreground" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                    {loading ? "Menyimpan..." : "Simpan Voucher"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 relative min-h-[400px]">
          {loading && vouchers.length > 0 && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-600 h-6 w-6" />
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  {/* Ubah pl-6 jadi pl-4, pr-6 jadi pr-4, py-4 jadi py-3 */}
                  <TableHead className="font-medium text-muted-foreground text-xs py-3 pl-4">Kode Voucher</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-3">Nilai Potongan</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-3">Kuota Penggunaan</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-3">Status</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-3">Dibuat Pada</TableHead>
                  <TableHead className="text-right font-medium text-muted-foreground text-xs py-3 pr-4">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && vouchers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="animate-spin text-blue-600 h-6 w-6" />
                        <p className="text-muted-foreground text-xs font-medium">Memuat data voucher...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredVouchers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-xs font-medium">
                          {searchTerm ? "Tidak ada voucher yang cocok dengan pencarian." : "Belum ada voucher yang dibuat."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVouchers.map((voucher) => (
                    <TableRow key={voucher.id} className="border-muted hover:bg-muted/50 transition-colors">
                      {/* Tambahkan py-2 untuk menyempitkan jarak atas-bawah sel */}
                      <TableCell className="pl-4 py-2">
                        <span className="font-mono font-bold text-foreground text-[12px] bg-muted border border-border px-1.5 py-0.5 rounded">
                          {voucher.code}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-emerald-600 text-xs py-2">
                        Rp {voucher.value.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="space-y-1 w-full max-w-[150px]">
                          <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                            <span>{voucher.used_count} Dipakai</span>
                            <span>{voucher.usage_limit} Batas</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1 border border-border/50 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${getUsagePercentage(voucher.used_count, voucher.usage_limit) > 80 ? 'bg-red-500' : 'bg-blue-500'}`} 
                              style={{ width: `${getUsagePercentage(voucher.used_count, voucher.usage_limit)}%` }}
                            ></div>
                          </div>
                          <div className="text-[9px] text-muted-foreground font-medium">
                            Sisa kuota: {voucher.remaining_usage}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge 
                          variant="outline"
                          className={`cursor-pointer px-2 py-0.5 rounded text-[10px] font-medium shadow-none hover:opacity-80 transition-opacity ${getCustomBadgeClass(voucher)}`}
                          onClick={() => toggleStatus(voucher)}
                        >
                          {getStatusText(voucher)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-[11px] font-medium py-2">
                        {formatDate(voucher.created_at)}
                      </TableCell>
                      <TableCell className="text-right pr-4 py-2">
                        <div className="flex justify-end items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(voucher)}
                            disabled={loading}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-md"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(voucher.id)}
                            disabled={loading || voucher.used_count > 0}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors rounded-md"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Voucher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="editCode" className="text-xs font-medium text-foreground">Kode Voucher <span className="text-red-500">*</span></Label>
              <Input
                id="editCode"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                style={{ textTransform: 'uppercase' }}
                className="text-sm h-9 border-border focus-visible:ring-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editValue" className="text-xs font-medium text-foreground">Potongan Harga (Rp) <span className="text-red-500">*</span></Label>
              <Input
                id="editValue"
                type="number"
                value={formData.value || ""}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                min="1"
                className="text-sm h-9 border-border focus-visible:ring-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editUsageLimit" className="text-xs font-medium text-foreground">Batas Penggunaan (Kuota) <span className="text-red-500">*</span></Label>
              <Input
                id="editUsageLimit"
                type="number"
                value={formData.usage_limit || ""}
                onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
                min="1"
                className="text-sm h-9 border-border focus-visible:ring-border"
              />
            </div>
            <Button onClick={handleEdit} className="w-full mt-4 h-9 text-xs bg-foreground text-white hover:bg-foreground" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
              {loading ? "Menyimpan Perubahan..." : "Update Voucher"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
