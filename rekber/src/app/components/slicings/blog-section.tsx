"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { stripHtml } from "@/lib/utils"

export interface BlogData {
  id: number;
  slug: string;
  title: string;
  image_url: string;
  content: string;
  category_name: string;
  author_name: string;
  created_at: string;
}

export default function BlogSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [blogs, setBlogs] = useState<BlogData[]>([]);
  const [loading, setLoading] = useState(true);

  // Mengambil data dari Backend API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/published?limit=10`);
        if (!res.ok) throw new Error("Gagal mengambil data");

        const json = await res.json();
        setBlogs(json.data || []);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Fungsi untuk menggeser slider menggunakan tombol
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8; // Geser 80% dari lebar container
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-gray-50 py-16 lg:py-24 overflow-hidden">
      <div className="container max-w-7xl mx-auto px-6 relative">
        
        {/* Header Section */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
            Blog & Pembaruan Terbaru
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            Temukan panduan, tips keamanan, dan berita terkini seputar layanan Rekber.com
          </p>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Belum ada artikel yang diterbitkan.
          </div>
        ) : (
          /* CAROUSEL WRAPPER */
          <div className="relative group/carousel">
            
            {/* Tombol Navigasi Kiri */}
            <button 
              onClick={() => scroll('left')}
              className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-14 w-14 items-center justify-center rounded-full bg-white border border-gray-100 shadow-xl text-gray-600 hover:text-blue-600 hover:scale-110 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 focus:outline-none"
              aria-label="Geser Kiri"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            {/* SCROLL CONTAINER */}
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-6 lg:gap-8 pb-10 pt-4 -mx-6 px-6 lg:-mx-4 lg:px-4 
              [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {blogs.map((blog) => (
                // KARTU SLIDER (DIUBAH DARI DIV MENJADI LINK AGAR SEMUA KOTAK BISA DIKLIK)
                <Link 
                  href={`/blog/${blog.slug}`}
                  key={blog.id} 
                  className="block snap-start shrink-0 w-[85vw] sm:w-[45vw] lg:w-[calc(33.333%-1.4rem)] xl:w-[calc(33.333%-1.4rem)] flex flex-col bg-white rounded-[1.5rem] overflow-hidden shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 group cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="relative h-56 w-full overflow-hidden bg-gray-100 shrink-0">
                    <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-gray-900 shadow-sm">
                      {blog.category_name|| "Kategori"}
                    </div>
                    {/* Menggunakan Image Next.js untuk optimasi */}
                    <Image 
                      src={blog.image_url} 
                      alt={blog.title} 
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6 lg:p-8 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 font-medium">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> 
                        {new Date(blog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {/* Navigasi Sementara Menggunakan ID karena backend tidak mengirim slug */}
                      {/* DIUBAH MENJADI SPAN KARENA WADAH LUAR SUDAH BERUPA LINK */}
                      <span>
                        {blog.title}
                      </span>
                    </h3>
                    
                    <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                      {stripHtml(blog.content)}
                    </p>

                    {/* Footer Card */}
                    <div className="mt-auto pt-5 border-t border-gray-100">
                      {/* DIUBAH MENJADI SPAN KARENA WADAH LUAR SUDAH BERUPA LINK */}
                      <span 
                        className="inline-flex items-center font-bold text-blue-600 group-hover:text-blue-700"
                      >
                        Baca Selengkapnya <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Tombol Navigasi Kanan */}
            <button 
              onClick={() => scroll('right')}
              className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-14 w-14 items-center justify-center rounded-full bg-white border border-gray-100 shadow-xl text-gray-600 hover:text-blue-600 hover:scale-110 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 focus:outline-none"
              aria-label="Geser Kanan"
            >
              <ChevronRight className="h-8 w-8" />
            </button>

          </div>
        )}

        {/* Call to Action Utama */}
        <div className="mt-4 flex justify-center">
          <Link 
            href="/blog" 
            className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 font-bold text-lg rounded-full hover:bg-blue-50 hover:shadow-lg transition-all duration-300 group"
          >
            Lihat Semua Artikel <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </div>
  )
}