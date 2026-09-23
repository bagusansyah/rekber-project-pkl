"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from 'date-fns'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Copy, ChevronRight, Download, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { API_URL, getToken } from '@/constants/api';
import QRCode from 'qrcode' 
import NextImage from "next/image";
// Types
interface PaymentMethod {
  id: string
  name: string
  type: string
  price: number
  icon: string
  color: string
  channel: string
  code: string
  imagePath: string
  description: string
  minimum: string
  maximum: string
  admin: string
  status: string
}

interface PaymentChannel {
  code: string
  name: string
  description: string
  minimum: string
  maximum: string
  min_expired: string
  max_expired: string
  admin: string
  status: string
}
 
interface PaymentGatewayProps {
  baseAmount: number
  transactionId: string
  onPaymentSelect?: (method: PaymentMethod) => void
}
 
// Color mapping function
const getColorForBank = (code: string): string => {
  const colorMap: { [key: string]: string } = {
    'QRIS': 'text-purple-600',
    'BCA': 'text-blue-600',
    'MANDIRI': 'text-yellow-600',
    'BNI': 'text-orange-600',
    'BRI': 'text-blue-800',
    'BSI': 'text-green-600',
    'PERMATA': 'text-pink-600',
    'MUAMALAT': 'text-green-700',
    'CIMB': 'text-red-600',
    'SINARMAS': 'text-blue-500',
    'BNC': 'text-purple-500',
    'INDOMARET': 'text-yellow-500',
    'ALFAMART': 'text-red-500'
  }
  return colorMap[code] || 'text-gray-600'
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount).replace("IDR", "Rp")
}

