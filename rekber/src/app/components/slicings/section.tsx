"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Car, Smartphone, Calculator, CreditCard, Info, ChevronDown, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
// import Link from 'next/link';
import { Separator } from "@/components/ui/separator" 
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from 'next/image'
import { useGlobalNotifications } from  '@/hooks/useGlobalNotifications'
import Link from "next/link";

const categoriesSelect = [
  { icon: User, label: "Akun", color: "text-blue-500" },
  { icon: Car, label: "Mobil", color: "text-green-500" },
  { icon: Smartphone, label: "Gadget", color: "text-purple-500" },
]
 
export default function RekberLanding() {
  useGlobalNotifications();
  const [categories, setCategories] = useState<string[]>([]) // inisialisasi kosong dulu
  const [currentCategory, setCurrentCategory] = useState(0)
  const [currentStep, setCurrentStep] = useState(0) 
  const [inputValue, setInputValue] = useState("") 
  const [typingText, setTypingText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentCategoryIndex, setCCurrentCategoryIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('') 

useEffect(() => {
  const cached = sessionStorage.getItem('categories4')
  if (cached) {
    setCategories(JSON.parse(cached)) 
  } else {
    fetch('/categories_new1.txt')
      .then(res => res.text())
      .then(text => {
        const parsed = text.split('\n').map(line => line.trim()).filter(Boolean)
        // Randomize the order of categories
        const shuffled = parsed.sort(() => Math.random() - 0.5)
        setCategories(shuffled) 
        sessionStorage.setItem('categories4', JSON.stringify(shuffled))
      })
  }
}, [])
  // Typing animation effect (gunakan categories dari state)
  useEffect(() => {
    if (!inputValue && !isTyping && categories.length > 0) {
      const startTyping = () => {
        setIsTyping(true)
        const category = categories[currentCategoryIndex]
        let currentIndex = 0

        const typeInterval = setInterval(() => {
          if (currentIndex <= category.length) {
            setTypingText(category.slice(0, currentIndex))
            currentIndex++
          } else {
            clearInterval(typeInterval)

            setTimeout(() => {
              const clearTypingInterval = setInterval(() => {
                setTypingText((prev) => {
                  if (prev.length > 0) {
                    return prev.slice(0, -1)
                  } else {
                    clearInterval(clearTypingInterval)
                    setIsTyping(false)
                    setCCurrentCategoryIndex((prev) => (prev + 1) % categories.length)
                    return ""
                  }
                })
              }, 50)
            }, 2000)
          }
        }, 100)
      }

      const timeout = setTimeout(startTyping, 1000)
      return () => clearTimeout(timeout)
    }
  }, [currentCategoryIndex, inputValue, isTyping, categories])

  // Filter categories based on inputValue
 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setTypingText("")
  }
  
  const handleWhatsAppClick = () => {
    window.open(
      "https://wa.me/6282315555551?text=Halo%20Admin%20Rekber.com",
      "_blank",
      "noopener,noreferrer"
    )
  }
  useEffect(() => {
    const categoryInterval = setInterval(() => {
      if (categoriesSelect.length > 0) {
        setCurrentCategory((prev) => (prev + 1) % categoriesSelect.length)
      }
    }, 6000)

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 6)
    }, 1000)

    return () => {
      clearInterval(categoryInterval)
      clearInterval(stepInterval)
    }
  }, [])

  const [amount, setAmount] = useState("")   
  const [fee, setFee] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)


  const [role, setRole] = useState('')  

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
    window.scrollTo({
      top: 200,
      behavior: 'smooth',
    })
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

  const router = useRouter() 

  const handleSubmit = () => {
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/auth/login');
      return;
    }

    if ( !inputValue.trim() || !amount || parseInt(amount) === 0) {
      setError('Harap lengkapi semua data dengan benar.')
      return
    }
    if (parseInt(amount) < 10000) {
      setError('Minimal transaksi adalah Rp 10.000.')
      return
    }
    setError('');
    router.push(`/formrekber?role=${role}&product=${encodeURIComponent(inputValue)}&amount=${amount}`);
  }

  // Referensi dan state untuk indikator slider testimoni
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      
      // Hitung persentase gulir (0 hingga 100)
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  // Kalkulasi awal saat komponen dimuat
  useEffect(() => {
    handleScroll();
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50">  
      <div className="container max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Section */}
          <div className="space-y-8 lg:space-y-10">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                <span className="text-gray-900">Transaksi Aman</span>
                <br />
                <span className="text-gray-900">Tanpa Khawatir</span>
                <br />
                <span className="text-gray-900">Penipuan</span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
              <span className="font-semibold text-blue-900">Rekber.com</span> — platform rekening bersama untuk transaksi online yang aman.
              </p>
            </div>
            <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-3 sm:gap-y-0 gap-x-0">
                {/* Select 1 */}
                <div className="sm:col-span-1">
                  <Select value={role} onValueChange={(val) => setRole(val)}>
                    <SelectTrigger
                      className="bg-white text-gray-800 border border-gray-300 w-full text-base px-4 rounded-t-lg sm:rounded-l-lg sm:rounded-r-none sm:border-r-0"
                      style={{ height: 'calc(var(--spacing) * 14)' }}
                    >
                      <SelectValue placeholder="Pilih Peran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pembeli">Saya Pembeli</SelectItem>
                      <SelectItem value="penjual">Saya Penjual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      placeholder=""
                      className="bg-white text-gray-500 border border-gray-300 w-full text-base 
                                rounded-b-lg sm:rounded-r-lg sm:rounded-l-none"
                      style={{ height: 'calc(var(--spacing) * 14)' }}
                    />

                    {/* Typing animation overlay */}
                    {!inputValue && typingText && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                        {typingText}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Second Row - Price Input and Currency */}
              <div className="grid grid-cols-3 gap-0">
                <div className="relative col-span-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={amount && Number(amount) > 0 ? formatNumber(amount) : ''}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0"
                    className="bg-white border border-gray-300 rounded-r-none h-14 text-base pl-12 w-full text-gray-800"
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium text-base">
                    Rp
                  </span>
                </div>

                <div className="col-span-1">
                  <Select defaultValue="idr">
                    <SelectTrigger
                      className="bg-white text-gray-800 border border-gray-300 rounded-l-none w-full text-base px-4"
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

              <p className="text-xs text-gray-500 flex items-center mt-2 font-medium">
                <Info className="w-3 h-3 mr-1" />
                Minimal transaksi Rp 10.000
              </p>

              {/* Error message */}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              
              <div className="mt-4 flex flex-col sm:flex-row gap-4 items-start">
                {/* KOREKSI: 
                  1. Mengubah type menjadi "submit", hapus onClick.
                  2. Menambahkan disabled state jika peran kosong.
                  3. Membersihkan class Tailwind yang redundan.
                */}
                <Button
                  type="submit"
                  disabled={!role || role === ''}
                  className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium w-full sm:w-[220px]"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Mulai Transaksi
                </Button>

                {/* Fee Calculation - Show only when amount is entered */}
                {amount && Number.parseInt(amount) > 0 && (
                  <Card className="bg-blue-50 border-blue-200 p-0 w-full">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center space-x-2 text-blue-700">
                        <Calculator className="h-4 w-4" />
                        <span className="font-semibold">Kalkulasi Biaya</span>
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
            </div>
          </form>
          </div>
          <div className="hidden lg:block relative">
            <div className="text-center space-y-8">
              {/* Circle with Dynamic Text */}
              <div className="relative mx-auto w-64 h-64 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex flex-col items-center justify-center shadow-2xl">
                {/* Current Category Icon */}
                <div className="mb-3">
                  {categoriesSelect.map((category, index) => {
                    const Icon = category.icon
                    return (
                      <Icon
                        key={index}
                        className={`w-16 h-16 text-white transition-all duration-500 ${
                          index === currentCategory ? "opacity-100 scale-100" : "opacity-0 scale-75 absolute"
                        }`}
                      />
                    )
                  })}
                </div>

                {/* Dynamic Text Based on Current Category */}
                <div className="text-center text-white">
                  <div className="text-lg font-semibold">Jual Beli</div>
                  <div className="text-2xl font-bold">{categoriesSelect[currentCategory].label}</div>
                  <div className="text-sm opacity-90">Aman & Terpercaya</div>
                </div>

                {/* Floating Category Indicators */}
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                  {categoriesSelect.map((category, index) => {
                    const Icon = category.icon
                    return (
                      <Icon
                        key={index}
                        className={`w-6 h-6 transition-all duration-500 ${
                          index === (currentCategory + 1) % categoriesSelect.length
                            ? `${category.color} opacity-100 scale-100`
                            : "text-gray-400 opacity-0 scale-75 absolute"
                        }`}
                      />
                    )
                  })}
                </div>

                <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                  {categoriesSelect.map((category, index) => {
                    const Icon = category.icon
                    return (
                      <Icon
                        key={index}
                        className={`w-6 h-6 transition-all duration-500 ${
                          index === (currentCategory + 2) % categories.length
                            ? `${category.color} opacity-100 scale-100`
                            : "text-gray-400 opacity-0 scale-75 absolute"
                        }`}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Process Steps */}
              <div className="space-y-4 text-left max-w-sm mx-auto">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                      currentStep >= 1 ? "bg-green-500 scale-100" : "bg-gray-300 scale-75"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 text-white transition-opacity duration-300 ${
                        currentStep >= 1 ? "opacity-100" : "opacity-0"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span
                    className={`text-sm transition-colors duration-300 ${
                      currentStep >= 1 ? "text-gray-700 font-medium" : "text-gray-400"
                    }`}
                  >
                    Pembeli dan penjual setuju dengan syarat
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                      currentStep >= 2 ? "bg-green-500 scale-100" : "bg-gray-300 scale-75"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 text-white transition-opacity duration-300 ${
                        currentStep >= 2 ? "opacity-100" : "opacity-0"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span
                    className={`text-sm transition-colors duration-300 ${
                      currentStep >= 2 ? "text-gray-700 font-medium" : "text-gray-400"
                    }`}
                  >
                    Pembeli membayar Rekber.com
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                      currentStep >= 3 ? "bg-green-500 scale-100" : "bg-gray-300 scale-75"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 text-white transition-opacity duration-300 ${
                        currentStep >= 3 ? "opacity-100" : "opacity-0"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span
                    className={`text-sm transition-colors duration-300 ${
                      currentStep >= 3 ? "text-gray-700 font-medium" : "text-gray-400"
                    }`}
                  >
                    Penjual mengirim {categoriesSelect[currentCategory].label.toLowerCase()}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                      currentStep >= 4 ? "bg-green-500 scale-100" : "bg-gray-300 scale-75"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 text-white transition-opacity duration-300 ${
                        currentStep >= 4 ? "opacity-100" : "opacity-0"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span
                    className={`text-sm transition-colors duration-300 ${
                      currentStep >= 4 ? "text-gray-700 font-medium" : "text-gray-400"
                    }`}
                  >
                    Pembeli memeriksa & menyetujui {categoriesSelect[currentCategory].label.toLowerCase()}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                      currentStep >= 5 ? "bg-green-500 scale-100" : "bg-gray-300 scale-75"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 text-white transition-opacity duration-300 ${
                        currentStep >= 5 ? "opacity-100" : "opacity-0"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span
                    className={`text-sm transition-colors duration-300 ${
                      currentStep >= 5 ? "text-gray-700 font-semibold" : "text-gray-400"
                    }`}
                  >
                    Rekber.com membayar penjual
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION PENGHUBUNG KE HALAMAN /jasa-rekber */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Jasa Rekber untuk Transaksi Online
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Gunakan jasa rekber Rekber.com untuk membantu mengamankan transaksi antara pembeli dan
            penjual — mulai dari cara kerja, biaya, sampai penyelesaian masalah, semua dijelaskan
            lengkap di satu halaman.
          </p>
          <Link
            href="/jasa-rekber"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Pelajari Jasa Rekber Selengkapnya
          </Link>
        </div>
      </section>

      {/* SECTION KOMPARASI BIAYA (FEE) - REVISED */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          
          {/* Header Section */}
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Biaya
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Biaya penanganan bersaing, transparan, dan tanpa kejutan tersembunyi.
            </p>
          </div>

          {/* Main Card Container */}
          <div className="relative bg-[#FAFAFA] rounded-[2.5rem] p-8 md:p-12 lg:p-16 border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
            
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
              
              {/* Kolom Kiri: Rekber.com */}
              <div className="flex-1">
                <div className="inline-block px-4 py-1.5 bg-gray-100 rounded-full mb-6">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                    dengan REKBER.COM
                  </p>
                </div>
                
                <div className="flex items-center gap-3 mb-8">
                  <h3 className="text-7xl md:text-8xl font-black text-gray-900 tracking-tighter">
                    1%
                  </h3>
                  <span className="text-4xl animate-pulse">✨</span>
                </div>
                
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Mau lebih hemat lagi?
                </h4>
                <p className="text-base text-gray-600 leading-relaxed mb-8 max-w-md">
                  Sistem kami memungkinkan Anda berbagi biaya penanganan secara adil antara pembeli dan penjual, sehingga menjadi lebih terjangkau. 💸
                </p>

                {/* Link Teks */}
                <Link 
                  href="/fee" 
                  className="inline-flex items-center text-sm font-bold text-gray-900 hover:text-blue-600 group transition-colors"
                >
                  <span className="mr-2 text-blue-600 group-hover:translate-x-1 transition-transform">+</span> 
                  Struktur biaya penanganan
                </Link>
              </div>

              {/* Divider Desktop */}
              <div className="hidden lg:block w-px bg-gray-200"></div>

              {/* Kolom Kanan: Kompetitor */}
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">
                  Platform lain
                </p>
                
                {/* Toko Hijau */}
                <div className="mb-8 group">
                  <div className="flex justify-between items-baseline mb-2 border-b border-gray-200 border-dashed pb-2">
                    <span className="text-2xl font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">Toko Hijau</span>
                    <span className="text-5xl font-black text-gray-300">10%</span>
                  </div>
                  <p className="text-sm text-gray-400">*Mulai dari 4% hingga 10%! 🤯</p>
                </div>

                {/* Si Orange */}
                <div className="group">
                  <div className="flex justify-between items-baseline mb-2 border-b border-gray-200 border-dashed pb-2">
                    <span className="text-2xl font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">Si Orange</span>
                    <span className="text-5xl font-black text-gray-300">15%</span>
                  </div>
                  <p className="text-sm text-gray-400">*Mulai dari 4% - 11% bahkan sampai 15% 🧐</p>
                </div>
              </div>
            </div>

            {/* Tombol Utama (Responsive Floating)
              - Mobile: Masuk ke dalam urutan bawah card (relative, mt-8)
              - Desktop: Melayang di sudut kanan bawah card (absolute, -bottom-6)
            */}
            <div className="mt-10 lg:mt-0 lg:absolute lg:-bottom-7 lg:right-12 flex justify-center lg:justify-end z-20">
              <Link 
                href="/fee" 
                className="group flex items-center gap-3 bg-[#1A1A1A] text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-black hover:-translate-y-1 transition-all duration-300"
              >
                Cek Detail Biaya 
                <svg className="w-5 h-5 text-gray-300 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </Link>
            </div>

          </div>
        </div>
      </section>
      {/* AKHIR SECTION KOMPARASI BIAYA */}


      {/* Why Choose Rekber.com Section */}
      <div className="bg-gray py-16 lg:py-24">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-[2rem] p-8 lg:p-12 xl:p-16">
            {/* Header Section */}
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
                Mengapa memilih Rekber.com?
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                Keamanan dan kepercayaan adalah prioritas utama kami dalam setiap transaksi
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {/* Feature 1: 100% Aman */}
              <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center">
                  <Image
                    src="/images/icon-100_-aman.png"
                    alt="100% Aman"
                    width={80}
                    height={80}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                  100% Aman
                </h3>
                <p className="text-base lg:text-lg text-gray-600">
                  Dana Anda dijamin aman dengan sistem escrow terpercaya dan terenkripsi
                </p>
              </div>

              {/* Feature 2: Proses Cepat */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center">
                  <Image
                    src="/images/icon-proses-cepat.png"
                    alt="Proses Cepat"
                    width={80}
                    height={80}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Proses Cepat
                </h3>
                <p className="text-base lg:text-lg text-gray-600">
                  Transaksi diproses dengan cepat dan efisien dalam hitungan menit
                </p>
              </div>

              {/* Feature 3: Support 24/7 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center">
                  <Image
                    src="/images/icon-support.png"
                    alt="Support 24/7"
                    width={80}
                    height={80}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Support 24/7
                </h3>
                <p className="text-base lg:text-lg text-gray-600">
                  Tim support profesional siap membantu Anda kapan saja dibutuhkan
                </p>
              </div>

              {/* Feature 4: Terpercaya */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center">
                  <Image
                    src="/images/icon-terpercaya.png"
                    alt="Terpercaya"
                    width={80}
                    height={80}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Terpercaya
                </h3>
                <p className="text-base lg:text-lg text-gray-600">
                  Dipercaya oleh ribuan pengguna dengan rating kepuasan tinggi
                </p>
              </div>

              {/* Feature 5: Real-time */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center">
                  <Image
                    src="/images/icon-real-time.png"
                    alt="Real-time"
                    width={80}
                    height={80}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Real-time
                </h3>
                <p className="text-base lg:text-lg text-gray-600">
                  Pantau status transaksi Anda secara real-time dengan notifikasi instant
                </p>
              </div>

              {/* Feature 6: Komunitas */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center">
                  <Image
                    src="/images/icon-komunitas.png"
                    alt="Komunitas"
                    width={80}
                    height={80}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Komunitas
                </h3>
                <p className="text-base lg:text-lg text-gray-600">
                  Bergabung dengan komunitas trader dan seller terpercaya di Indonesia
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cara Kerja Rekber.com Section */}
      <div className="bg-white py-16 lg:py-24">
        <div className="container max-w-7xl mx-auto px-6">
          {/* Header Section */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
              Cara Kerja Rekber.com
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Proses sederhana dalam 4 langkah untuk transaksi yang aman
            </p>
          </div> 
          {/* Four-Step Process */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {/* Step 1: Daftar */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center">
                <Image
                  src="/images/icon-daftar.png"
                  alt="Daftar"
                  width={96}
                  height={96}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                1. Daftar
              </h3>
              <p className="text-base lg:text-lg text-gray-600">
                Buat akun dan verifikasi identitas Anda dengan mudah
              </p>
            </div>

            {/* Step 2: Deposit */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center">
                <Image
                  src="/images/icon-deposit.png"
                  alt="Deposit"
                  width={96}
                  height={96}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                2. Deposit
              </h3>
              <p className="text-base lg:text-lg text-gray-600">
                Pembeli melakukan deposit dana ke rekening bersama
              </p>
            </div>

            {/* Step 3: Transaksi */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center">
                <Image
                  src="/images/icon-transaksi.png"
                  alt="Transaksi"
                  width={96}
                  height={96}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                3. Transaksi
              </h3>
              <p className="text-base lg:text-lg text-gray-600">
                Penjual mengirim barang, pembeli konfirmasi penerimaan
              </p>
            </div>

            {/* Step 4: Selesai */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center">
                <Image
                  src="/images/icon-selesai.png"
                  alt="Selesai"
                  width={96}
                  height={96}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                4. Selesai
              </h3>
              <p className="text-base lg:text-lg text-gray-600">
                Dana otomatis diteruskan ke penjual setelah konfirmasi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16 lg:py-24">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
              FAQ
            </h2>
            <p className="text-lg lg:text-xl text-gray-600">
              Pertanyaan yang sering diajukan tentang layanan Rekber.com
            </p>
          </div>

          <div className="space-y-4">
            <Collapsible>
              <CollapsibleTrigger className="flex justify-between items-center w-full p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-left font-semibold text-lg">Apa itu layanan Rekber.com?</span>
                <ChevronDown className="w-5 h-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-6 bg-white border border-gray-200 rounded-b-lg">
                <p className="text-gray-700">
                  Rekber.com adalah layanan escrow yang bertindak sebagai pihak ketiga terpercaya dalam
                  transaksi jual beli online. Kami menjaga dana pembeli hingga barang diterima dengan baik, sehingga
                  melindungi kedua belah pihak dari penipuan.
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex justify-between items-center w-full p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-left font-semibold text-lg">Bagaimana cara kerja sistem Rekber.com?</span>
                <ChevronDown className="w-5 h-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-6 bg-white border border-gray-200 rounded-b-lg">
                <p className="text-gray-700">
                  1. Pembeli dan penjual sepakat menggunakan layanan Rekber.com
                  <br />
                  2. Pembeli melakukan deposit ke rekening Rekber.com
                  <br />
                  3. Penjual mengirim barang setelah deposit dikonfirmasi
                  <br />
                  4. Pembeli mengecek barang dan konfirmasi penerimaan
                  <br />
                  5. Dana diteruskan ke penjual setelah konfirmasi
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex justify-between items-center w-full p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-left font-semibold text-lg">Berapa biaya layanan Rekber.com?</span>
                <ChevronDown className="w-5 h-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-6 bg-white border border-gray-200 rounded-b-lg">
                <p className="text-gray-700">
                  Biaya layanan Rekber sangat terjangkau, mulai dari 1% dari nilai transaksi dengan minimum Rp 10.000.
                  Biaya ini sudah termasuk asuransi dan perlindungan penuh untuk transaksi Anda. Detail lengkap dapat
                  dilihat di halaman Fee.
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex justify-between items-center w-full p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-left font-semibold text-lg">Apakah dana saya aman di Rekber.com?</span>
                <ChevronDown className="w-5 h-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-6 bg-white border border-gray-200 rounded-b-lg">
                <p className="text-gray-700">
                  Ya, dana Anda 100% aman. Kami menggunakan sistem keamanan berlapis, rekening terpisah untuk setiap
                  transaksi, dan bekerja sama dengan bank-bank terpercaya. Selain itu, semua transaksi diasuransikan dan
                  diawasi oleh otoritas keuangan.
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex justify-between items-center w-full p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-left font-semibold text-lg">Berapa lama proses transaksi?</span>
                <ChevronDown className="w-5 h-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-6 bg-white border border-gray-200 rounded-b-lg">
                <p className="text-gray-700">
                  Proses deposit biasanya dikonfirmasi dalam 1-3 jam kerja. Setelah pembeli konfirmasi penerimaan
                  barang, dana akan diteruskan ke penjual dalam maksimal 24 jam. Untuk transaksi mendesak, tersedia
                  layanan express dengan biaya tambahan.
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex justify-between items-center w-full p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-left font-semibold text-lg">Apa yang terjadi jika ada dispute?</span>
                <ChevronDown className="w-5 h-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-6 bg-white border border-gray-200 rounded-b-lg">
                <p className="text-gray-700">
                  Jika terjadi sengketa, tim mediasi kami akan membantu menyelesaikan masalah secara adil. Kami akan
                  meminta bukti dari kedua belah pihak dan memberikan keputusan berdasarkan evidence yang ada. Proses
                  mediasi biasanya selesai dalam 3-7 hari kerja.
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex justify-between items-center w-full p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-left font-semibold text-lg">Apakah bisa untuk transaksi internasional?</span>
                <ChevronDown className="w-5 h-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-6 bg-white border border-gray-200 rounded-b-lg">
                <p className="text-gray-700">
                  Saat ini layanan Rekber.com fokus untuk transaksi domestik dalam mata uang Rupiah. Untuk transaksi
                  internasional, silakan hubungi customer service kami untuk informasi lebih lanjut mengenai kemungkinan
                  layanan khusus.
                </p>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* Testimoni Pengguna Section */}
      <div className="bg-gray-50 py-16 lg:py-24">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
              Testimoni Pengguna
            </h2>
            <p className="text-lg lg:text-xl text-gray-600">
              Apa kata mereka yang telah menggunakan layanan Rekber.com
            </p>
          </div>

          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 overflow-x-auto snap-x snap-mandatory pb-8 -mx-6 px-6 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {[
              {
                name: "Sari Andini",
                role: "Online Shop Owner",
                initials: "SA",
                text: "Sudah 2 tahun menggunakan Rekber.com untuk toko online saya. Customer jadi lebih percaya dan penjualan meningkat drastis. Prosesnya cepat dan customer service sangat responsif!",
                accentColor: "blue",
                avatarSize: "w-14 h-14",
                layout: "default"
              },
              {
                name: "Budi Wijaya",
                role: "Freelancer",
                initials: "BW",
                text: "Sebagai freelancer, Rekber.com memberikan rasa aman saat menerima project dari client baru. Dana sudah pasti aman dan client juga merasa terlindungi. Win-win solution!",
                accentColor: "green",
                avatarSize: "w-16 h-16",
                layout: "quote-top"
              },
              {
                name: "Dewi Permata",
                role: "Pembeli Online",
                initials: "DP",
                text: "Pernah hampir kena tipu beli barang mahal online. Sejak pakai Rekber.com, belanja jadi tenang. Barang tidak sesuai? Dana pasti kembali. Recommended banget!",
                accentColor: "purple",
                avatarSize: "w-12 h-12",
                layout: "gradient"
              },
              {
                name: "Ahmad Santoso",
                role: "Pengusaha",
                initials: "AS",
                text: "Untuk transaksi bisnis B2B yang nilainya besar, Rekber.com memberikan kepercayaan ekstra. Partner bisnis jadi lebih yakin dan proses negosiasi lebih lancar.",
                accentColor: "orange",
                avatarSize: "w-14 h-14",
                layout: "default"
              },
              {
                name: "Lisa Maharani",
                role: "Mahasiswa",
                initials: "LM",
                text: "Sebagai mahasiswa yang sering jual-beli barang bekas, Rekber.com sangat membantu. Biayanya murah, prosesnya mudah, dan yang penting aman dari penipuan!",
                accentColor: "pink",
                avatarSize: "w-12 h-12",
                layout: "shadow-lg"
              },
              {
                name: "Rudi Hartono",
                role: "Kolektor",
                initials: "RH",
                text: "Hobi koleksi barang antik membuat saya sering transaksi dengan nilai tinggi. Rekber.com memberikan perlindungan yang saya butuhkan. Tim support juga sangat profesional.",
                accentColor: "indigo",
                avatarSize: "w-16 h-16",
                layout: "quote-bottom"
              }
            ].map((testimonial, index) => {
              const avatarColors = {
                blue: "bg-blue-600 text-white",
                green: "bg-green-600 text-white",
                purple: "bg-purple-600 text-white",
                orange: "bg-orange-600 text-white",
                pink: "bg-pink-600 text-white",
                indigo: "bg-indigo-600 text-white"
              };
 

              return (
                <div key={index} className="w-[85vw] sm:w-[350px] md:w-auto flex-none snap-center">
                <Card 
                  // key={index} 
                  className={`bg-white hover:shadow-xl transition-all duration-300 ${
                    testimonial.layout === "gradient" 
                      ? "bg-gradient-to-br from-white to-gray-50" 
                      : ""
                  } ${
                    testimonial.layout === "shadow-lg"
                      ? "shadow-lg border-2 border-gray-100"
                      : "shadow-md"
                  }`}
                >
                  {/* <CardContent className="p-6 relative">  */}
                  <CardContent className="px-4 py-1 relative">

                    <div className="flex items-center mb-4 relative z-10">
                      <Avatar className={`${testimonial.avatarSize} mr-4 ${
                        avatarColors[testimonial.accentColor as keyof typeof avatarColors]
                      } border-2 border-white shadow-md`}>
                        <AvatarImage src="/placeholder.svg?height=64&width=64" />
                        <AvatarFallback className={avatarColors[testimonial.accentColor as keyof typeof avatarColors]}>
                          {testimonial.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex mb-4 relative z-10">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${
                            i < 5 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "fill-gray-200 text-gray-200"
                          }`} 
                        />
                      ))}
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed relative z-10">
                      &quot;{testimonial.text}&quot;
                    </p>

                    {/* Accent Decoration */}
                    {/* <div className={`absolute bottom-0 left-0 right-0 h-1 ${
                      testimonial.accentColor === "blue" ? "bg-blue-600" :
                      testimonial.accentColor === "green" ? "bg-green-600" :
                      testimonial.accentColor === "purple" ? "bg-purple-600" :
                      testimonial.accentColor === "orange" ? "bg-orange-600" :
                      testimonial.accentColor === "pink" ? "bg-pink-600" :
                      "bg-indigo-600"
                    } rounded-b-lg`}></div> */}
                  </CardContent>
                </Card>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-center md:hidden">
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
              <div
                className="absolute top-0 left-0 h-full w-1/3 bg-blue-600 rounded-full transition-transform duration-100 ease-out"
                style={{ transform: `translateX(${scrollProgress * 2}%)` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-24 md:bottom-6 right-6 z-50 transition-all duration-300">
          <div
            onClick={handleWhatsAppClick}
            className="cursor-pointer hover:scale-110 transition-all duration-300 group"
            aria-label="Chat dengan Admin WhatsApp"
          >
            <Image
              src="/images/whatsapp.png"
              alt="WhatsApp"
              width={56}
              height={56}
              className="drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 group-hover:scale-110"
              priority
              unoptimized
            />
          </div>
        </div>
    </div>
  )
}
