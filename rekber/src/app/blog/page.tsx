import NavBar from "@/app/components/slicings/navbar";
import Footer from "@/app/components/slicings/footer";
import { BookOpen } from "lucide-react";
import BlogClientWrapper from "@/app/components/slicings/blog-client-wrapper";
import { API_URL, SITE_URL } from "@/constants/api";

interface BlogData {
  id: number;
  slug: string;
  title: string;
  image_url: string;
  content: string;
  category_name?: string;
  created_at: string;
}

async function getBlogs(): Promise<BlogData[]> {
  try {
    const res = await fetch(`${API_URL}/api/blogs/published`, {
      next: { revalidate: 60 } // MENGGANTIKAN { cache: 'no-store' }
    });
    
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Gagal menarik daftar blog:", error);
    return [];
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const metadata = {
  title: "Blog & Edukasi | Rekber.com",
  description: "Temukan panduan, tips keamanan, dan pembaruan terbaru layanan Rekber.com",
  keywords: ["blog rekber", "edukasi rekber", "tips transaksi aman", "rekening bersama"],
  alternates: { canonical: `${SITE_URL}/blog` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Blog & Edukasi | Rekber.com",
    description: "Temukan panduan, tips keamanan, dan pembaruan terbaru layanan Rekber.com",
    url: `${SITE_URL}/blog`,
    siteName: "Rekber.com",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Blog & Edukasi | Rekber.com",
    description: "Temukan panduan, tips keamanan, dan pembaruan terbaru layanan Rekber.com",
  },
};

export default async function BlogListPage() {
  const blogs = await getBlogs();

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 pt-24 pb-20">
        
        {/* Header Tetap Server-Side */}
        <div className="text-center max-w-3xl mx-auto mb-16 px-6">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <BookOpen className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
            Informasi & Edukasi
          </h1>
          <p className="text-lg text-gray-600">
            Panduan, tips keamanan, dan pembaruan terbaru layanan Rekber.com
          </p>
        </div>

        {/* Serahkan Data ke Client Wrapper untuk Diolah (Search, Filter, Paginasi) */}
        <BlogClientWrapper initialBlogs={blogs} />

      </main>
      <Footer />
    </>
  );
}