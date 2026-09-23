"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Users, Receipt, TrendingUp, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Interface untuk type safety
interface DashboardStats {
  total_transactions: number;
  active_users: number;
  paid_transactions: number;
  total_amount: number;
}

interface Transaction {
  id: number;
  kode_transaksi: string;
  description: string;
  total_amount: number;
  status: string;
  created_at: string;
  buyer_name: string;
  seller_name: string;
}

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const, icon: Clock, className: "bg-blue-100 text-blue-700" },
  wait_payment: { label: "Menunggu Pembayaran", variant: "secondary" as const, icon: Clock, className: "bg-yellow-100 text-yellow-700" }, 
  closed: { label: "Closed", variant: "secondary" as const, icon: CheckCircle, className: "bg-green-100 text-green-700" },
  completed: { label: "Selesai", variant: "secondary" as const, icon: CheckCircle, className: "bg-green-100 text-green-700" }, 
  paid: { label: "Sudah Dibayar", variant: "secondary" as const, icon: CheckCircle, className: "bg-green-100 text-green-700" },
  disputed: { label: "Bermasalah", variant: "secondary" as const, icon: AlertTriangle, className: "bg-red-100 text-red-700" },
  cancelled: { label: "Dibatalkan", variant: "secondary" as const, icon: XCircle, className: "bg-gray-100 text-gray-700" },
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Validasi format JWT
    const parts = token.split(".");
    if (parts.length !== 3) {
      router.push("/login");
      return;
    }

    // Fetch data dashboard
    fetch(`${API_URL}/admin/dashboard/stats`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(res => {
        if (res.status === 403) {
          localStorage.removeItem("token");
          router.push("/login");
          throw new Error('Unauthorized');
        }
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data && data.status) {
          setStats(data.data.summary);
          setRecentTransactions(data.data.recent_transactions || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Gagal mengambil data dashboard</p>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Transaksi",
      value: stats.total_transactions?.toLocaleString() || "0", 
      icon: CreditCard,
    },
    {
      title: "Pengguna Aktif",
      value: stats.active_users?.toLocaleString() || "0", 
      icon: Users,
    },
    {
      title: "Transaksi Paid",
      value: stats.paid_transactions?.toLocaleString() || "0", 
      icon: Receipt,
    },
    {
      title: "Pembayaran Masuk",
      value: `Rp ${stats.total_amount?.toLocaleString() || "0"}`, 
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
        <p className="text-muted-foreground text-balance">Selamat datang di dashboard admin Rekber.com</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div> 
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>Transaksi terbaru yang perlu perhatian</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => {
                const status = statusConfig[transaction.status as keyof typeof statusConfig] || statusConfig.wait_payment;
                const StatusIcon = status.icon;

                return (
                  <div 
                    key={transaction.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4 sm:gap-0 cursor-pointer hover:bg-accent/5 transition-colors"
                    onClick={() => router.push(`/dashboard/transactions/${transaction.id}`)}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="bg-accent/10 p-2 rounded-lg shrink-0">
                        <StatusIcon className="h-4 w-4 text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{transaction.kode_transaksi}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {transaction.buyer_name} → {transaction.seller_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:text-right gap-2 sm:gap-1">
                      <p className="font-medium text-lg sm:text-base">Rp {transaction.total_amount?.toLocaleString() || "0"}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
                        <Badge variant={status.variant} className="w-fit">{status.label}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {transaction.created_at ? new Date(transaction.created_at).toLocaleDateString('id-ID') : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-muted-foreground py-4">Tidak ada transaksi terbaru</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}