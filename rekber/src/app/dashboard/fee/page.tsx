"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  TrendingDown,
  TrendingUp,
  Shield,
  Info,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const runtime = "edge";

export default function MobileFeePage() {
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showExamples, setShowExamples] = useState(false);
  const [showFaq, setShowFaq] = useState(false);

  // Fungsi untuk menghitung fee
  const calculateFee = (inputAmount: number) => {
    if (inputAmount <= 0) return 0;

    let calculatedFee = 0;
    const hundredMillion = 100000000; // 100 juta

    if (inputAmount <= hundredMillion) {
      calculatedFee = inputAmount * 0.01;
    } else {
      calculatedFee = inputAmount * 0.005;
    }
    // Minimum fee adalah 10.000
    return Math.max(calculatedFee, 10000);
  };

  // Format currency untuk display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format number dengan separator
  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return new Intl.NumberFormat("id-ID").format(Number.parseInt(number) || 0);
  };

  // Handle perubahan amount
  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setAmount(numericValue);

    const parsedAmount = Number.parseInt(numericValue) || 0;
    const calculatedFee = calculateFee(parsedAmount);
    setFee(calculatedFee);
    setTotalAmount(parsedAmount + calculatedFee);
  };

  // Contoh perhitungan
  const examples = [
    { amount: 50000, description: "Transaksi Kecil" },
    { amount: 500000, description: "Transaksi Menengah" },
    { amount: 5000000, description: "Transaksi Besar" },
    { amount: 50000000, description: "Transaksi Sangat Besar" },
    { amount: 150000000, description: "Transaksi Premium" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Calculator className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Kalkulator Fee</h1>
            <p className="text-xs text-gray-500">
              Hitung biaya transaksi rekber
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Fee Structure Cards */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-3 text-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                <TrendingDown className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-lg font-bold text-green-600">1%</p>
              <p className="text-[10px] text-gray-500 leading-tight">
                ≤ Rp 100jt
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-3 text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-blue-600">0.5%</p>
              <p className="text-[10px] text-gray-500 leading-tight">
                &gt; Rp 100jt
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-3 text-center">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                <Shield className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-lg font-bold text-orange-600">10K</p>
              <p className="text-[10px] text-gray-500 leading-tight">
                Fee Min.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Calculator */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              Hitung Fee Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Jumlah Transaksi
              </label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  value={formatNumber(amount)}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className={`bg-white border border-gray-200 h-12 text-base pl-10 w-full rounded-xl ${Number(amount.replace(/\D/g, "")) === 0
                      ? "text-gray-400"
                      : "text-gray-800"
                    }`}
                />
                <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                  Rp
                </span>
              </div>
            </div>

            {/* Result */}
            {amount && Number.parseInt(amount) > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-1.5 text-blue-700 mb-1">
                  <Calculator className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">Hasil Kalkulasi</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">
                    Jumlah Transaksi
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(Number.parseInt(amount))}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">
                    Fee (
                    {Number.parseInt(amount) <= 100000000 ? "1%" : "0.5%"}, min.
                    Rp 10.000)
                  </span>
                  <span className="text-sm font-semibold text-orange-600">
                    {formatCurrency(fee)}
                  </span>
                </div>

                <Separator className="bg-blue-200/50" />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-blue-700">
                    Total Bayar
                  </span>
                  <span className="text-base font-bold text-blue-700">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Examples Section (Collapsible) */}
        <Card className="border border-gray-100 shadow-sm">
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="w-full px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">
                Contoh Perhitungan Fee
              </span>
            </div>
            {showExamples ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {showExamples && (
            <CardContent className="px-4 pb-4 pt-0 space-y-2.5">
              {examples.map((example, index) => {
                const exampleFee = calculateFee(example.amount);
                const total = example.amount + exampleFee;
                const percentage =
                  example.amount <= 100000000 ? "1%" : "0.5%";

                return (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900">
                          {example.description}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {formatCurrency(example.amount)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-1.5 rounded border border-gray-100 text-center">
                        <p className="text-[10px] text-gray-500">
                          Fee ({percentage})
                        </p>
                        <p className="text-xs font-semibold text-orange-600">
                          {formatCurrency(exampleFee)}
                        </p>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-gray-100 text-center">
                        <p className="text-[10px] text-gray-500">Total</p>
                        <p className="text-xs font-bold text-blue-600">
                          {formatCurrency(total)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          )}
        </Card>

        {/* FAQ Section (Collapsible) */}
        <Card className="border border-gray-100 shadow-sm mb-4">
          <button
            onClick={() => setShowFaq(!showFaq)}
            className="w-full px-4 py-3 flex items-center justify-between"
          >
            <span className="text-sm font-semibold text-gray-900">
              Pertanyaan Umum
            </span>
            {showFaq ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {showFaq && (
            <CardContent className="px-4 pb-4 pt-0 space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h3 className="text-xs font-semibold text-gray-900 mb-1">
                  Mengapa ada fee minimum Rp 10.000?
                </h3>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Fee minimum memastikan layanan escrow tetap berkelanjutan dan
                  dapat memberikan perlindungan optimal untuk setiap transaksi.
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <h3 className="text-xs font-semibold text-gray-900 mb-1">
                  Kapan fee dikenakan?
                </h3>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Fee dikenakan saat pembeli melakukan pembayaran ke rekening
                  escrow. Fee sudah termasuk dalam total yang harus dibayar
                  pembeli.
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <h3 className="text-xs font-semibold text-gray-900 mb-1">
                  Apakah ada biaya tersembunyi?
                </h3>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Tidak ada biaya tersembunyi. Semua biaya sudah transparan dan
                  ditampilkan sebelum transaksi dimulai.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
