"use client"
import Link from 'next/link';
import NavBar from '../components/slicings/navbar';
import Footer from '../components/slicings/footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tag } from "lucide-react" // Import icon

export default function FAQPage() {
  const faqItems = [
    {
      question: "Apa itu Rekber.com?",
      answer:
        "Rekber.com adalah layanan escrow (rekening bersama) yang menjembatani transaksi jual beli online agar lebih aman dan terpercaya. Kami menahan dana pembayaran dari pembeli hingga barang diterima dan disetujui oleh pembeli, baru kemudian dana diteruskan kepada penjual.",
      category: "Umum",
    },
    {
      question: "Bagaimana cara kerja Rekber.com?",
      answer:
        "Pembeli melakukan pembayaran ke rekening Rekber.com. Penjual mengirimkan barang. Setelah pembeli menerima dan memeriksa barang, pembeli mengkonfirmasi penerimaan. Rekber.com kemudian melepaskan dana kepada penjual. Jika ada masalah, kami akan membantu mediasi.",
      category: "Proses Transaksi",
    },
    {
      question: "Apakah ada biaya untuk menggunakan Rekber.com?",
      answer:
        "Ya, ada biaya layanan yang dikenakan untuk setiap transaksi. Detail biaya dapat dilihat di halaman 'Fee' kami.",
      category: "Biaya & Pembayaran",
    },
    {
      question: "Barang apa saja yang bisa ditransaksikan melalui Rekber.com?",
      answer:
        "Kami mendukung berbagai jenis barang, terutama gadget dan barang elektronik. Untuk jenis barang lain, silakan hubungi dukungan pelanggan kami untuk konfirmasi.",
      category: "Jenis Barang",
    },
    {
      question: "Bagaimana jika ada perselisihan dalam transaksi?",
      answer:
        "Rekber.com akan bertindak sebagai mediator untuk menyelesaikan perselisihan antara pembeli dan penjual. Kami akan meminta bukti dan informasi dari kedua belah pihak untuk mencapai solusi yang adil.",
      category: "Penyelesaian Sengketa",
    },
    {
      question: "Berapa lama proses transaksi dengan Rekber.com?",
      answer:
        "Durasi transaksi bervariasi tergantung pada kecepatan pengiriman dan konfirmasi dari pembeli. Umumnya, setelah barang diterima dan dikonfirmasi, dana akan diteruskan dalam waktu 1x24 jam.",
      category: "Proses Transaksi",
    },
    {
      question: "Apakah data pribadi saya aman di Rekber.com?",
      answer:
        "Kami sangat menjaga privasi dan keamanan data pengguna. Semua informasi pribadi dienkripsi dan dilindungi sesuai standar keamanan tertinggi.",
      category: "Keamanan & Privasi",
    },
    {
      question: "Bagaimana cara mendaftar di Rekber.com?",
      answer:
        "Anda dapat mendaftar dengan mengklik tombol 'Register' di pojok kanan atas halaman. Ikuti langkah-langkah pendaftaran yang mudah dan cepat.",
      category: "Umum",
    },
    {
      question: "Metode pembayaran apa saja yang diterima?",
      answer:
        "Kami menerima berbagai metode pembayaran populer, termasuk transfer bank dan e-wallet. Detail lengkap tersedia saat Anda memulai transaksi.",
      category: "Biaya & Pembayaran",
    },
    {
      question: "Apakah Rekber.com memiliki aplikasi mobile?",
      answer:
        "Saat ini, Rekber.com dapat diakses melalui browser web di perangkat desktop maupun mobile. Aplikasi mobile sedang dalam pengembangan.",
      category: "Umum",
    },
  ]

  // FAQPage structured data: memungkinkan pertanyaan-jawaban ini tampil
  // sebagai rich snippet accordion langsung di hasil pencarian Google.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  const [selectedCategory, setSelectedCategory] = useState("Semua")

  // Get unique categories
  const categories = ["Semua", ...new Set(faqItems.map((item) => item.category))]

  // Filter FAQ items based on selected category
  const filteredFaqItems =
    selectedCategory === "Semua" ? faqItems : faqItems.filter((item) => item.category === selectedCategory)

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section for FAQ */}
        <section className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Pertanyaan yang Sering Diajukan</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Temukan jawaban atas pertanyaan umum Anda tentang Rekber.com. Kami di sini untuk membantu Anda memahami
            layanan kami dengan lebih baik.
          </p>
        </section>

        <section className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-lg shadow-lg">
          {/* Category Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full px-5 py-2 text-base font-semibold shadow-sm"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full px-5 py-2 text-base font-medium"
                }
              >
                <Tag className="mr-2 h-4 w-4" />
                {category}
              </Button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqItems.length > 0 ? (
                filteredFaqItems.map((item, index) => (
                  <AccordionItem
                    key={`faq-${index}`}
                    value={`item-${index}`}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <AccordionTrigger className="text-left text-lg font-semibold text-gray-800 hover:text-[#2563eb] py-4">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed pb-4">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))
              ) : (
                <p className="text-center text-gray-600 py-8">Tidak ada pertanyaan untuk kategori ini.</p>
              )}
            </Accordion>
          </div>

          <p className="text-center text-gray-600 mt-8">
            Masih ada pertanyaan lain seputar jasa rekber?{' '}
            <Link href="/jasa-rekber" className="text-[#2563eb] font-medium hover:underline">
              Baca panduan lengkap Jasa Rekber
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
        <Footer />

        </>
      );
    }
    