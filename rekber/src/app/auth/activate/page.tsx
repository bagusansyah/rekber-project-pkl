'use client';
 
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NavBar from '@/app/components/slicings/navbar';
import Footer from '@/app/components/slicings/footer';
import { API_URL } from '@/constants/api';

function ActivateContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token aktivasi tidak ditemukan');
      return;
    }

    const activateAccount = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/activate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Gagal mengaktivasi akun');
        }

        setStatus('success');
        setMessage('Akun berhasil diaktivasi! Anda sekarang dapat login.');
        
        // Redirect ke login setelah 3 detik
        setTimeout(() => {
          router.push('/auth/login');
        }, 20000);

      } catch (err: unknown) {
        setStatus('error');
        if (err instanceof Error) {
          setMessage(err.message);
        } else {
          setMessage('Terjadi kesalahan saat mengaktivasi akun');
        }
      }
    };

    activateAccount();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {status === 'loading' && 'Mengaktivasi Akun...'}
            {status === 'success' && 'Aktivasi Berhasil!'}
            {status === 'error' && 'Aktivasi Gagal'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-600">
            {message}
          </p>
          
          {status === 'success' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-500">
                Anda akan diarahkan ke halaman login dalam 3 detik...
              </div>
              <Button 
                onClick={() => router.push('/auth/login')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Login Sekarang
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4"> 
              <Button 
                onClick={() => router.push('/auth/login')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Ke Halaman Login
              </Button>
            </div>
          )}
          
          {status === 'loading' && (
            <div className="text-sm text-gray-500">
              Mohon tunggu, sedang memverifikasi token aktivasi...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <>
      <NavBar />
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </div>
      }>
        <ActivateContent />
      </Suspense>
      <Footer />
    </>
  );
}