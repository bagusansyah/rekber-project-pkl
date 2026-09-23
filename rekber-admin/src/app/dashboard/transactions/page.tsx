"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, AlertTriangle, CheckCircle, Clock, XCircle, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, CheckCircle2, MinusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { isPartnershipValue } from "@/lib/formatters"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Transaction {
  id: string;
  kode_transaksi: string;
  pembeli: string;
  penjual: string;
  jumlah: string;
  status: string;
  kategori: string;
  tanggal: string;
  is_partnership: boolean;
  partnership_percentage: number;
}

interface PaginationData {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  showing: string;
}

const statusConfig = {
  draft: { label: "Draft", variant: "outline" as const, icon: Clock },
  wait_payment: { label: "Menunggu Pembayaran", variant: "outline" as const, icon: Clock },
  paid: { label: "Terbayar", variant: "secondary" as const, icon: CheckCircle },
  completed: { label: "Selesai", variant: "default" as const, icon: CheckCircle },
  disbursed: { label: "Sudah Dicairkan", variant: "default" as const, icon: CheckCircle },
  cancelled: { label: "Dibatalkan", variant: "secondary" as const, icon: XCircle },
  refunded: { label: "Dikembalikan", variant: "destructive" as const, icon: RefreshCw },
  disputed: { label: "Sengketa", variant: "destructive" as const, icon: AlertTriangle },
}

