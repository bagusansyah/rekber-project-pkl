import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import NavBar from "@/app/components/slicings/navbar";
import Footer from "@/app/components/slicings/footer";

export default function NotFound() {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 max-w-lg w-full flex flex-col items-center">
          <div className="h-24 w-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <FileQuestion className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Artikel Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Maaf, artikel yang Anda cari mungkin telah dihapus, dipindahkan, atau Anda salah mengetik URL.
          </p>
          <Link 
            href="/blog" 
            className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Daftar Artikel
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}