'use client';
import { Card, CardContent,CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Users,
  UserCheck,
  PlayCircle,
  CheckCircle, 
  XCircle,
  Eye,
  Shield,
} from 'lucide-react';

export default function DashboardPage() {
  const stats = [  
    {
      title: 'Total Rekber anda',
      value: '1',
      icon: <Users className='w-5 h-5' />,
      color: 'bg-blue-50 border-blue-200',
      hasViewAll: true,
    },
    {
      title: 'Rekber Belum diterima',
      value: '1',
      icon: <UserCheck className='w-5 h-5' />,
      color: 'bg-blue-50 border-blue-200',
      hasViewAll: true,
    },
    {
      title: 'Rekber Berjalan',
      value: '0',
      icon: <PlayCircle className='w-5 h-5' />,
      color: 'bg-blue-50 border-blue-200',
      hasViewAll: true,
    },
    {
      title: 'Rekber Sukses',
      value: '0',
      icon: <CheckCircle className='w-5 h-5' />,
      color: 'bg-blue-50 border-blue-200',
      hasViewAll: true,
    }, 
    {
      title: 'Dibatalkan',
      value: '0',
      icon: <XCircle className='w-5 h-5' />,
      color: 'bg-blue-50 border-blue-200',
      hasViewAll: true,
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <Card className='bg-blue-100 border-blue-200'>
          <CardContent className='p-4 md:p-6'>
            <div className='flex items-start gap-3'>
              <Shield className='w-6 h-6 text-blue-600 mt-1 flex-shrink-0' />
              <div className='space-y-2'>
                <h3 className='text-lg font-semibold text-blue-800'>
                  Verifikasi IDENTITAS Diperlukan
                </h3>
                <p className='text-blue-700 text-sm leading-relaxed'>
                  Selesaikan KYC untuk membuka potensi penuh platform kami! KYC
                  membantu kami memverifikasi identitas Anda dan menjaga
                  keamanan serta mendapatkan manfaat refund 100% jika barang
                  yang anda beli tidak sesuai. Jika anda Tidak memverifikasi
                  maka anda tidak dapat menerima penarikan dana. Segera dengan
                  verifikasi Identitas anda sekarang!
                </p>
                <Link href='/dashboard/verifikasi'>
                  <Button
                    variant='link'
                    className='text-blue-600 p-0 h-auto font-medium'
                  >
                    Click Here to Verify
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className='lg:col-span-3'>
            <div className='grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4'>
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className={`${stat.color} border-l-4 border-l-blue-500`}
                >
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='p-2 bg-blue-100 rounded-full'>
                        <div className='text-blue-600'>{stat.icon}</div>
                      </div>
                      {stat.hasViewAll && (
                        <Button
                          variant='link'
                          size='sm'
                          className='text-blue-600 p-0 h-auto text-xs'
                        >
                          View All
                        </Button>
                      )}
                    </div>
                    <div className='space-y-1'>
                      <p className='text-2xl font-bold text-gray-900'>
                        {stat.value}
                      </p>
                      <p className='text-sm text-gray-600 font-medium'>
                        {stat.title}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Daftar Riwayat Transaksi.</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900">
                        Rekber.com Terdaftar dan diawasi Oleh Bank Indonesia dan Kominfo.
                      </p>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                        Belum ada transaksi
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="text-center py-8">
                  <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-3">
                    <Eye className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">Riwayat transaksi akan muncul di sini</p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
