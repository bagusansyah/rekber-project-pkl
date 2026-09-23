"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Eye, XCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react"
import { formatShortIndonesianDate, getPartnershipExpirationValue } from "@/lib/formatters"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface UserData {
  id: number;
  nama: string;
  email: string;
  kontak: string;
  no_rekening: string;
  nama_rekening: string;
  bergabung: string;
  active: number | boolean;
  is_partnership: boolean;
  partnership_percentage: number;
  partnership_expires_at?: string | null;
  partnership_expiration_date?: string | null;
}

interface PaginationData {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  showing: string;
}

export default function UsersPage() {
  const router = useRouter();
  // Variabel state diganti nama dari transactions menjadi users agar tidak membingungkan
  const [users, setUsers] = useState<UserData[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); 

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
 
      if (searchTerm.trim()) params.append("search", searchTerm.trim()); 

      const response = await fetch(`${API_URL}/admin/dashboard/users?${params}`, {
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
        setUsers(data.data.users || []);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to page 1 when searching
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm(""); 
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== "";

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    if (!pagination) return [];
    
    const { current_page, total_pages } = pagination;
    const pages = [];
    const showPages = 5; // Number of page buttons to show
    
    let startPage = Math.max(1, current_page - Math.floor(showPages / 2));
    let endPage = Math.min(total_pages, startPage + showPages - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // Tampilan utama saat memuat pertama kali (layar penuh)
  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-muted/50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
        <p className="text-muted-foreground text-sm font-medium">Memuat data pengguna...</p>
      </div>
    );
  }

  return (
    // Hapus p-6, min-h-screen, dan bg-muted/50. Gunakan space-y-4 agar lebih rapat.
    <div className="space-y-4 font-sans text-foreground">
      
      {/* HEADER UTAMA */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-balance">Manajemen Pengguna</h1>
        <p className="text-sm sm:text-base text-muted-foreground text-balance">Kelola semua pengguna dan akun di platform.</p>
      </div>

      {/* FILTER CARD KOMPAK (1 BARIS) */}
      <Card className="bg-white rounded-sm overflow-hidden">
        {/* Turunkan px-5 menjadi px-4 */}
        <div className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Bagian Kiri: Judul */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Pencarian Pengguna</h3>
          </div>

          {/* Bagian Kanan: Kolom Input & Tombol Reset */}
          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari ID, nama, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs bg-white border-border focus-visible:ring-border shadow-sm transition-all"
              />
            </div>
            
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters} 
                className="h-8 px-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0 transition-colors"
              >
                Reset
              </Button>
            )}
          </div>
          
        </div>
      </Card>

      {/* USERS TABLE CARD */}
      <Card className="bg-white rounded-sm overflow-hidden">
        {/* Pangkas p-5 menjadi px-4 py-3 */}
        <CardHeader className="px-4 py-3 border-b border-muted bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-foreground">Daftar Pengguna</CardTitle>
              {/* INDIKATOR TOTAL DATA */}
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-[10px] font-medium px-2 py-0.5 border border-blue-200">
                 {pagination?.total_items || 0} Total Akun
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              {pagination?.showing || "Memuat data..."}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground hidden sm:block">Tampilkan:</p>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-16 h-8 text-xs bg-white border-border focus:ring-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-border min-w-[4rem]">
                <SelectItem value="10" className="text-xs">10</SelectItem>
                <SelectItem value="20" className="text-xs">20</SelectItem>
                <SelectItem value="50" className="text-xs">50</SelectItem>
                <SelectItem value="100" className="text-xs">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 relative min-h-[400px]">
          {/* Overlay Loading transparan saat paginasi/search diubah */}
          {loading && users.length > 0 && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-600 h-6 w-6" />
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  {/* Ubah pl-6 jadi pl-4, pr-6 jadi pr-4 */}
                  <TableHead className="font-medium text-muted-foreground text-xs py-3 pl-4">Informasi Akun</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-3">Kontak</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-3">Informasi Rekening</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-3">Partnership</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-3">Bergabung</TableHead>
                  <TableHead className="font-medium text-muted-foreground text-xs py-3">Status</TableHead>
                  <TableHead className="text-right font-medium text-muted-foreground text-xs py-3 pr-4">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id} className="border-muted hover:bg-muted/50 transition-colors">
                      {/* NAMA & EMAIL DIGABUNG */}
                      <TableCell className="pl-4 py-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground text-sm">{user.nama}</span>
                          <span className="text-[11px] text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      
                      {/* KONTAK */}
                      <TableCell className="py-2">
                        <span className="text-xs text-muted-foreground font-medium">{user.kontak || "-"}</span>
                      </TableCell>
                      
                      {/* REKENING & ATAS NAMA DIGABUNG */}
                      <TableCell className="py-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground text-xs bg-muted border border-border px-1.5 py-0.5 rounded w-fit mb-0.5">{user.no_rekening || "Belum Diatur"}</span>
                          {user.nama_rekening && <span className="text-[10px] text-muted-foreground uppercase">A.N {user.nama_rekening}</span>}
                        </div>
                      </TableCell>
                      
                      {/* PARTNERSHIP */}
                      <TableCell className="py-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            className={`font-semibold text-[10px] rounded px-1.5 py-0.5 shadow-none flex w-fit gap-1 items-center border ${
                              user.is_partnership
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                : "bg-muted text-muted-foreground border-border hover:bg-muted"
                            }`}
                          >
                            {user.is_partnership ? `Partnership (${user.partnership_percentage}%)` : "Non Partnership"}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            Expires: {formatShortIndonesianDate(getPartnershipExpirationValue(user))}
                          </span>
                        </div>
                      </TableCell>
                      
                      {/* TANGGAL GABUNG */}
                      <TableCell className="text-muted-foreground text-[11px] py-2">
                        {user.bergabung}
                      </TableCell>
                      
                      {/* STATUS BADGE */}
                      <TableCell className="py-2">
                        <Badge 
                          variant="outline"
                          className={`border-0 px-2 py-0.5 rounded text-[10px] font-medium ${
                            user.active === 1 || user.active === true 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "bg-red-50 text-red-700"
                          }`}
                        >
                          {user.active === 1 || user.active === true ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </TableCell>
                      
                      {/* TOMBOL AKSI */}
                      <TableCell className="text-right pr-4 py-2">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-md" asChild>
                          <Link href={`/dashboard/users/${user.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-xs font-medium">Tidak ada data pengguna ditemukan.</p>
                        {hasActiveFilters && (
                          <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2 h-7 px-2 text-[11px] font-medium text-muted-foreground">
                            Hapus Pencarian
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
              <div className="text-[11px] font-medium text-muted-foreground">
                Menampilkan <span className="text-foreground font-semibold">{((pagination.current_page - 1) * pagination.items_per_page) + 1}</span> - <span className="text-foreground font-semibold">{Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items)}</span> dari <span className="text-foreground font-semibold">{pagination.total_items}</span> data
              </div>

              <div className="flex items-center gap-1">
                {/* Awal */}
                <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-border bg-white text-muted-foreground" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </Button>
                {/* Sebelumnya */}
                <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-border bg-white text-muted-foreground" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>

                {/* Nomor Halaman */}
                <div className="flex items-center px-1">
                  {generatePageNumbers().map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={`h-7 min-w-[1.75rem] text-[11px] font-medium ${
                        pageNum === currentPage 
                        ? "bg-foreground text-white" 
                        : "border-border bg-white text-muted-foreground border-x-0 first:border-l last:border-r rounded-none"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>

                {/* Selanjutnya */}
                <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-border bg-white text-muted-foreground" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.total_pages}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                {/* Akhir */}
                <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-border bg-white text-muted-foreground" onClick={() => handlePageChange(pagination.total_pages)} disabled={currentPage === pagination.total_pages}>
                  <ChevronsRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