// Main Component
export default function PaymentGateway({ 
  baseAmount, 
  transactionId, 
  onPaymentSelect 
}: PaymentGatewayProps) {
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [paymentCode, setPaymentCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoadingChannels, setIsLoadingChannels] = useState(false)
  const token = getToken();
  const [expiryDate, setExpiryDate] = useState<string>("")

  const fetchPaymentChannels = useCallback(async () => {
    setIsLoadingChannels(true)
    try {
      const response = await fetch(`${API_URL}/payment-channels`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      if (!response.ok) {
        throw new Error('Gagal mengambil data payment channels')
      }

      const result = await response.json()
      
      if (result.data.data) {
        // Convert API data to PaymentMethod format
        const methods: PaymentMethod[] = result.data.data
        .filter((channel: PaymentChannel) => channel.status === 'Open')
        .map((channel: PaymentChannel) => ({
          id: channel.code.toLowerCase(),
          name: channel.code === 'QRIS' ? 'QRIS' : channel.name,
          type: channel.code === 'QRIS' ? 'QR Code' : 'VIRTUAL AKUN',
          price: 0,
          icon: '', // tidak dipakai lagi
          imagePath: `/images/${channel.code.toLowerCase()}.png`, // path gambar
          color: getColorForBank(channel.code),
          channel: channel.code,
          code: channel.code,
          description: channel.description,
          minimum: channel.minimum,
          maximum: channel.maximum,
          admin: channel.admin,
          status: channel.status
        }))


        // Sort to put QRIS first
        methods.sort((a, b) => {
          if (a.code === 'QRIS') return -1
          if (b.code === 'QRIS') return 1
          return 0
        })

        setPaymentMethods(methods)
      }
    } catch (error) {
      console.error('Error fetching payment channels:', error)
      setError('Gagal memuat metode pembayaran')
    } finally {
      setIsLoadingChannels(false)
    }
  }, [token]) // Tambahkan token sebagai dependency

  // Update useEffect dengan dependency yang benar
  useEffect(() => {
    fetchPaymentChannels()
  }, [fetchPaymentChannels])

  const createVirtualAccount = async (
    method: PaymentMethod,
    amount: number,
    transactionId: string
  ): Promise<string> => {
    // Set expiry date to 90 days from now
    const now = new Date()
    const expDate = format(
      new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd'T'HH:mm:ssxxx"
    )
    
    const requestBody = {
      refid: transactionId,
      channel: method.channel,
      amount: amount,
      desc: `Payment ${transactionId}`,
      exp_date: expDate
    }

    try {
      const response = await fetch(`${API_URL}/transactions/create_VA`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create virtual account')
      }

      const result = await response.json() 
      if (result.data.expired_at) {
        setExpiryDate(result.data.expired_at)
      }
      if (method.code === 'QRIS') {
        return result.data.qr_code || result.data.va_number
      } else {
        return result.data.va_number
      }
    } catch (error) {
      console.error('Error creating VA:', error)
      throw error
    }
  }

const generateQRCode = async (qrisString: string) => {
  try {
    console.log("QRIS : " + qrisString)
    const canvas = document.createElement('canvas')
    
    // Generate QR code dengan ukuran lebih besar untuk logo
    await QRCode.toCanvas(canvas, qrisString, {
      width: 180,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    // Tambahkan logo di tengah QR code
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const img = new Image()
      img.onload = () => {
        // Ukuran logo (sekitar 20% dari QR code)
        const logoSize = canvas.width * 0.2
        const x = (canvas.width - logoSize) / 2
        const y = (canvas.height - logoSize) / 2
        
        // Buat background putih untuk logo
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10)
        
        // Gambar logo
        ctx.drawImage(img, x, y, logoSize, logoSize)
        
        // Update container dengan QR code yang sudah ada logo
        const container = document.getElementById('qr-code-container')
        if (container) {
          container.innerHTML = ''
          container.appendChild(canvas)
        }
      }
      
      img.onerror = () => {
        // Jika logo gagal dimuat, tampilkan QR code tanpa logo
        console.warn('Logo gagal dimuat, menampilkan QR code tanpa logo')
        const container = document.getElementById('qr-code-container')
        if (container) {
          container.innerHTML = ''
          container.appendChild(canvas)
        }
      }
      
      // Set source logo
      img.src = '/images/logo-apps.png'
    } else {
      // Fallback jika context tidak tersedia
      const container = document.getElementById('qr-code-container')
      if (container) {
        container.innerHTML = ''
        container.appendChild(canvas)
      }
    }
  } catch (error) {
    console.error('Error generating QR code:', error)
    
    // Tampilkan pesan error di container
    const container = document.getElementById('qr-code-container')
    if (container) {
      container.innerHTML = '<div class="text-red-500 text-sm">Gagal membuat QR Code</div>'
    }
  }
}

  const handleMethodSelect = async (method: PaymentMethod) => {
    setIsLoading(true)
    setError("")
    
    try {
      const paymentData = await createVirtualAccount(
        method,
        baseAmount,
        transactionId
      )
      
      setSelectedMethod(method)
      setPaymentCode(paymentData)
      setIsMethodModalOpen(false)
      setIsPaymentModalOpen(true)
      
      // Generate QR Code jika metode pembayaran adalah QRIS
      if (method.code === 'QRIS') {
        // Wait for modal to render, then generate QR code
        setTimeout(() => {
          generateQRCode(paymentData)
        }, 100)
      }
      
      onPaymentSelect?.(method)
    } catch (err) {
      setError("Gagal membuat virtual account. Silakan coba lagi.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const copyPaymentCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success("Nomor VA berhasil disalin!")
    } catch (err) {
      toast.error("Gagal menyalin nomor VA")
      console.error('Failed to copy:', err)
    }
  }

  const downloadQRCode = () => {
    const canvas = document.querySelector('#qr-code-container canvas') as HTMLCanvasElement
    if (canvas) {
      // Create download link
      const link = document.createElement('a')
      link.download = `qris-${transactionId}.png`
      link.href = canvas.toDataURL('image/png')
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success("QR Code berhasil didownload!")
    } else {
      toast.error("Gagal mendownload QR Code")
    }
  }

  const calculateTotal = (method: PaymentMethod): number => {
    return baseAmount + method.price;
  }
 

  const renderPaymentMethods = () => {
    if (isLoadingChannels) {
      return (
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Memuat metode pembayaran...</div>
        </div>
      )
    }

    if (paymentMethods.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Tidak ada metode pembayaran tersedia
        </div>
      )
    }

    return (
      <div className="space-y-2">
  {paymentMethods.map((method) => {
    const isBCA = method.code === 'BCA';
    // Disable QRIS jika amount > 300.000
    const isQRIS = method.code === 'QRIS';
    // QRIS free, bank lain 2000
    const bankFee = isQRIS ? 0 : 2000;
    const isQRISDisabled = isQRIS && baseAmount + bankFee > 300000;
    const isDisabled = isLoading || isBCA || isQRISDisabled;

    return (
      <div
        key={method.id}
        onClick={() => !isDisabled && handleMethodSelect({ ...method, price: bankFee })}
        className={`flex items-center justify-between p-4 border rounded-lg 
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'} 
          transition-colors`}
      >
        <div className="flex items-center space-x-3">
          <NextImage
            src={method.imagePath}
            alt={method.code}
            width={50}
            height={50}
            className="object-contain"
            style={{
              filter: isBCA || isQRISDisabled ? 'grayscale(1)' : 'none',
              opacity: isBCA || isQRISDisabled ? 0.5 : 1,
            }}
            unoptimized
          />
          <div>
            <div className="font-semibold text-gray-900">{method.code}</div>
            <div className="text-sm text-gray-500">{method.type}</div>
            <div className="text-xs text-gray-500 mt-1">
              Biaya Bank:{" "}
              <span className={isQRIS ? "text-green-600 font-semibold" : "text-orange-600 font-semibold"}>
                {isQRIS ? "FREE" : formatCurrency(bankFee)}
              </span>
            </div>
            {isQRISDisabled && (
              <div className="text-xs text-red-500 mt-1">
                Maksimal QRIS Rp 300.000
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div className="font-semibold">
              {formatCurrency(baseAmount + bankFee)}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    );
  })}
</div>
    )
  }

  return (
    <>
      <Button
        onClick={() => setIsMethodModalOpen(true)}
        className="w-full bg-green-500" 
        disabled={isLoading || isLoadingChannels}
      >
        <CreditCard className="h-4 w-4 mr-2" />
        {isLoading ? "Memproses..." : "Bayar Sekarang"}
      </Button> 
      <Dialog open={isMethodModalOpen} onOpenChange={setIsMethodModalOpen}>
        <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto z-99999 flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-lg font-semibold">
              Pilih Metode Pembayaran
            </DialogTitle>
          </DialogHeader>

          {error && (
            <div className="bg-red-50 p-3 rounded-lg mb-4 flex-shrink-0">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <div className="overflow-y-auto flex-1 pr-2">
            {renderPaymentMethods()}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto z-99999">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {selectedMethod?.type} - {selectedMethod?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-2">
                  {selectedMethod?.code === 'QRIS' ? 'KODE QR' : 'NOMOR VIRTUAL ACCOUNT'}
                </div>
                
                {/* Tampilkan QR Code jika QRIS, atau teks kode jika VA */}
                {selectedMethod?.code === 'QRIS' ? (
                  <div className="flex flex-col items-center space-y-3">
                    {/* QR Code Image */}
                    <div 
                      id="qr-code-container" 
                      className="p-4 bg-white border rounded-lg shadow-sm"
                    /> 
                  </div>
                ) : (
                  <div className="text-2xl font-mono font-bold tracking-wider">
                    {paymentCode}
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  if (selectedMethod?.code === 'QRIS') {
                    downloadQRCode()
                  } else {
                    copyPaymentCode(paymentCode)
                  }
                }}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                {selectedMethod?.code === 'QRIS' ? (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    DOWNLOAD
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    SALIN NOMOR VA
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">TOTAL PEMBAYARAN</div>
              <div className="text-2xl font-bold text-blue-600">
                {selectedMethod && formatCurrency(baseAmount + selectedMethod.price)}
              </div>
            </div>

            {/* Payment instructions will vary based on method type */}
            {selectedMethod?.code !== 'QRIS' ? (
                <div className="space-y-3 text-sm">
              <div className="flex">
                <span className="mr-2">1.</span>
                <span>Lakukan log in pada aplikasi {selectedMethod?.name.split(" ")[1]} Mobile</span>
              </div>
              <div className="flex">
                <span className="mr-2">2.</span>
                <span>
                  Pilih menu m-{selectedMethod?.name.split(" ")[1]}, kemudian masukkan kode akses m-
                  {selectedMethod?.name.split(" ")[1]}
                </span>
              </div>
              <div className="flex">
                <span className="mr-2">3.</span>
                <span>
                  Pilih m-Transfer {">"} {selectedMethod?.name.split(" ")[1]} Virtual Account
                </span>
              </div>
              <div className="flex">
                <span className="mr-2">4.</span>
                <span>
                  Masukkan nomor virtual akun Anda <strong>{paymentCode}</strong> pada menu Input No. Virtual Akun,
                  tekan OK dan Send
                </span>
              </div>
              <div className="flex">
                <span className="mr-2">5.</span>
                <span>
                  Tagihan yang harus dibayarkan sebesar{" "}
                  <strong>{selectedMethod ? formatCurrency(calculateTotal(selectedMethod)) : ""}</strong> dan atas nama{" "}
                  <strong>Rekber.com</strong> akan muncul pada layar konfirmasi. Tekan OK.
                </span>
              </div>
              <div className="flex">
                <span className="mr-2">6.</span>
                <span>Masukkan pin m-{selectedMethod?.name.split(" ")[1]}</span>
              </div>
              <div className="flex">
                <span className="mr-2">7.</span>
                <span>Pembayaran selesai. Simpan notifikasi yang muncul sebagai bukti pembayaran</span>
              </div>
            </div> 
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex">
                  <span className="mr-2">1.</span>
                  <span>Buka aplikasi e-wallet atau mobile banking yang mendukung QRIS</span>
                </div>
                <div className="flex">
                  <span className="mr-2">2.</span>
                  <span>Pilih menu Scan QR atau Bayar dengan QR</span>
                </div>
                <div className="flex">
                  <span className="mr-2">3.</span>
                  <span>Scan kode QR</span>
                </div>
                <div className="flex">
                  <span className="mr-2">4.</span>
                  <span>Konfirmasi pembayaran sebesar <strong>{selectedMethod && formatCurrency(calculateTotal(selectedMethod))}</strong></span>
                </div>
                <div className="flex">
                  <span className="mr-2">5.</span>
                  <span>Masukkan PIN dan selesaikan pembayaran</span>
                </div>
              </div>
            )}

            {/* Payment Deadline */}
            <div className="text-sm text-gray-600">
              <div className="text-sm text-gray-600">
                {expiryDate ? (
                  <>Batas waktu pembayaran s/d {format(new Date(expiryDate), 'dd MMMM yyyy HH:mm')}</>
                ) : (
                  <>Memuat batas waktu pembayaran...</>
                )}
              </div>
            </div>

            {/* Warning */}
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-red-600 text-sm text-center">
                Pastikan nominal pembayaran sesuai dengan yang tertera di atas.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}