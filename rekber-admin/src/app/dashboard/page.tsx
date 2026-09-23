"use client";

import { useState, useEffect } from "react";
import {
  Filter,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Loader2,
  Wallet,
  AlertCircle,
  Users,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MinusCircle
} from "lucide-react";

import { isPartnershipValue } from "@/lib/formatters";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AnalyticsDashboardLight() {
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // State untuk Filter & Paginasi
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [stats, setStats] = useState({
    totalSaldo: 0,
    transaksiSukses: 0,
    komplainAktif: 0,
    totalUser: 0 
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("Token tidak ditemukan. Silakan login kembali.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/admin/all`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error("Sesi telah habis. Silakan login ulang.");
        throw new Error(`Gagal mengambil data API (Status: ${res.status})`);
      }

      const json = await res.json();
      const rawData = json.data || [];

      // 1. NORMALISASI STATUS 
      const normalizedData = rawData.map((t: any) => ({
        ...t,
        status: String(t.status || '').trim().toUpperCase(),
        amountFix: Number(t.total_amount) || Number(t.amount) || 0 
      }));

      setAllTransactions(normalizedData);

      // 2. HITUNG STATISTIK KARTU
      const totalSaldo = normalizedData
        .filter((t: any) => ['PAID', 'PROCESSED'].includes(t.status))
        .reduce((sum: number, t: any) => sum + t.amountFix, 0);

      const transaksiSukses = normalizedData.filter((t: any) => t.status === 'COMPLETED').length;
      const komplainAktif = normalizedData.filter((t: any) => ['DISPUTE', 'COMPLAIN'].includes(t.status)).length;
      const uniqueUsers = new Set(normalizedData.filter((t: any) => t.buyer_id).map((t: any) => t.buyer_id)).size;

      setStats({
        totalSaldo,
        transaksiSukses,
        komplainAktif,
        totalUser: uniqueUsers
      });
      setErrorMsg("");

    } catch (error: any) {
      console.error("Fetch Error:", error);
      setErrorMsg(error.message || "Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Reset ke halaman 1 setiap kali filter atau jumlah baris berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, rowsPerPage]);

  // --- LOGIKA FILTER TABEL ---
  const filteredTransactions = allTransactions.filter(t => {
    if (filterStatus === "Semua Status") return true;
    if (filterStatus === "Draft") return t.status === "DRAFT";
    if (filterStatus === "Sudah Dicairkan") return t.status === "DISBURSED";
    if (filterStatus === "Menunggu Pembayaran") return ["WAIT_PAYMENT", "WAITING_PAYMENT"].includes(t.status);
    if (filterStatus === "Terbayar") return t.status === "PAID";
    if (filterStatus === "Selesai") return t.status === "COMPLETED";
    if (filterStatus === "Dibatalkan") return t.status === "CANCELED";
    if (filterStatus === "Dikembalikan") return t.status === "REFUNDED";
    if (filterStatus === "Sengketa") return ["DISPUTE", "COMPLAIN"].includes(t.status);
    return true;
  });

  // --- LOGIKA PAGINASI ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredTransactions.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);

  const handleProcess = async (id: number | string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Sesi habis, silakan login kembali.");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${id}/complete`, { 
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      
      if (res.ok) {
        fetchTransactions(); 
      } else {
        alert(`Gagal mengupdate status: Ditolak server`);
      }
    } catch (error) {
      alert(`Gagal mengupdate status: Error koneksi`);
    }
  };

  const formatRupiahSingkat = (angka: number) => {
    if (angka >= 1000000) return `Rp ${(angka / 1000000).toFixed(1)}jt`;
    if (angka >= 1000) return `Rp ${(angka / 1000).toFixed(1)}k`;
    return `Rp ${angka.toLocaleString('id-ID')}`;
  };

  const formatStatusDisplay = (status: string) => {
    if (status === "DRAFT") return "Draft";
    if (status === "DISBURSED") return "Sudah Dicairkan";
    if (status === "WAIT_PAYMENT" || status === "WAITING_PAYMENT") return "Menunggu Pembayaran";
    if (status === "PAID") return "Terbayar"; 
    if (status === "COMPLETED") return "Selesai";
    if (status === "CANCELED") return "Dibatalkan";
    if (status === "REFUNDED") return "Dikembalikan";
    if (status === "DISPUTE" || status === "COMPLAIN") return "Sengketa";
    if (status === "PROCESSED") return "Diproses";
    return status; 
  };

  const getStatusColor = (status: string) => {
    if (["PAID", "COMPLETED", "DISBURSED"].includes(status)) return "bg-green-50 text-green-700 border-green-200";
    if (["DRAFT"].includes(status)) return "bg-muted text-muted-foreground border-border";
    if (["REFUNDED", "CANCELED", "DISPUTE", "COMPLAIN"].includes(status)) return "bg-red-50 text-red-700 border-red-200";
    return "bg-yellow-50 text-yellow-700 border-yellow-200"; 
  };

  const filterOptions = [
    "Semua Status", "Draft", "Sudah Dicairkan", "Menunggu Pembayaran", 
    "Terbayar", "Selesai", "Dibatalkan", "Dikembalikan", "Sengketa"
  ];

  return (
    // REVISI: Hapus min-h-screen, bg-muted/50, dan p-6. Gunakan space-y-4 agar rapat.
    <div className="space-y-4 font-sans text-foreground">
      
      {/* HEADER UTAMA */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-balance">Dashboard Rekber</h1>
        <p className="text-sm sm:text-base text-muted-foreground text-balance">Pemantauan aktivitas keuangan dan daftar transaksi.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-200 text-[13px] font-medium flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {errorMsg}
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {/* REVISI: Tambahkan class p-4 langsung ke CardHeader dan pb-0 untuk merapatkan */}
        <Card className="bg-white rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
            <CardTitle className="text-[13px] font-medium text-muted-foreground">Saldo Mengendap</CardTitle>
            <div className="p-1.5 bg-blue-50 rounded-md">
              <Wallet className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-foreground">{formatRupiahSingkat(stats.totalSaldo)}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Total dana tertahan di sistem</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
            <CardTitle className="text-[13px] font-medium text-muted-foreground">Transaksi Sukses</CardTitle>
            <div className="p-1.5 bg-emerald-50 rounded-md">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-foreground">{stats.transaksiSukses}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Total transaksi COMPLETED</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
            <CardTitle className="text-[13px] font-medium text-muted-foreground">Komplain Aktif</CardTitle>
            <div className={`p-1.5 rounded-md ${stats.komplainAktif > 0 ? "bg-red-50" : "bg-muted"}`}>
              <AlertCircle className={`h-4 w-4 ${stats.komplainAktif > 0 ? "text-red-600" : "text-muted-foreground"}`} />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-foreground">{stats.komplainAktif}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Menunggu resolusi admin</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
            <CardTitle className="text-[13px] font-medium text-muted-foreground">Pengguna Bertransaksi</CardTitle>
            <div className="p-1.5 bg-purple-50 rounded-md">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-foreground">{stats.totalUser}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Jumlah unik pembeli di sistem</p>
          </CardContent>
        </Card>
      </div>

      {/* TABEL TRANSAKSI */}
      <Card className="bg-white rounded-sm overflow-hidden">
        {/* REVISI: Ubah p-5 menjadi px-4 py-3 */}
        <CardHeader className="px-4 py-3 border-b border-muted bg-white flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-foreground">Daftar Transaksi</CardTitle>
              {/* INDIKATOR SEMUA DATA */}
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-[10px] font-medium px-2 py-0.5 border border-blue-200">
                 {allTransactions.length} Total Data
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">Menampilkan hasil filter: <span className="font-semibold text-foreground">{filterStatus}</span></p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-8 items-center justify-between w-[150px] rounded-md border border-border bg-white px-2.5 py-1.5 text-[11px] font-medium text-foreground shadow-sm hover:bg-muted focus:outline-none transition-colors">
                <span className="flex items-center truncate">
                  <Filter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {filterStatus}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white rounded-none shadow-lg border-border p-1">
                <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground px-2 py-1.5">Filter Status</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-muted" />
                {filterOptions.map((opt) => (
                  <DropdownMenuItem 
                    key={opt} 
                    onClick={() => setFilterStatus(opt)}
                    className={`text-[11px] cursor-pointer rounded-md mb-0.5 ${filterStatus === opt ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-foreground focus:bg-muted'}`}
                  >
                    {opt}
                    {filterStatus === opt && <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-blue-600" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" variant="outline" className="h-8 px-2.5 text-[11px] font-medium bg-white hover:bg-muted border-border shadow-sm transition-all" onClick={fetchTransactions} disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />} 
              <span className="ml-1.5 hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  {/* REVISI: Ubah py-4 jadi py-3, pl-6 jadi pl-4 */}
                  <TableHead className="font-medium text-muted-foreground text-xs py-3 pl-4">Kode Transaksi</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-3">Pihak Pembeli</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-3">Nominal</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-3">Partnership</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-3">Fee Partnership</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-3">Transfer Seller</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-3">Status</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-3">Dibuat Pada</TableHead>
                  <TableHead className="text-right font-medium text-muted-foreground text-xs py-3 pr-4">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col justify-center items-center gap-2 text-muted-foreground text-xs">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> 
                        Memuat data transaksi...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : currentRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
                           <AlertCircle className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-[11px] font-medium">Tidak ada transaksi ditemukan.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRows.map((row) => {
                    const adminFee = Number(row.fee_amount || 0);
                    const partnershipPercentage = Number(row.partnership_percentage || 0);
                    const isPartnership = isPartnershipValue(row.is_partnership);
                    const feePartnership = isPartnership ? (adminFee * partnershipPercentage) / 100 : 0;
                    const transferSeller = Number(row.total_amount || 0) - adminFee - feePartnership;

                    return (
                      <TableRow key={row.id} className="border-muted hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium text-foreground text-xs pl-4 py-2">{row.kode_transaksi}</TableCell>
                        <TableCell className="text-muted-foreground text-xs py-2">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                              {(row.buyer_name || 'U')[0]}
                            </div>
                            <span className="truncate max-w-[120px]">{row.buyer_name || `User #${row.buyer_id}`}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-foreground text-[11px] py-2">
                          Rp {row.amountFix ? row.amountFix.toLocaleString('id-ID') : Number(row.total_amount || 0).toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex flex-col gap-1">
                            <Badge
                              className={cn(
                                "border font-semibold text-[10px] rounded px-1.5 py-0.5 shadow-none flex w-fit gap-1 items-center",
                                isPartnership
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                  : "bg-muted text-muted-foreground border-border hover:bg-muted"
                              )}
                            >
                              {isPartnership ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <MinusCircle className="h-3 w-3" />
                              )}
                              {isPartnership ? "Partnership" : "Non Partnership"}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground">
                              {isPartnership
                                ? `${partnershipPercentage}% fee`
                                : "Default"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs py-2 font-medium">
                          {isPartnership ? (
                            `Rp ${feePartnership.toLocaleString('id-ID')}`
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-foreground text-xs py-2 font-bold">
                          Rp {transferSeller.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge variant="outline" className={`border font-medium flex w-fit items-center gap-1 px-2 py-0.5 rounded text-[10px] ${getStatusColor(row.status)}`}>
                            {["PAID", "COMPLETED", "DISBURSED"].includes(row.status) ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            {formatStatusDisplay(row.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-[11px] py-2">{row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-'}</TableCell>
                        <TableCell className="text-right pr-4 py-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-transparent hover:bg-muted focus:outline-none transition-colors">
                              <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white w-40 rounded-none shadow-lg border-border p-1">
                              <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground px-2 py-1">Aksi Cepat</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem onClick={() => handleProcess(row.id, 'COMPLETED')} className="text-[11px] font-medium cursor-pointer text-emerald-600 rounded-md focus:bg-emerald-50 focus:text-emerald-700 py-1.5">
                               Tandai Selesai
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem onClick={() => handleProcess(row.id, 'CANCELED')} className="text-[11px] font-medium cursor-pointer text-red-600 rounded-md focus:bg-red-50 focus:text-red-700 py-1.5">
                               Batalkan Transaksi
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* --- FOOTER PAGINASI --- */}
          {/* REVISI: Ubah px-6 py-4 menjadi px-4 py-3 */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-muted bg-muted/50 gap-3">
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-muted-foreground font-medium hidden sm:block">Tampilkan</p>
              <select
                className="h-7 rounded-sm border border-border bg-white text-[11px] text-foreground px-1.5 cursor-pointer focus:outline-none focus:ring-1 transition-shadow"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <p className="text-[10px] text-muted-foreground font-medium">data per halaman</p>
            </div>
            
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="font-medium">
                {filteredTransactions.length === 0 ? "0" : indexOfFirstRow + 1} - {Math.min(indexOfLastRow, filteredTransactions.length)} dari {filteredTransactions.length}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 border-border bg-white"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 border-border bg-white"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
