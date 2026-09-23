"use client"
 
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertTriangle,
  MessageCircle, 
  Upload,
  Shield,
  Clock,
  HelpCircle, 
  FileText,
  CreditCard,
  User,
  Settings,
} from "lucide-react"
import NavBar from '@/app/components/slicings/navbar';
import Footer from '@/app/components/slicings/footer';
 
export default function LaporkanMasalah() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    priority: "",
    subject: "",
    description: "",
    transactionId: "",
    agreeToTerms: false,
  })
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() 

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))
 
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }
 
  const handleWhatsAppClick = () => {
    window.open(
      "https://wa.me/6282315555551?text=Halo%20Admin%20Rekber.com",
      "_blank",
      "noopener,noreferrer"
    )
  }
  return ( <>
           {' '}
      <NavBar />
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-red-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Laporkan Masalah</h1>
            <p className="text-xl text-gray-600 mb-6">
              Sampaikan kendala atau masalah yang Anda alami. Tim support kami siap membantu menyelesaikan masalah Anda
              dengan cepat.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Respon 1x24 jam</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Data terlindungi</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-purple-500" />
                <span>Support 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Form Laporan Masalah</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2" htmlFor="name">Nama Lengkap *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Masukkan nama lengkap"
                        required
                      />
                    </div>
                    <div>
                      <Label className="mb-2" htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="nama@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2" htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>

                  {/* Problem Details */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2" htmlFor="category">Kategori Masalah *</Label>
                      <Select  value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih kategori masalah" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transaction">Masalah Transaksi</SelectItem>
                          <SelectItem value="payment">Masalah Pembayaran</SelectItem>
                          <SelectItem value="account">Masalah Akun</SelectItem>
                          <SelectItem value="technical">Masalah Teknis</SelectItem>
                          <SelectItem value="fraud">Laporan Penipuan</SelectItem>
                          <SelectItem value="other">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div> 
                  </div>

                  <div>
                    <Label className="mb-2" htmlFor="transactionId">ID Transaksi (jika ada)</Label>
                    <Input
                      id="transactionId"
                      value={formData.transactionId}
                      onChange={(e) => handleInputChange("transactionId", e.target.value)}
                      placeholder="Contoh: TRX-2025-001234"
                    />
                  </div>

                  <div>
                    <Label className="mb-2" htmlFor="subject">Judul Masalah *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="Ringkasan singkat masalah Anda"
                      required
                    />
                  </div>

                  <div>
                    <Label className="mb-2" htmlFor="description">Deskripsi Masalah *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Jelaskan masalah Anda secara detail. Sertakan langkah-langkah yang telah Anda lakukan dan kapan masalah terjadi."
                      rows={6}
                      required
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <Label className="mb-2">Lampiran (Opsional)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Drag & drop file atau klik untuk upload</p>
                      <p className="text-xs text-gray-500">Format: JPG, PNG, PDF (Max 5MB)</p>
                      <Button type="button" variant="outline" className="mt-2 bg-transparent">
                        Pilih File
                      </Button>
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                      Saya setuju bahwa informasi yang saya berikan adalah benar dan dapat digunakan oleh tim Rekber.com
                      untuk menyelesaikan masalah saya. Saya juga memahami bahwa data saya akan dijaga kerahasiaannya.
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                  > 
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Butuh Bantuan Cepat?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button  onClick={handleWhatsAppClick} className="w-full bg-green-600 hover:bg-green-700 flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat WhatsApp</span>
                </Button> 
              </CardContent>
            </Card>

            {/* Problem Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kategori Masalah</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Masalah Transaksi</p>
                      <p className="text-xs text-gray-500">Pembayaran, pengiriman, dll</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <User className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">Masalah Akun</p>
                      <p className="text-xs text-gray-500">Login, verifikasi, profil</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <Settings className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-sm">Masalah Teknis</p>
                      <p className="text-xs text-gray-500">Website, aplikasi, bug</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-sm">Laporan Penipuan</p>
                      <p className="text-xs text-gray-500">Aktivitas mencurigakan</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5" />
                  <span>FAQ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-sm mb-1">Berapa lama respon support?</p>
                    <p className="text-xs text-gray-600">Tim kami merespon dalam 1x24 jam</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">Bagaimana cara cek status laporan?</p>
                    <p className="text-xs text-gray-600">Gunakan nomor tiket yang diberikan</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">Apakah data saya aman?</p>
                    <p className="text-xs text-gray-600">Ya, semua data dijaga kerahasiaannya</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div> 
    </div>
 <Footer />
    </>
  );
}
