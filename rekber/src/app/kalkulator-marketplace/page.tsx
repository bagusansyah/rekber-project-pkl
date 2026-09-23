"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import NavBar from "../components/slicings/navbar"
import Footer from "../components/slicings/footer"
import { calculateRekberFee, REKBER_FEE_THRESHOLD } from "@/constants/fee"
import { Calculator, Store, ShieldCheck, TrendingDown, Info } from "lucide-react"

type Platform = "tiktok" | "shopee"

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: "tiktok", label: "TikTok Shop" },
  { id: "shopee", label: "Shopee" },
]

const formatCurrency = (value: number) => {
  if (!Number.isFinite(value)) return "Rp 0"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value))
}

const formatNumberInput = (value: string) => {
  const number = value.replace(/\D/g, "")
  return new Intl.NumberFormat("id-ID").format(Number.parseInt(number) || 0)
}

const parseNumericInput = (value: string) => Number.parseInt(value.replace(/\D/g, "")) || 0

// Sel input bergaya spreadsheet: latar biru, rata kanan.
function RpCell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative w-36 md:w-40">
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-blue-700 font-medium">Rp</span>
      <Input
        inputMode="numeric"
        value={formatNumberInput(value)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        className="h-9 pl-8 pr-2 text-right bg-blue-50 border-blue-200 focus-visible:ring-blue-400 text-blue-900 font-medium"
      />
    </div>
  )
}

function PercentCell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative w-20">
      <Input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
        className="h-9 pr-6 pl-2 text-right bg-blue-50 border-blue-200 focus-visible:ring-blue-400 text-blue-900 font-medium"
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-700 font-medium">%</span>
    </div>
  )
}

