'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { API_URL } from '@/constants/api';
import NavBar from '@/app/components/slicings/navbar';
import Footer from '@/app/components/slicings/footer';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/forgot-password/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsEmailSent(true);
        toast.success('Link reset password telah dikirim ke email Anda');
      } else {
        setError(data.message || data.error || 'Gagal mengirim email reset password');
        toast.error(data.message || data.error || 'Gagal mengirim email reset password');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Terjadi kesalahan pada server');
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = () => {
    setIsEmailSent(false);
    setEmail('');
    setError('');
  };

  if (isEmailSent) {
    return (
      <>
        <NavBar />
        <div className="min-h-[70vh] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Terkirim!</h2>
              <p className="text-gray-600 mb-4">
                Kami telah mengirim link reset password ke <span className="font-medium">{email}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Periksa inbox email Anda dan klik link untuk reset password. 
                Link akan expire dalam 1 jam.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={handleResendEmail}
                  variant="outline" 
                  className="w-full"
                >
                  Kirim Ulang Email
                </Button>
                <Link href="/auth/login">
                  <Button variant="ghost" className="w-full">
                    Kembali ke Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-[70vh] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Lupa Password?</CardTitle>
            <CardDescription className="text-center">
              Masukkan email Anda dan kami akan mengirim link untuk reset password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  className="h-12"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Mengirim Email...</span>
                  </div>
                ) : (
                  'Kirim Link Reset Password'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                href="/auth/login" 
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Kembali ke Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}