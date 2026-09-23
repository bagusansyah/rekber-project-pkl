"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link';
import { Badge } from "@/components/ui/badge"
import NavBar from '../components/slicings/navbar';
import Footer from '../components/slicings/footer';
import {
  Calculator, 
  TrendingDown,
  TrendingUp,
  Shield,
  Info,
  DollarSign,
  ArrowRight,  
} from "lucide-react"

export default function RekberFeePage() {
  const [amount, setAmount] = useState("")   
  const [fee, setFee] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)

  // Fungsi untuk menghitung fee
  const calculateFee = (inputAmount: number) => {
    if (inputAmount <= 0) return 0

    let calculatedFee = 0
    const hundredMillion = 100000000 // 100 juta

    if (inputAmount <= hundredMillion) {
      calculatedFee = inputAmount * 0.01
    } else {
      calculatedFee = inputAmount * 0.005
    } 
    // Minimum fee adalah 10.000
    return Math.max(calculatedFee, 10000)
  }

  // Format currency untuk display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format number dengan separator
  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "")
    return new Intl.NumberFormat("id-ID").format(Number.parseInt(number) || 0)
  }

  // Handle perubahan amount
  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "")
    setAmount(numericValue)

    const parsedAmount = Number.parseInt(numericValue) || 100
    const calculatedFee = calculateFee(parsedAmount)
    setFee(calculatedFee)
    setTotalAmount(parsedAmount + calculatedFee)
  }
  // Contoh perhitungan
  const examples = [
    { amount: 50000, description: "Transaksi Kecil" },
    { amount: 500000, description: "Transaksi Menengah" },
    { amount: 5000000, description: "Transaksi Besar" },
    { amount: 50000000, description: "Transaksi Sangat Besar" },
    { amount: 150000000, description: "Transaksi Premium" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <NavBar />

      <div className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Calculator className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Informasi Biaya Transaksi</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fee lebih murah daripada marketplace! Ketahui biaya yang akan dikenakan sebelum memulai transaksi Anda.
          </p>
        </div>

        {/* Fee Structure Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Fee Structure 1 */}
          <Card className="bg-white  shadow-lg hover:shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <TrendingDown className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">Transaksi Standard</CardTitle>
              <p className="text-gray-600">Dibawah Rp 100.000.000</p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">1%</div>
              <p className="text-gray-600 mb-4">Fee dari total transaksi</p>
              <Badge className="bg-green-100 text-green-800">Paling Umum</Badge>
            </CardContent>
          </Card>

          {/* Fee Structure 2 */}
          <Card className="bg-white  shadow-lg hover:shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">Transaksi Hemat</CardTitle>
              <p className="text-gray-600">Diatas Rp 100.000.000</p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">0.5%</div>
              <p className="text-gray-600 mb-4">Fee dari total transaksi</p>
              <Badge className="bg-blue-100 text-blue-800">Lebih Hemat</Badge>
            </CardContent>
          </Card>

          {/* Minimum Fee */}
          <Card className="bg-white  shadow-lg hover:shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">Fee Minimum</CardTitle>
              <p className="text-gray-600">Batas minimum fee</p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">Rp 10K</div>
              <p className="text-gray-600 mb-4">Fee minimum yang dikenakan</p>
              <Badge className="bg-orange-100 text-orange-800">Terjamin</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Fee Calculator */}
        <Card className="bg-white  shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-900 flex items-center justify-center space-x-2">
              <Calculator className="h-6 w-6 text-blue-600" />
              <span>Kalkulator Fee</span>
            </CardTitle>
            <p className="text-center text-gray-600">Hitung fee transaksi Anda secara real-time</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">Masukkan Jumlah Transaksi</label>
              <div className="grid grid-cols-3 gap-0">
                <div className="relative col-span-2">
                  <Input
                   type="text"
                   inputMode="numeric" // 👉 ini yang penting untuk mobile
                   pattern="[0-9]*"
                    value={formatNumber(amount)}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className={`bg-white border border-gray-300 rounded-r-none h-14 text-base pl-12 w-full 
                      ${Number(amount.replace(/\D/g, '')) === 0 ? 'text-gray-400' : 'text-gray-800'}`}
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium text-base">
                    Rp
                  </span>
                </div>

                <div className="col-span-1">
                  <Select defaultValue="idr">
                    <SelectTrigger
                      className="bg-white text-gray-800 border border-gray-300 rounded-l-none w-full text-base"
                      style={{ height: 'calc(var(--spacing) * 14)' }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idr">
                        <div className="flex items-center space-x-2">
                          <span className="text-red-500">🇮🇩</span>
                          <span>IDR</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            {amount && Number.parseInt(amount) > 0 && (
                  <Card className="bg-blue-50 border-blue-200 p-0 mt-2">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center space-x-2 text-blue-700">
                        <Calculator className="h-4 w-4" />
                        <span className="font-semibold">Kalkulasi Fee</span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Jumlah Transaksi:</span>
                          <span className="font-semibold">{formatCurrency(Number.parseInt(amount))}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Fee ({Number.parseInt(amount) <= 100000000 ? "1%" : "0.5%"}, min. Rp 10.000):
                          </span>
                          <span className="font-semibold text-orange-600">{formatCurrency(fee)}</span>
                        </div>

                        <Separator />

                        <div className="flex justify-between text-base">
                          <span className="font-semibold text-blue-700">Total yang Harus Dibayar:</span>
                          <span className="font-bold text-blue-700">{formatCurrency(totalAmount)}</span>
                        </div>
                      </div>
 
                    </CardContent>
                  </Card>
                )}
            </div>


          </CardContent>
        </Card>
{/* Examples Section */}
<Card className="bg-white border-blue-200 shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl text-center text-gray-900 flex items-center justify-center space-x-2">
              <Info className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              <span>Contoh Perhitungan Fee</span>
            </CardTitle>
            <p className="text-center text-gray-600 text-sm md:text-base">
              Lihat contoh perhitungan fee untuk berbagai nominal transaksi
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              {examples.map((example, index) => {
                const fee = calculateFee(example.amount)
                const total = example.amount + fee
                const percentage = example.amount < 100000000 ? "1%" : "0.5%"

                return (
                  <div key={index} className="p-3 md:p-4 bg-gray-50 rounded-lg">
                    {/* Mobile Layout */}
                    <div className="block md:hidden space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full flex-shrink-0">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{example.description}</p>
                          <p className="text-xs text-gray-600 truncate">{formatCurrency(example.amount)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-white p-2 rounded border">
                          <p className="text-xs text-gray-600">Fee ({percentage})</p>
                          <p className="font-semibold text-orange-600 text-sm">{formatCurrency(fee)}</p>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <p className="text-xs text-gray-600">Total</p>
                          <p className="font-bold text-blue-600 text-sm">{formatCurrency(total)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                          <DollarSign className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{example.description}</p>
                          <p className="text-sm text-gray-600">{formatCurrency(example.amount)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Fee ({percentage})</p>
                          <p className="font-semibold text-orange-600">{formatCurrency(fee)}</p>
                        </div>

                        <ArrowRight className="h-4 w-4 text-gray-400" />

                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="font-bold text-blue-600">{formatCurrency(total)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>


        {/* FAQ Section */}
        <Card className="bg-white  shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-900">Pertanyaan Umum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Mengapa ada fee minimum Rp 10.000?</h3>
                <p className="text-gray-600">
                  Fee minimum memastikan layanan escrow tetap berkelanjutan dan dapat memberikan perlindungan optimal
                  untuk setiap transaksi, terlepas dari nominal yang kecil.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Kapan fee dikenakan?</h3>
                <p className="text-gray-600">
                  Fee dikenakan saat pembeli melakukan pembayaran ke rekening escrow. Fee sudah termasuk dalam total
                  yang harus dibayar pembeli.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Apakah ada biaya tersembunyi?</h3>
                <p className="text-gray-600">
                  Tidak ada biaya tersembunyi. Semua biaya sudah transparan dan ditampilkan sebelum transaksi dimulai.
                  Yang Anda lihat adalah yang Anda bayar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Siap Memulai Transaksi Aman?</h2>
          <p className="text-gray-600 mb-6">Mulai transaksi Anda sekarang dengan fee yang transparan dan kompetitif</p>
            <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                    Mulai Transaksi Sekarang
                </Button>
            </Link>
          <p className="text-gray-600 mt-6">
            Baru mengenal Rekber.com?{' '}
            <Link href="/jasa-rekber" className="text-blue-600 font-medium hover:underline">
              Pelajari selengkapnya soal jasa rekber di sini
            </Link>
            .
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