export default function KalkulatorMarketplacePage() {
  const [platform, setPlatform] = useState<Platform>("tiktok")
  const [modal, setModal] = useState("50000")
  const [biayaProses, setBiayaProses] = useState("1250")
  const [profitPercent, setProfitPercent] = useState("20")
  const [komisiPlatform, setKomisiPlatform] = useState("10")
  const [komisiLayanan, setKomisiLayanan] = useState("8")
  const [komisiPreOrder, setKomisiPreOrder] = useState("0")
  const [komisiCashback, setKomisiCashback] = useState("0")
  const [komisiVoucher, setKomisiVoucher] = useState("0")
  const [komisiAffiliate, setKomisiAffiliate] = useState("4")

  const isTiktok = platform === "tiktok"

  const result = useMemo(() => {
    const cost = parseNumericInput(modal)
    const processingFee = parseNumericInput(biayaProses)
    const profitPct = Number.parseFloat(profitPercent) || 0

    const platformPct = Number.parseFloat(komisiPlatform) || 0
    const layananPct = Number.parseFloat(komisiLayanan) || 0
    const affiliatePct = Number.parseFloat(komisiAffiliate) || 0
    const preOrderPct = isTiktok ? Number.parseFloat(komisiPreOrder) || 0 : 0
    const cashbackPct = isTiktok ? Number.parseFloat(komisiCashback) || 0 : 0
    const voucherPct = isTiktok ? Number.parseFloat(komisiVoucher) || 0 : 0
    const totalCommissionPct = platformPct + layananPct + affiliatePct + preOrderPct + cashbackPct + voucherPct

    const profitAmount = (cost * profitPct) / 100
    const baseAmount = cost + profitAmount + processingFee

    // Marketplace: komisi dipotong dari harga jual, jadi harga jual harus di-gross-up
    const commissionRate = totalCommissionPct / 100
    const marketplacePrice = commissionRate < 1 ? baseAmount / (1 - commissionRate) : 0
    const platformAmount = marketplacePrice * (platformPct / 100)
    const layananAmount = marketplacePrice * (layananPct / 100)
    const affiliateAmount = marketplacePrice * (affiliatePct / 100)
    const preOrderAmount = marketplacePrice * (preOrderPct / 100)
    const cashbackAmount = marketplacePrice * (cashbackPct / 100)
    const voucherAmount = marketplacePrice * (voucherPct / 100)
    const totalCommissionAmount =
      platformAmount + layananAmount + affiliateAmount + preOrderAmount + cashbackAmount + voucherAmount
    const totalPotongan = totalCommissionAmount + processingFee
    const marketplaceSaldoAkhir = marketplacePrice - totalCommissionAmount - processingFee

    // Rekber: tidak ada komisi maupun biaya proses pesanan (semua 0), hanya satu fee escrow
    // yang dibebankan terpisah ke pembeli — jadi harga jual = harga asli tanpa gross-up.
    const rekberPrice = cost + profitAmount
    const rekberFee = calculateRekberFee(rekberPrice)
    const rekberBuyerPays = rekberPrice + rekberFee
    const rekberSaldoAkhir = rekberPrice

    const priceSavings = marketplacePrice - rekberPrice
    const savingsPercent = marketplacePrice > 0 ? (priceSavings / marketplacePrice) * 100 : 0

    return {
      cost,
      processingFee,
      profitPct,
      profitAmount,
      baseAmount,
      platformPct,
      layananPct,
      affiliatePct,
      preOrderPct,
      cashbackPct,
      voucherPct,
      totalCommissionPct,
      platformAmount,
      layananAmount,
      affiliateAmount,
      preOrderAmount,
      cashbackAmount,
      voucherAmount,
      totalCommissionAmount,
      totalPotongan,
      marketplacePrice,
      marketplaceSaldoAkhir,
      rekberPrice,
      rekberFee,
      rekberBuyerPays,
      rekberSaldoAkhir,
      priceSavings,
      savingsPercent,
    }
  }, [
    platform,
    isTiktok,
    modal,
    biayaProses,
    profitPercent,
    komisiPlatform,
    komisiLayanan,
    komisiPreOrder,
    komisiCashback,
    komisiVoucher,
    komisiAffiliate,
  ])

  const hasInput = result.cost > 0
  const totalRowClass = "bg-gray-50 font-semibold"
  const profitRowClass = "bg-green-50 font-semibold text-green-700"
  const zeroCellClass = "text-right font-medium text-gray-400"
  const platformLabel = PLATFORMS.find((p) => p.id === platform)?.label ?? "Marketplace"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <NavBar />

      <div className="container mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Calculator className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Kalkulator Marketplace</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pilih platform, edit langsung sel berwarna biru seperti di spreadsheet — semua angka lain otomatis
            dihitung ulang dan langsung dibandingkan dengan jual pakai Rekber.com.
          </p>
        </div>

        {/* Tabel Marketplace & Rekber, sejajar */}
        <div className="grid md:grid-cols-2 gap-8 mb-8 items-start">
        <Card className="bg-white shadow-lg overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Store className="h-5 w-5 text-orange-600" />
                <span>Simulasi Jual di {platformLabel}</span>
              </CardTitle>
              <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      platform === p.id
                        ? p.id === "tiktok"
                          ? "bg-black text-white shadow-sm"
                          : "bg-orange-500 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Komponen</TableHead>
                    <TableHead className="text-right">Persentase</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Modal (Harga Beli)</TableCell>
                    <TableCell className="text-right text-gray-400">—</TableCell>
                    <TableCell className="text-right">
                      <RpCell value={modal} onChange={setModal} />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Target Profit</TableCell>
                    <TableCell className="text-right">
                      <PercentCell value={profitPercent} onChange={setProfitPercent} />
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(result.profitAmount)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Biaya Proses Pesanan</TableCell>
                    <TableCell className="text-right text-gray-400">—</TableCell>
                    <TableCell className="text-right">
                      <RpCell value={biayaProses} onChange={setBiayaProses} />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Komisi Platform</TableCell>
                    <TableCell className="text-right">
                      <PercentCell value={komisiPlatform} onChange={setKomisiPlatform} />
                    </TableCell>
                    <TableCell className="text-right font-medium text-orange-600">
                      {formatCurrency(result.platformAmount)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Komisi Layanan</TableCell>
                    <TableCell className="text-right">
                      <PercentCell value={komisiLayanan} onChange={setKomisiLayanan} />
                    </TableCell>
                    <TableCell className="text-right font-medium text-orange-600">
                      {formatCurrency(result.layananAmount)}
                    </TableCell>
                  </TableRow>
                  {isTiktok && (
                    <>
                      <TableRow>
                        <TableCell>Biaya Pre Order</TableCell>
                        <TableCell className="text-right">
                          <PercentCell value={komisiPreOrder} onChange={setKomisiPreOrder} />
                        </TableCell>
                        <TableCell className="text-right font-medium text-orange-600">
                          {formatCurrency(result.preOrderAmount)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Biaya Layanan Cashback</TableCell>
                        <TableCell className="text-right">
                          <PercentCell value={komisiCashback} onChange={setKomisiCashback} />
                        </TableCell>
                        <TableCell className="text-right font-medium text-orange-600">
                          {formatCurrency(result.cashbackAmount)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Biaya Layanan Voucher</TableCell>
                        <TableCell className="text-right">
                          <PercentCell value={komisiVoucher} onChange={setKomisiVoucher} />
                        </TableCell>
                        <TableCell className="text-right font-medium text-orange-600">
                          {formatCurrency(result.voucherAmount)}
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                  <TableRow>
                    <TableCell>Komisi Affiliate</TableCell>
                    <TableCell className="text-right">
                      <PercentCell value={komisiAffiliate} onChange={setKomisiAffiliate} />
                    </TableCell>
                    <TableCell className="text-right font-medium text-orange-600">
                      {formatCurrency(result.affiliateAmount)}
                    </TableCell>
                  </TableRow>
                  <TableRow className={totalRowClass}>
                    <TableCell>Total Komisi</TableCell>
                    <TableCell className="text-right">{result.totalCommissionPct.toFixed(1)}%</TableCell>
                    <TableCell className="text-right text-orange-700">
                      {formatCurrency(result.totalCommissionAmount)}
                    </TableCell>
                  </TableRow>
                  {isTiktok && (
                    <TableRow className={totalRowClass}>
                      <TableCell>Potongan {platformLabel}</TableCell>
                      <TableCell className="text-right text-gray-400">—</TableCell>
                      <TableCell className="text-right text-orange-700">
                        {formatCurrency(result.totalPotongan)}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow className={totalRowClass}>
                    <TableCell>Harga Jual</TableCell>
                    <TableCell className="text-right text-gray-400">—</TableCell>
                    <TableCell className="text-right">{formatCurrency(result.marketplacePrice)}</TableCell>
                  </TableRow>
                  <TableRow className={totalRowClass}>
                    <TableCell>Saldo Akhir</TableCell>
                    <TableCell className="text-right text-gray-400">—</TableCell>
                    <TableCell className="text-right">{formatCurrency(result.marketplaceSaldoAkhir)}</TableCell>
                  </TableRow>
                  <TableRow className={profitRowClass}>
                    <TableCell>Profit</TableCell>
                    <TableCell className="text-right text-gray-400">—</TableCell>
                    <TableCell className="text-right">{formatCurrency(result.profitAmount)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Tabel Rekber */}
        <Card className="bg-white shadow-lg overflow-hidden border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <span>Simulasi Jual Pakai Rekber.com</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Komponen</TableHead>
                    <TableHead className="text-right">Persentase</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Modal (Harga Beli)</TableCell>
                    <TableCell className="text-right text-gray-400">—</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(result.cost)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Target Profit</TableCell>
                    <TableCell className="text-right text-gray-500">{result.profitPct}%</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(result.profitAmount)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Biaya Proses Pesanan</TableCell>
                    <TableCell className="text-right text-gray-400">—</TableCell>
                    <TableCell className={zeroCellClass}>Rp 0</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Komisi Platform</TableCell>
                    <TableCell className="text-right text-gray-500">0%</TableCell>
                    <TableCell className={zeroCellClass}>Rp 0</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Komisi Layanan</TableCell>
                    <TableCell className="text-right text-gray-500">0%</TableCell>
                    <TableCell className={zeroCellClass}>Rp 0</TableCell>
                  </TableRow>
                  {isTiktok && (
                    <>
                      <TableRow>
                        <TableCell>Biaya Pre Order</TableCell>
                        <TableCell className="text-right text-gray-500">0%</TableCell>
                        <TableCell className={zeroCellClass}>Rp 0</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Biaya Layanan Cashback</TableCell>
                        <TableCell className="text-right text-gray-500">0%</TableCell>
                        <TableCell className={zeroCellClass}>Rp 0</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Biaya Layanan Voucher</TableCell>
                        <TableCell className="text-right text-gray-500">0%</TableCell>
                        <TableCell className={zeroCellClass}>Rp 0</TableCell>
                      </TableRow>
                    </>
                  )}
                  <TableRow>
                    <TableCell>Komisi Affiliate</TableCell>
                    <TableCell className="text-right text-gray-500">0%</TableCell>
                    <TableCell className={zeroCellClass}>Rp 0</TableCell>
                  </TableRow>
                  <TableRow className={totalRowClass}>
                    <TableCell>Total Komisi</TableCell>
                    <TableCell className="text-right">0.0%</TableCell>
                    <TableCell className="text-right">Rp 0</TableCell>
                  </TableRow>
                  <TableRow className={totalRowClass}>
                    <TableCell>Harga Jual</TableCell>
                    <TableCell className="text-right text-gray-400">—</TableCell>
                    <TableCell className="text-right">{formatCurrency(result.rekberPrice)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Fee Rekber.com (dibayar pembeli)</TableCell>
                    <TableCell className="text-right text-gray-500">
                      {result.rekberPrice <= REKBER_FEE_THRESHOLD ? "1%" : "0.5%"}
                    </TableCell>
                    <TableCell className="text-right font-medium text-blue-600">
                      {formatCurrency(result.rekberFee)}
                    </TableCell>
                  </TableRow>
                  <TableRow className={totalRowClass}>
                    <TableCell>Total Dibayar Pembeli</TableCell>
                    <TableCell className="text-right text-gray-400">—</TableCell>
                    <TableCell className="text-right">{formatCurrency(result.rekberBuyerPays)}</TableCell>
                  </TableRow>
                  <TableRow className={totalRowClass}>
                    <TableCell>Saldo Akhir</TableCell>
                    <TableCell className="text-right text-gray-400">—</TableCell>
                    <TableCell className="text-right">{formatCurrency(result.rekberSaldoAkhir)}</TableCell>
                  </TableRow>
                  <TableRow className={profitRowClass}>
                    <TableCell>Profit</TableCell>
                    <TableCell className="text-right text-gray-400">—</TableCell>
                    <TableCell className="text-right">{formatCurrency(result.profitAmount)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        </div>

        {hasInput && (
          <Card className="bg-blue-50 border-blue-200 shadow-lg mb-12">
            <CardContent className="p-8 space-y-6">
              <h3 className="text-center text-lg font-semibold text-gray-900">Perbandingan Harga Jual</h3>

              <div className="grid grid-cols-2 divide-x divide-blue-200 text-center">
                <div className="px-4 space-y-1">
                  <p className="text-sm text-gray-500">{platformLabel}</p>
                  <p className="text-2xl md:text-3xl font-bold text-orange-600">
                    {formatCurrency(result.marketplacePrice)}
                  </p>
                  <p className="text-xs text-gray-500">Total dibayar pembeli sama dengan harga jual ini</p>
                </div>
                <div className="px-4 space-y-1">
                  <p className="text-sm text-gray-500">Rekber.com</p>
                  <p className="text-2xl md:text-3xl font-bold text-blue-700">{formatCurrency(result.rekberPrice)}</p>
                  <p className="text-xs text-gray-500">+ fee {formatCurrency(result.rekberFee)} dibayar pembeli</p>
                </div>
              </div>

              <div className="flex justify-center">
                <TrendingDown className="h-6 w-6 text-blue-600" />
              </div>

              <p className="text-center text-gray-700">
                Dengan profit yang sama <span className="font-semibold">({formatCurrency(result.profitAmount)})</span>,
                harga jual yang dipasang pakai Rekber.com lebih murah
              </p>
              <p className="text-center text-3xl font-bold text-blue-700">
                {formatCurrency(Math.max(result.priceSavings, 0))}
                {result.savingsPercent > 0 && (
                  <span className="text-lg font-semibold text-blue-500"> ({result.savingsPercent.toFixed(1)}%)</span>
                )}
              </p>
              <p className="text-center text-gray-600 text-sm">
                dibanding harga yang harus dipasang di {platformLabel} — karena komisi marketplace dipotong dari
                harga jual, sedangkan fee Rekber.com dibayar terpisah oleh pembeli sehingga profit kamu tidak
                tergerus.
              </p>
              <div className="flex justify-center pt-2">
                <Badge className="bg-blue-100 text-blue-800">Profit penjual tetap 100% terjaga di Rekber.com</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className="bg-white shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="text-xl text-center text-gray-900 flex items-center justify-center space-x-2">
              <Info className="h-5 w-5 text-blue-600" />
              <span>Kenapa Bisa Lebih Murah?</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Di marketplace</h3>
              <p className="text-gray-600">
                Komisi platform, layanan, dan afiliasi (plus biaya lain seperti Pre Order, Cashback, dan Voucher di
                TikTok Shop) dipotong langsung dari harga jual. Supaya profit tidak berkurang, kamu harus menaikkan
                harga jual agar setelah dipotong semua komisi, sisa uang tetap menutup modal dan profit.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Di Rekber.com</h3>
              <p className="text-gray-600">
                Semua kategori komisi dan biaya proses pesanan di Rekber.com bernilai 0 — hanya ada satu fee escrow
                (1% / 0.5%, minimum Rp 10.000) yang dibayar terpisah oleh pembeli di atas harga jual. Kamu bisa jual
                di harga aslinya (modal + profit) tanpa perlu menaikkan harga untuk menutup komisi maupun biaya
                proses pesanan.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Siap Jual Tanpa Potongan Komisi?</h2>
          <p className="text-gray-600 mb-6">Mulai transaksi aman dengan fee yang jauh lebih ringan daripada marketplace</p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
              Mulai Transaksi Sekarang
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
