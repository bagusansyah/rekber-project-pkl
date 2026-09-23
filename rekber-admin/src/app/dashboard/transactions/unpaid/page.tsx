"use client";

import { useState, useEffect } from "react";
import {
  MoreHorizontal, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function WithdrawalPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Halaman ini sekarang khusus menampilkan data yang sudah SELESAI
  const [filterStatus, setFilterStatus] = useState("SELESAI");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  // --- STATE UNTUK PAGINASI ---
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // --- STATE UNTUK POPUP NOTIFIKASI ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000); 
  };

// 1. Deklarasikan variabel env-nya dulu di dalam komponenmu
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      // 2. Gunakan backtick (`) untuk menyisipkan variabel API_URL
      const res = await fetch(`${API_URL}/api/withdrawals`); 
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
      } else {
        throw new Error("Gagal fetch API");
      }
    } catch (error) {
      console.error("API Error:", error);
      setData([]); 
      alert("Gagal mengambil data dari server. Pastikan Backend menyala!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Reset ke halaman 1 setiap kali user ngetik pencarian atau ganti filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, rowsPerPage]);

  const handleProcess = async (newStatus: string) => {
    if (!selectedRequest) return;
    try {
      // 3. Gunakan backtick (`) lagi di sini, gabungkan API_URL dengan parameter id
      const res = await fetch(`${API_URL}/api/withdrawals/${selectedRequest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        showToast(`Sukses! Status ID ${selectedRequest.id} diubah menjadi ${newStatus}`);
        fetchWithdrawals();
      } else {
        throw new Error("Gagal update API");
      }
    } catch (error) {
      alert("Gagal mengupdate status. Cek koneksi backend.");
    } finally {
      setIsApproveOpen(false);
      setIsRejectOpen(false);
      setSelectedRequest(null);
    }
  };

// LOGIKA FILTER (HANYA SELESAI)
const filteredData = data.filter((item) => {
  // Hard lock ke status SELESAI
  const isStatusMatch = item.status === "SELESAI";

  const query = searchQuery.toLowerCase();
  const isSearchMatch = 
    item.seller_name?.toLowerCase().includes(query) || 
    String(item.id).toLowerCase().includes(query) ||
    item.bank_name?.toLowerCase().includes(query);

  return isStatusMatch && isSearchMatch;
});

  // LOGIKA PAGINASI (Memotong data sesuai halaman)
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const openApproveModal = (row: any) => {
    setSelectedRequest(row);
    setIsApproveOpen(true);
  };

  const openRejectModal = (row: any) => {
    setSelectedRequest(row);
    setIsRejectOpen(true);
  };

  return (
    <div className="space-y-4 font-sans text-foreground">

      {/* HEADER UTAMA */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-balance">Permintaan Pencairan</h1>
        <p className="text-sm sm:text-base text-muted-foreground text-balance">Kelola permintaan penarikan dana dari penjual yang belum diproses.</p>
      </div>

      <Card className="bg-white rounded-sm overflow-hidden">
        {/* HEADER TABEL DENGAN TOMBOL PENCARIAN, FILTER & REFRESH */}
        <CardHeader className="px-4 py-3 border-b border-muted bg-white flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-foreground">Daftar Antrean</CardTitle>
              {/* BADGE SELESAI */}
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-0.5 border border-emerald-200">
                 {data.filter(r => r.status === 'SELESAI').length} Selesai
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Menampilkan antrean berdasarkan pencarian dan filter status.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
            {/* KOTAK PENCARIAN */}
            <Input
              placeholder="Cari ID, Nama, Bank..."
              className="h-9 w-full sm:w-50 text-xs bg-white border-border focus-visible:ring-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <div className="flex items-center gap-2">

              {/* TOMBOL REFRESH */}
              <Button size="sm" variant="outline" className="h-9 px-3 text-xs font-medium bg-white hover:bg-muted border-border shadow-sm transition-all" onClick={fetchWithdrawals} disabled={loading}>
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />} 
                <span className="ml-2 hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-75">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="font-medium text-muted-foreground text-xs py-2 pl-4">ID Request</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-2">Pemohon</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-2">Bank Tujuan</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-2">Nominal</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-2">Tanggal</TableHead>
                  <TableHead className="text-right font-medium text-muted-foreground text-xs py-2 pr-4">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col justify-center items-center gap-3 text-muted-foreground text-sm">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" /> 
                        Memuat data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : currentRows.length === 0 ? (
                   <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                           <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {filterStatus === 'SELESAI' 
                            ? "Belum ada pencairan yang selesai." 
                            : "Tidak ada data ditemukan."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRows.map((row) => (
                    <TableRow key={row.id} className="border-muted hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium text-foreground text-xs py-2 pl-4">#{row.id}</TableCell>

                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                             <AvatarFallback className="bg-blue-50 text-blue-700 font-bold text-xs">
                                {row.seller_name ? row.seller_name.charAt(0) : "U"}
                             </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground">{row.seller_name}</span>
                            <span className="text-[11px] text-muted-foreground">{row.email}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                         <div className="flex flex-col">
                            <span className="font-bold text-[10px] text-foreground bg-muted border border-border px-1.5 py-0.5 rounded w-fit mb-1">{row.bank_name}</span>
                            <span className="text-[11px] text-muted-foreground font-medium">{row.account_number}</span>
                            <span className="text-[10px] text-muted-foreground">a.n {row.account_holder}</span>
                         </div>
                      </TableCell>

                      <TableCell className="font-bold text-foreground text-xs py-2">
                         Rp {Number(row.amount).toLocaleString('id-ID')}
                      </TableCell>

                      <TableCell className="text-[11px] text-muted-foreground py-2">{row.created_at || row.date}</TableCell>

                      <TableCell className="text-right pr-4 py-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-transparent hover:bg-muted focus:outline-none focus:ring-1 focus:ring-border transition-colors">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </DropdownMenuTrigger>
                          
                          <DropdownMenuContent align="end" className="bg-white w-48 rounded-none shadow-lg border-border p-1">
                            <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground px-2 py-1.5">Aksi Tindakan</DropdownMenuLabel>
                            
                            <DropdownMenuItem 
                              onClick={() => {
                                const rekToCopy = row.account_number || "Belum Diatur";
                                navigator.clipboard.writeText(String(rekToCopy)); 
                                showToast(`Berhasil menyalin rekening: ${rekToCopy}`);
                              }} 
                              className="text-sm font-medium cursor-pointer text-foreground focus:bg-muted"
                            >
                              Salin Rekening
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted" />
                            
                            {row.status === 'MENUNGGU' ? (
                              <>
                                <DropdownMenuItem 
                                  className="text-sm font-medium cursor-pointer text-emerald-600 rounded-md focus:bg-emerald-50 focus:text-emerald-700" 
                                  onClick={() => openApproveModal(row)}
                                >
                                   Setujui Pencairan
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-muted" />
                                <DropdownMenuItem 
                                  className="text-sm font-medium cursor-pointer text-red-600 rounded-md focus:bg-red-50 focus:text-red-700" 
                                  onClick={() => openRejectModal(row)}
                                >
                                   Tolak Permintaan
                                </DropdownMenuItem>
                              </>
                            ) : (
                               <DropdownMenuItem disabled className="text-xs text-muted-foreground italic font-medium justify-center">
                                  Sudah diproses
                               </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* --- FOOTER PAGINASI --- */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-muted bg-muted/50 gap-3">
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground font-medium">Tampilkan</p>
              <select
                className="h-8 rounded-sm border border-border bg-white text-xs text-foreground px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-border transition-shadow"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <p className="text-xs text-muted-foreground font-medium">data</p>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="font-medium hidden sm:inline-block">
                {filteredData.length === 0 ? "0" : indexOfFirstRow + 1} - {Math.min(indexOfLastRow, filteredData.length)} dari {filteredData.length}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 border-border bg-white hover:bg-muted text-muted-foreground"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 border-border bg-white hover:bg-muted text-muted-foreground"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* POPUP SETUJUI */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="bg-white rounded-xl">
          <DialogHeader>
            <DialogTitle>Konfirmasi Transfer</DialogTitle>
            <DialogDescription>Pastikan Anda sudah melakukan transfer ke:</DialogDescription>
          </DialogHeader>
          <div className="py-4">
             <div className="p-4 bg-muted border border-border rounded-lg text-sm space-y-2">
                <div className="flex justify-between">
                   <span className="text-muted-foreground">Bank:</span>
                   <span className="font-semibold text-foreground">{selectedRequest?.bank_name}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-muted-foreground">Rekening:</span>
                   <span className="font-mono text-foreground">{selectedRequest?.account_number}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-muted-foreground">Atas Nama:</span>
                   <span className="font-medium text-foreground">{selectedRequest?.account_holder}</span>
                </div>
                <div className="border-t border-border pt-3 mt-3 flex justify-between items-center">
                   <span className="text-muted-foreground">Nominal:</span>
                   <span className="font-bold text-lg text-emerald-600">
                      Rp {selectedRequest?.amount ? Number(selectedRequest.amount).toLocaleString('id-ID') : 0}
                   </span>
                </div>
             </div>
          </div>
          <DialogFooter>
             <Button variant="outline" className="text-xs font-medium" onClick={() => setIsApproveOpen(false)}>Batal</Button>
             <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium" onClick={() => handleProcess('SELESAI')}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Konfirmasi Selesai
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* POPUP TOLAK */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="bg-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-red-600">Tolak Permintaan</DialogTitle>
            <DialogDescription>Dana akan dikembalikan ke saldo dompet penjual.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
             <div className="grid w-full gap-1.5">
                <Label htmlFor="reason" className="text-sm font-medium text-foreground">Alasan Penolakan</Label>
                <Textarea id="reason" className="text-sm focus-visible:ring-border" placeholder="Contoh: Nama pemilik rekening tidak sesuai dengan KTP..." />
             </div>
          </div>
          <DialogFooter>
             <Button variant="outline" className="text-xs font-medium" onClick={() => setIsRejectOpen(false)}>Batal</Button>
             <Button variant="destructive" className="text-xs font-medium" onClick={() => handleProcess('DITOLAK')}>
                <XCircle className="mr-2 h-4 w-4" /> Tolak Permintaan
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* --- POPUP NOTIFIKASI (TOAST) --- */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-foreground text-white px-4 py-3 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}