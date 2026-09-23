import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Facebook, Twitter, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import NavBar from "@/app/components/slicings/navbar";
import Footer from "@/app/components/slicings/footer";
import { stripHtml } from "@/lib/utils";
import { API_URL, SITE_URL } from "@/constants/api";
export const runtime = 'edge';

interface BlogDetail {
  id: number;
  slug: string;
  title: string;
  image_url: string;
  content: string;
  category_name?: string; 
  author_name?: string;  
  created_at: string;
}

async function getBlog(slug: string): Promise<BlogDetail | null> {
  try {
    const res = await fetch(`${API_URL}/api/blogs/${slug}`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Gagal menarik detail blog:", error);
    return null;
  }
}

// PERBAIKAN 1: Deklarasi tipe params sebagai Promise
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  // PERBAIKAN 2: Tunggu params (await) dan gunakan hasil tunggunya (resolvedParams)
  const resolvedParams = await params;
  const blog = await getBlog(resolvedParams.slug); 

  if (!blog) return { title: "Artikel Tidak Ditemukan | Rekber.com" };

  const postUrl = `${SITE_URL}/blog/${resolvedParams.slug}`;
  const description = stripHtml(blog.content).substring(0, 155).trim() + "...";

  return {
    title: `${blog.title} | Blog Rekber.com`,
    description,
    keywords: [blog.category_name, "rekber", "jasa rekber", "rekening bersama"].filter(Boolean) as string[],
    authors: [{ name: blog.author_name || "Admin Rekber" }],
    alternates: { canonical: postUrl },
    robots: { index: true, follow: true },
    openGraph: {
      title: blog.title,
      description,
      url: postUrl,
      siteName: 'Rekber.com',
      locale: 'id_ID',
      publishedTime: blog.created_at,
      authors: [blog.author_name || "Admin Rekber"],
      images: [{ url: blog.image_url, width: 1200, height: 630, alt: blog.title }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description,
      images: [blog.image_url],
    },
  };
}

// PERBAIKAN 3: Deklarasi tipe params komponen utama sebagai Promise
export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  // PERBAIKAN 4: Tunggu params (await) sebelum mengekstrak slug
  const resolvedParams = await params;
  const blog = await getBlog(resolvedParams.slug);

  if (!blog) notFound();

  const postUrl = `${SITE_URL}/blog/${resolvedParams.slug}`;
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(blog.title);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    image: [blog.image_url],
    datePublished: blog.created_at,
    dateModified: blog.created_at,
    author: {
      "@type": "Person",
      name: blog.author_name || "Admin Rekber",
    },
    publisher: {
      "@type": "Organization",
      name: "Rekber.com",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo-og.jpg`,
      },
    },
    description: stripHtml(blog.content).substring(0, 155).trim() + "...",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NavBar />
      <div className="bg-white min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          
          <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Artikel
          </Link>

          <header className="mb-10 text-center">
            <div className="inline-block bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
              {blog.category_name || "Artikel"} 
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              {blog.title}
            </h1>
            <div className="flex items-center justify-center gap-6 text-gray-500 text-sm">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(blog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="flex items-center gap-2"><User className="w-4 h-4" /> {blog.author_name || "Admin Rekber"}</span>
            </div>
          </header>

          <div className="relative w-full h-[400px] md:h-[500px] mb-12 rounded-2xl overflow-hidden shadow-lg bg-gray-100">
            <Image 
              src={blog.image_url} 
              alt={blog.title}
              fill
              className="object-cover"
              priority 
            />
          </div>

          <article
            className="prose prose-lg md:prose-xl max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <h3 className="text-lg font-bold text-gray-900">Bagikan Artikel Ini:</h3>
            <div className="flex items-center gap-4">
              <a href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors" aria-label="Share ke WhatsApp">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-50 text-blue-400 rounded-full hover:bg-blue-100 transition-colors" aria-label="Share ke Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors" aria-label="Share ke Facebook">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}