const statusOptions = [
  { value: "all", label: "Semua Status" },
  { value: "draft", label: "Draft" },
  { value: "disbursed", label: "Sudah Dicairkan" },
  { value: "wait_payment", label: "Menunggu Pembayaran" },
  { value: "paid", label: "Terbayar" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
  { value: "refunded", label: "Dikembalikan" },
  { value: "disputed", label: "Sengketa" },
]

const categoryOptions = [
  { value: "all", label: "Semua Kategori" },
  { value: "1", label: "Fisik" },
  { value: "2", label: "Jasa" }
]

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const response = await fetch(`${API_URL}/admin/dashboard/transactions?${params}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 403) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.status) {
        setTransactions(data.data.transactions || []);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, statusFilter, categoryFilter, itemsPerPage, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchTransactions();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || categoryFilter !== "all" || startDate !== "" || endDate !== "";

  const generatePageNumbers = () => {
    if (!pagination) return [];
    
    const { current_page, total_pages } = pagination;
    const pages = [];
    const showPages = 5; 
    
    let startPage = Math.max(1, current_page - Math.floor(showPages / 2));
    let endPage = Math.min(total_pages, startPage + showPages - 1);
    
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const formatStatusDisplay = (status: string) => {
    const s = status?.toUpperCase();

    if (s === "DRAFT") return "Draft";
    if (s === "DISBURSED") return "Sudah Dicairkan";
    if (s === "WAIT_PAYMENT" || s === "WAITING_PAYMENT") return "Menunggu Pembayaran";
    if (s === "PAID") return "Terbayar";
    if (s === "COMPLETED") return "Selesai";
    if (s === "CANCELLED" || s === "CANCELED") return "Dibatalkan";
    if (s === "REFUNDED") return "Dikembalikan";
    if (s === "DISPUTED" || s === "DISPUTE") return "Sengketa";

    return status;
  };

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();

    if (["PAID", "COMPLETED", "DISBURSED"].includes(s))
      return "bg-green-50 text-green-700 border-green-200";

    if (["DRAFT"].includes(s))
      return "bg-muted text-muted-foreground border-border";

    if (["REFUNDED", "CANCELLED", "CANCELED", "DISPUTED", "DISPUTE"].includes(s))
      return "bg-red-50 text-red-700 border-red-200";

    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-muted/50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
        <p className="text-muted-foreground text-sm font-medium">Memuat data transaksi...</p>
      </div>
    );
  }

  return (
    // REVISI: Hapus semua px dan py. Kurangi space-y menjadi 4 agar elemen di dalamnya ikut merapat.
    <div className="min-h-screen bg-transparent text-foreground space-y-4 font-sans">
      
      {/* HEADER UTAMA */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-balance">Manajemen Transaksi</h1>
        <p className="text-sm sm:text-base text-muted-foreground text-balance">Kelola semua transaksi escrow di seluruh platform.</p>
      </div>

      {/* FILTER CARD - VERSI TERPADAT */}
      <Card className="bg-white rounded-sm overflow-hidden">
        {/* REVISI 1: Padding header dipangkas menjadi px-4 py-3 (atas-bawah lebih rapat) */}
        {/* Header: Padding sangat rapat (pt-3 pb-2) untuk menempelkan judul ke garis pembatas */}
        <CardHeader className="px-4 pt-3 pb-2 border-b border-muted bg-white flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            Filter & Pencarian
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-[11px] text-red-600 hover:text-red-700 hover:bg-red-50">
              Reset Semua Filter
            </Button>
          )}
        </CardHeader>
        
        {/* REVISI 2: Padding konten dipangkas dari p-5 menjadi p-4 */}
        {/* Content: Padding atas hanya pt-2 agar label teks sangat dekat dengan garis pembatas */}
        <CardContent className="px-4 pb-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            
            {/* Search */}
            {/* Search - space-y-1 mendekatkan label ke input */}
            <div className="lg:col-span-2 space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="ID, nama pembeli, penjual..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-xs bg-white border-border focus-visible:ring-border"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Status</Label>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full h-8 text-xs bg-white border-border focus:ring-border">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs cursor-pointer">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Kategori</Label>
              <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full h-8 text-xs bg-white border-border focus:ring-border">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs cursor-pointer">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <Label htmlFor="start-date" className="text-xs font-medium text-muted-foreground">Dari Tanggal</Label>
              <div className="relative">
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 text-xs bg-white border-border focus-visible:ring-border text-foreground w-full"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <Label htmlFor="end-date" className="text-xs font-medium text-muted-foreground">Sampai Tanggal</Label>
              <div className="relative">
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 text-xs bg-white border-border focus-visible:ring-border text-foreground w-full"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-muted">
              {searchTerm && (
                <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-medium bg-muted text-foreground hover:bg-border border-0 flex items-center gap-1">
                  <span className="text-muted-foreground">Cari:</span> {searchTerm}
                  <button onClick={() => setSearchTerm("")} className="ml-1 text-muted-foreground hover:text-red-500 transition-colors">
                    <XCircle className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-medium bg-muted text-foreground hover:bg-border border-0 flex items-center gap-1">
                  <span className="text-muted-foreground">Status:</span> {statusOptions.find(s => s.value === statusFilter)?.label}
                  <button onClick={() => handleStatusChange("all")} className="ml-1 text-muted-foreground hover:text-red-500 transition-colors">
                    <XCircle className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {categoryFilter !== "all" && (
                <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-medium bg-muted text-foreground hover:bg-border border-0 flex items-center gap-1">
                  <span className="text-muted-foreground">Kategori:</span> {categoryOptions.find(c => c.value === categoryFilter)?.label}
                  <button onClick={() => handleCategoryChange("all")} className="ml-1 text-muted-foreground hover:text-red-500 transition-colors">
                    <XCircle className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {startDate && (
                <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-medium bg-muted text-foreground hover:bg-border border-0 flex items-center gap-1">
                  <span className="text-muted-foreground">Mulai:</span> {new Date(startDate).toLocaleDateString('id-ID')}
                  <button onClick={() => setStartDate("")} className="ml-1 text-muted-foreground hover:text-red-500 transition-colors">
                    <XCircle className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {endDate && (
                <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-medium bg-muted text-foreground hover:bg-border border-0 flex items-center gap-1">
                  <span className="text-muted-foreground">Akhir:</span> {new Date(endDate).toLocaleDateString('id-ID')}
                  <button onClick={() => setEndDate("")} className="ml-1 text-muted-foreground hover:text-red-500 transition-colors">
                    <XCircle className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* TABLE CARD */}
      <Card className="bg-white rounded-sm overflow-hidden">
        <CardHeader className="px-4 py-3 border-b border-muted bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-foreground">Daftar Transaksi</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {pagination?.showing || "Memuat data..."}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground hidden sm:block">Tampilkan:</p>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-20 h-8 text-xs bg-white border-border focus:ring-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-border min-w-[5rem]">
                <SelectItem value="10" className="text-xs">10</SelectItem>
                <SelectItem value="20" className="text-xs">20</SelectItem>
                <SelectItem value="50" className="text-xs">50</SelectItem>
                <SelectItem value="100" className="text-xs">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 relative min-h-[400px]">
          {/* Overlay Loading jika sedang memuat tapi data lama masih ada */}
          {loading && transactions.length > 0 && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-600 h-6 w-6" />
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-medium text-muted-foreground text-xs py-2 pl-4">ID Transaksi</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-2">Pembeli</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-2">Penjual</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-2">Partnership</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-2">Total</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-2">Status</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-2">Kategori</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-2 pr-4">Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => {
                    const status = statusConfig[transaction.status as keyof typeof statusConfig] || statusConfig.draft;

                    return (
                      <TableRow 
                        key={transaction.id} 
                        onClick={() => router.push(`/dashboard/transactions/${transaction.id}`)}
                        className="border-muted hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <TableCell className="font-medium text-foreground text-xs py-2 pl-4">{transaction.kode_transaksi}</TableCell>
                        <TableCell className="text-muted-foreground text-xs py-2">{transaction.pembeli}</TableCell>
                        <TableCell className="text-muted-foreground text-xs py-2">{transaction.penjual}</TableCell>
                        <TableCell className="py-2">
                          <div className="flex flex-col gap-1">
                            <Badge
                              className={cn(
                                "border font-semibold text-[10px] rounded px-1.5 py-0.5 shadow-none flex w-fit gap-1 items-center",
                                isPartnershipValue(transaction.is_partnership)
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                  : "bg-muted text-muted-foreground border-border hover:bg-muted"
                              )}
                            >
                              {isPartnershipValue(transaction.is_partnership) ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <MinusCircle className="h-3 w-3" />
                              )}
                              {isPartnershipValue(transaction.is_partnership) ? "Partnership" : "Non Partnership"}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground">
                              {isPartnershipValue(transaction.is_partnership)
                                ? `${transaction.partnership_percentage}% fee`
                                : "Default"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-foreground text-xs py-2">{transaction.jumlah}</TableCell>
                        <TableCell className="py-2">
                          <Badge
                            variant="outline"
                            className={`border font-medium flex w-fit items-center gap-1 px-2 py-0.5 rounded text-[10px] ${getStatusColor(transaction.status)}`}
                          >
                            {["PAID", "COMPLETED", "DISBURSED"].includes(transaction.status?.toUpperCase())
                              ? <CheckCircle className="h-3 w-3" />
                              : ["REFUNDED", "CANCELLED", "CANCELED", "DISPUTED", "DISPUTE"].includes(transaction.status?.toUpperCase())
                                ? <AlertTriangle className="h-3 w-3" />
                                : <Clock className="h-3 w-3" />
                            }
                            {formatStatusDisplay(transaction.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                           <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{transaction.kategori}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-[11px] py-2 pr-4">{transaction.tanggal}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <Search className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-sm font-medium">Tidak ada transaksi ditemukan.</p>
                        {hasActiveFilters && (
                          <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2 h-8 text-xs font-medium text-muted-foreground">
                            Hapus Semua Filter
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* FOOTER PAGINASI */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-muted bg-muted/50 gap-3">
              <div className="text-xs font-medium text-muted-foreground">
                Menampilkan <span className="text-foreground font-semibold">{((pagination.current_page - 1) * pagination.items_per_page) + 1}</span> - <span className="text-foreground font-semibold">{Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items)}</span> dari <span className="text-foreground font-semibold">{pagination.total_items}</span> data
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 border-border bg-white text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 border-border bg-white text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 px-1">
                  {generatePageNumbers().map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={`h-8 min-w-[2rem] text-xs font-medium ${
                        pageNum === currentPage 
                        ? "bg-foreground text-white hover:bg-foreground" 
                        : "border-border bg-white text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 border-border bg-white text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.total_pages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 border-border bg-white text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => handlePageChange(pagination.total_pages)}
                  disabled={currentPage === pagination.total_pages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
