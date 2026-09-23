"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Filter,
  ChevronDown,
} from "lucide-react";

export const runtime = "edge";

export default function LaporanPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("bulan-ini");
  const [showFilter, setShowFilter] = useState(false);

  // Data dummy untuk tampilan
  const summaryStats = [
    {
      label: "Total Transaksi",
      value: "Rp 0",
      change: "+0%",
      trend: "up",
      icon: <TrendingUp className="w-4 h-4" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Transaksi Sukses",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: <ArrowUpRight className="w-4 h-4" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Transaksi Gagal",
      value: "0",
      change: "0%",
      trend: "down",
      icon: <ArrowDownRight className="w-4 h-4" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Fee Terkumpul",
      value: "Rp 0",
      change: "+0%",
      trend: "up",
      icon: <TrendingUp className="w-4 h-4" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const periods = [
    { value: "hari-ini", label: "Hari Ini" },
    { value: "minggu-ini", label: "Minggu Ini" },
    { value: "bulan-ini", label: "Bulan Ini" },
    { value: "3-bulan", label: "3 Bulan Terakhir" },
    { value: "semua", label: "Semua Waktu" },
  ];

  // Data dummy riwayat transaksi
  const transactionHistory: {
    id: number;
    title: string;
    amount: string;
    date: string;
    status: string;
    type: string;
  }[] = [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <PieChart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Laporan</h1>
              <p className="text-xs text-gray-500">
                Ringkasan aktivitas transaksi
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => setShowFilter(!showFilter)}
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
            <ChevronDown
              className={`w-3 h-3 transition-transform ${showFilter ? "rotate-180" : ""}`}
            />
          </Button>
        </div>

        {/* Period Filter */}
        {showFilter && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedPeriod === period.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Summary Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {summaryStats.map((stat, index) => (
            <Card
              key={index}
              className="border border-gray-100 shadow-sm"
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                    <div className={stat.color}>{stat.icon}</div>
                  </div>
                  
                </div>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart Placeholder */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Grafik Transaksi
            </CardTitle>
            <p className="text-xs text-gray-500">
              {periods.find((p) => p.value === selectedPeriod)?.label}
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex flex-col items-center justify-center">
              <PieChart className="w-10 h-10 text-blue-300 mb-2" />
              <p className="text-sm text-gray-400 font-medium">
                Belum ada data
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Grafik akan tampil saat ada transaksi
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="pb-2 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Riwayat Transaksi
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-7 px-2">
                Lihat Semua
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {transactionHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">
                  Belum ada riwayat
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Riwayat transaksi akan muncul di sini
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactionHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${item.type === "masuk"
                            ? "bg-green-50"
                            : "bg-red-50"
                          }`}
                      >
                        {item.type === "masuk" ? (
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {item.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${item.type === "masuk"
                            ? "text-green-600"
                            : "text-red-600"
                          }`}
                      >
                        {item.type === "masuk" ? "+" : "-"}
                        {item.amount}
                      </p>
                       
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
