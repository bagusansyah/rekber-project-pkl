'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';
import { API_URL } from '@/constants/api';
import NavBar from '@/app/components/slicings/navbar';
import Footer from '@/app/components/slicings/footer';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [error, setError] = useState(''); 
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Check password strength
  useEffect(() => {
    setPasswordStrength({
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [password]);

  // Verify reset token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast.error('Link reset password tidak valid');
        setTimeout(() => {
          router.push('/auth/forgot-password');
        }, 2000);
        return;
      }

      try {
        // Menggunakan GET request dengan token di URL path
        const response = await fetch(`${API_URL}/forgot-password/verify/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok && data.status) {
          setIsValidToken(true); 
          toast.success('Token valid, silakan masukkan password baru');
        } else {
          const errorMessage = data.message || 'Token tidak valid atau sudah expired';
          toast.error(errorMessage);
          setTimeout(() => {
            router.push('/auth/forgot-password');
          }, 2000);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        toast.error('Terjadi kesalahan saat memverifikasi token');
        setTimeout(() => {
          router.push('/auth/forgot-password');
        }, 2000);
      } finally {
        setIsCheckingToken(false);
      }
    };

    verifyToken();
  }, [token, router]);

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordStrong) {
      const errorMsg = 'Password harus memenuhi semua kriteria keamanan';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!passwordsMatch) {
      const errorMsg = 'Konfirmasi password tidak sesuai';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/forgot-password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok && data.status) {
        toast.success('Password berhasil direset! Silakan login dengan password baru');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        const errorMessage = data.message || 'Gagal reset password';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = 'Terjadi kesalahan pada server';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Memverifikasi token...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Token Tidak Valid</h2>
            <p className="text-gray-600 mb-4">
              Link reset password tidak valid atau sudah expired.
            </p>
            <Link href="/auth/forgot-password">
              <Button className="w-full">
                Kirim Ulang Reset Password
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle> 
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
            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">Password Baru</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Kriteria Password:</div>
                <div className="space-y-1">
                  {[
                    { key: 'minLength', label: 'Minimal 8 karakter' },
                    { key: 'hasUpper', label: 'Huruf kapital (A-Z)' },
                    { key: 'hasLower', label: 'Huruf kecil (a-z)' },
                    { key: 'hasNumber', label: 'Angka (0-9)' },
                    { key: 'hasSpecial', label: 'Karakter khusus (!@#$%^&*)' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2 text-xs">
                      {passwordStrength[key as keyof typeof passwordStrength] ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span className={passwordStrength[key as keyof typeof passwordStrength] ? 'text-green-600' : 'text-red-600'}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password baru"
                  className="pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <div className="flex items-center space-x-1 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  <span>Password tidak sesuai</span>
                </div>
              )}
              {confirmPassword && passwordsMatch && (
                <div className="flex items-center space-x-1 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>Password sesuai</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={isLoading || !isPasswordStrong || !passwordsMatch}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Mereset Password...</span>
                </div>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link 
              href="/auth/login" 
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Kembali ke Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <NavBar />
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Memuat...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
      {/* Toast Container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            border: '1px solid #e5e7eb',
            color: '#374151',
          },
          className: 'my-toast',
        }}
      />
      <Footer />
    </>
  );
}