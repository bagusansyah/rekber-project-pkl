"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Search, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { stripHtml } from "@/lib/utils";

interface BlogData {
  id: number;
  slug: string;
  title: string;
  image_url: string;
  content: string;
  category_name?: string;
  created_at: string;
}

export default function BlogClientWrapper({ initialBlogs }: { initialBlogs: BlogData[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6; // Menampilkan 6 artikel per halaman

  // Ekstraksi kategori unik secara dinamis dari data backend
  const categories = useMemo(() => {
    const cats = initialBlogs.map(blog => blog.category_name || "Lainnya");
    return ["Semua", ...Array.from(new Set(cats))];
  }, [initialBlogs]);

  // Logika Filter (Berdasarkan Search & Category)
  const filteredBlogs = useMemo(() => {
    return initialBlogs.filter((blog) => {
      const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            stripHtml(blog.content).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Semua" || (blog.category_name || "Lainnya") === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [initialBlogs, searchQuery, selectedCategory]);

  // Logika Paginasi (Pemotongan Array)
  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE);
  const currentBlogs = filteredBlogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset halaman ke 1 jika user melakukan pencarian atau ganti kategori
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategory = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      
      {/* SECTION FILTER & SEARCH */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12">
        {/* Kategori Pills */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-blue-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari artikel..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>
      </div>

      {/* SECTION GRID ARTIKEL */}
      {currentBlogs.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <LayoutGrid className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak ada hasil</h3>
          <p className="text-gray-500">Kami tidak menemukan artikel yang sesuai dengan pencarian atau filter Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentBlogs.map((blog) => (
            // DIUBAH DARI DIV MENJADI LINK AGAR SELURUH KARTU BISA DIKLIK
            <Link 
              href={`/blog/${blog.slug}`} 
              key={blog.id} 
              className="block bg-white rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col group cursor-pointer"
            >
              <div className="relative h-56 w-full overflow-hidden bg-gray-100 shrink-0">
                <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-gray-900 shadow-sm">
                  {blog.category_name || "Artikel"}
                </div>
                <Image 
                  src={blog.image_url} 
                  alt={blog.title}
                  fill
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 md:p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 font-medium">
                  <Calendar className="h-4 w-4" /> 
                  {new Date(blog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                  {/* DIUBAH MENJADI SPAN KARENA WADAH LUAR SUDAH BERUPA LINK */}
                  <span>{blog.title}</span>
                </h2>
                <p className="text-gray-600 line-clamp-3 leading-relaxed">
                  {stripHtml(blog.content)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* SECTION PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-16 flex justify-center items-center gap-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${
                currentPage === i + 1 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}