'use client';
import { useBankValidation } from '@/hooks/useBankValidation';
import { useState, useEffect } from 'react';
import {
  Search, 
  Plus,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from "@/components/ui/card" 
import { getStatusBadge } from "@/app/components/atom/badge";
import { Badge } from "@/components/ui/badge";

import { API_URL } from '@/constants/api';
import { encodeTransactionId } from '@/lib/transactionId';
const tabs = [
  { value: 'all', label: 'All' },
  { value: 'wait_payment', label: 'Wait' },
  { value: 'paid', label: 'Paid' },
  { value: 'completed', label: 'Done' },
];
 
type Transaction = {
  id: number;
  kode_transaksi: string;
  title: string;
  status: string;
  amount_paid: string;
  created_at: string;
  seller_name: string | null;
  buyer_name: string | null;
  seller_id?: number | string | null;
  buyer_id?: number | string | null;
  is_partnership?: boolean | null;
  partnership_percentage?: string | number | null;
};

function TransactionTable({ data }: { data: Transaction[] }) {
  const router = useRouter();
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;

  const handleRowClick = (transactionId: number) => {
    router.push(`/dashboard/transactions/${encodeTransactionId(transactionId)}`);
  };
 
  if (data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-64 text-gray-500 px-4'>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <p className='text-lg font-medium'>Belum ada transaksi</p>
        <p className='text-sm mt-1 mb-4'>Anda belum memiliki transaksi apapun.</p>
        <Button onClick={() => router.push('/formrekber')}>
          <Plus className='h-4 w-4 mr-2' />
          Buat Transaksi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {data.map((transaction) => {
        const isPartnershipActive = transaction.is_partnership;

        const isSeller = currentUserId && transaction.seller_id && String(currentUserId) === String(transaction.seller_id);
        const showPartnership = isPartnershipActive && isSeller;

        return (
          <Card 
            key={transaction.id} 
            className="hover:shadow-md transition-shadow cursor-pointer w-full"
            onClick={() => handleRowClick(transaction.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{transaction.title}</h3>
                  <p className="text-sm text-gray-500">{transaction.kode_transaksi}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {getStatusBadge(transaction.status)}
                  {showPartnership && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 text-xs font-semibold px-2 py-0.5 rounded-md">
                      Partnership
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="font-semibold text-green-600">
                    Rp {parseInt(transaction.amount_paid).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Created</span>
                  <span className="text-sm">
                    {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Seller</span>
                    <span className="text-sm font-medium text-blue-600">
                      {transaction.seller_name || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Buyer</span>
                    <span className="text-sm font-medium text-blue-600">
                      {transaction.buyer_name || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function MyTransaksiContent() {
  const { isLoading, isBankValid, missingPhone, missingBank } = useBankValidation()
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchTransactions() {
      const requestUrl = `${API_URL}/transactions`;

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          localStorage.removeItem('token');
          router.push('/auth/login');
          return;
        }

        setErrorMessage('');

        const res = await fetch(requestUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          router.push('/auth/login');
          return;
        }

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        setTransactions(data.transactions || []);
      } catch (error) {
        console.error('Error fetching transactions', {
          requestUrl,
          error,
        });

        const message = error instanceof TypeError
          ? `Tidak dapat terhubung ke server API di ${requestUrl}. Pastikan backend berjalan dan bisa diakses dari browser.`
          : error instanceof Error
            ? error.message
            : 'Gagal mengambil data transaksi.';

        setTransactions([]);
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [router]);

  useEffect(() => { 
    const mainElement = document.querySelector('main');
    if (mainElement) { 
      const originalClasses = mainElement.className; 
      mainElement.className = ''; 
      return () => {
        mainElement.className = originalClasses;
      };
    }
  }, []);
  const filteredData = transactions.filter((transaction) => {
    // Filter berdasarkan search query
    const matchesSearch = 
      transaction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.kode_transaksi.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter berdasarkan status tab
    const matchesTab = (() => {
      switch (activeTab) {
        case 'all':
          return true; // Tampilkan semua transaksi
        case 'wait_payment':
          return transaction.status === 'wait_payment';
        case 'paid':
          return transaction.status === 'paid';
        case 'completed': 
          return transaction.status === 'completed';
        default:
          return true;
      }
    })();

    return matchesSearch && matchesTab;
  });
  const getTabCount = (tabValue: string) => {
    return transactions.filter((transaction) => {
      switch (tabValue) {
        case 'all':
          return true;
        case 'wait_payment':
          return transaction.status === 'wait_payment';
        case 'paid':
          return transaction.status === 'paid';
        case 'completed': 
          return transaction.status === 'completed';
        default:
          return true;
      }
    }).length;
  };

  // PENAHAN LAYAR (INTERCEPTOR)
  // PENAHAN LAYAR LAPIS 1: Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full"></div>
          <p className="text-sm text-slate-500 font-medium">Memeriksa persyaratan akun...</p>
        </div>
      </div>
    );
  }

  // PENAHAN LAYAR LAPIS 2: Peringatan Profil Belum Lengkap (No HP dan/atau Rekening Bank)
  if (!isBankValid) {
    const profileGap = missingPhone && missingBank
      ? {
          title: 'Profil Belum Lengkap',
          description: 'Anda wajib melengkapi Nomor HP dan Rekening Bank terlebih dahulu untuk melanjutkan ke halaman transaksi.',
          cta: 'Lengkapi Profil Sekarang',
          target: '/dashboard/profile#profile',
        }
      : missingPhone
      ? {
          title: 'Nomor HP Belum Diisi',
          description: 'Anda wajib melengkapi Nomor HP terlebih dahulu untuk melanjutkan ke halaman transaksi.',
          cta: 'Isi Nomor HP Sekarang',
          target: '/dashboard/profile#profile',
        }
      : {
          title: 'Rekening Belum Lengkap',
          description: 'Anda wajib melengkapi data Rekening Bank terlebih dahulu untuk melanjutkan ke halaman transaksi.',
          cta: 'Isi Rekening Sekarang',
          target: '/dashboard/profile#bank',
        };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="-mt-24 bg-white p-8 rounded-3xl shadow-sm border border-orange-100 max-w-md w-full text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{profileGap.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              Sistem menolak akses Anda. {profileGap.description}
            </p>
          </div>
          <Button
            onClick={() => router.push(profileGap.target)}
            className="w-full bg-[#2b66f6] hover:bg-[#1a55e5] text-white rounded-2xl h-12 font-bold shadow-lg shadow-blue-500/20"
          >
            {profileGap.cta}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='flex flex-col h-full'>
        <div className='bg-white border-b sticky top-0 z-10'>
          <div className='overflow-x-auto'>
            <TabsList className='h-12 w-full min-w-max justify-start rounded-none bg-transparent p-0'>
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className='relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 sm:px-6 pb-3 pt-3 text-gray-600 data-[state=active]:text-blue-600 hover:text-blue-600 whitespace-nowrap text-sm font-bold'
                >
                  {tab.label}
                  {!loading && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {getTabCount(tab.value)}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        <div className='bg-white p-4 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center sm:gap-4'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <Input
              placeholder='Search transactions...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 border-gray-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-200 text-sm'
            />
          </div>

          {/* <Button variant='outline' className='bg-white text-gray-700 border-gray-200 hover:bg-gray-50 sm:w-auto text-sm'>
            <Filter className='h-4 w-4 mr-2' />
            Filter
          </Button> */}

          {transactions.length > 0 && (
            <Button
              onClick={() => router.push('/formrekber')}
                className='bg-blue-600 text-white ml-auto mt-4 w-full sm:mt-0 sm:w-auto'
            >
              <Plus className='h-4 w-4 mr-2' />
              Buat Transaksi
            </Button>
          )}
        </div>
 

        <div className='flex-1 bg-white overflow-auto'>
          {loading ? (
            <div className='flex items-center justify-center h-64'>Loading...</div>
          ) : errorMessage ? (
            <div className='flex flex-col items-center justify-center h-64 px-4 text-center text-gray-600'>
              <p className='text-lg font-medium text-gray-900'>Transactions could not be loaded</p>
              <p className='mt-2 max-w-xl text-sm'>{errorMessage}</p>
            </div>
          ) : (
            <>
              <TabsContent value='all' className='mt-0 h-full'>
                <TransactionTable data={filteredData} />
              </TabsContent>
              
              <TabsContent value='wait_payment' className='mt-0 h-full'>
                <TransactionTable data={filteredData} />
              </TabsContent>
              
              <TabsContent value='paid' className='mt-0 h-full'>
                <TransactionTable data={filteredData} />
              </TabsContent>
              
              <TabsContent value='completed' className='mt-0 h-full'>
                <TransactionTable data={filteredData} />
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
}
