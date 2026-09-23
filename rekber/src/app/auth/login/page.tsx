'use client';

import type React from 'react';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Zap,
  Mail,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Alert from '@mui/material/Alert';
import { API_URL } from '@/constants/api';
import Cookies from 'js-cookie';
import NavBar from '@/app/components/slicings/navbar';
import Footer from '@/app/components/slicings/footer';
import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from '@react-oauth/google';

import Link from "next/link"

interface AuthSuccessData {
  id: string;
  token: string;
  email: string;
  name: string;
}

function persistSession(data: AuthSuccessData) {
  localStorage.setItem('user_id', data.id);
  localStorage.setItem('token', data.token);
  localStorage.setItem('email', data.email);
  localStorage.setItem('name', data.name);
  Cookies.set('token', data.token, { expires: 5 });
}
export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/dashboard/transactions';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  setIsLoading(true);

  try {
    const response =  await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Login Gagal');

    persistSession(data);

    // Reset form & redirect
    setEmail('');
    setPassword('');
    router.push(nextPath);
  } catch (err: unknown) {
    if (err instanceof Error) {
      setErrorMessage(err.message);
    } else {
      setErrorMessage('Terjadi kesalahan saat login');
    }
  } finally {
    setIsLoading(false);
  }
};

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setErrorMessage('Login Google gagal, silakan coba lagi');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login Google gagal');

      persistSession(data);
      router.push(nextPath);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan saat login Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className='flex min-h-[80vh] items-center justify-center px-4 py-12'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <CardTitle className='text-2xl font-bold'>Login</CardTitle>
            <CardDescription>
              Masuk ke akun Anda untuk transaksi dengan aman
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert severity='error' className='mb-4'>
                {errorMessage}
              </Alert>
            )}

            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <>
                <div className='flex justify-center mb-6'>
                  <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setErrorMessage('Login Google gagal, silakan coba lagi')}
                      text='signin_with'
                      width='320'
                    />
                  </GoogleOAuthProvider>
                </div>

                <div className='mb-6'>
                  <div className='relative'>
                    <div className='absolute inset-0 flex items-center'>
                      <div className='w-full border-t border-gray-300' />
                    </div>
                    <div className='relative flex justify-center text-sm'>
                      <span className='bg-white px-2 text-gray-500'>Atau</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!showEmailForm ? (
              <div className='flex justify-center'>
                <Button
                  type='button'
                  variant='outline'
                  className='h-10 w-[320px]'
                  onClick={() => setShowEmailForm(true)}
                >
                  <Mail size={18} className='mr-2' />
                  Masuk dengan Email
                </Button>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className='space-y-6'>
              <button
                type='button'
                onClick={() => setShowEmailForm(false)}
                className='flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700'
              >
                <ArrowLeft size={14} />
                Kembali
              </button>
              <div>
                <Label
                  htmlFor='email'
                  className='text-sm font-medium text-gray-700'
                >
                  Email
                </Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='Masukkan email'
                  className='mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete='email'
                  required
                />
              </div>
              <div>
                <div className='flex items-center justify-between'>
                  <Label
                    htmlFor='password'
                    className='text-sm font-medium text-gray-700'
                  >
                    Password
                  </Label>
                  <Link
                    href='/auth/forgot-password'
                    className='text-sm text-blue-600 hover:text-blue-500 underline'
                  >
                    Lupa password?
                  </Link>
                </div>
                <div className='relative mt-1'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='••••••••'
                    className='h-12 border-gray-300 pr-10 focus:border-blue-500 focus:ring-blue-500'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete='current-password'
                    required
                  />
                  <button
                    type='button'
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    disabled={isLoading}
                    aria-label={
                      showPassword
                        ? 'Sembunyikan password'
                        : 'Tampilkan password'
                    }
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className='flex items-center'>
                <input
                  id='remember-me'
                  name='remember-me'
                  type='checkbox'
                  className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  disabled={isLoading}
                />
                <label
                  htmlFor='remember-me'
                  className='ml-2 block text-sm text-gray-700'
                >
                  Ingat saya
                </label>
              </div>
              <Button
                type='submit'
                className='h-12 w-full bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className='flex items-center justify-center'>
                    <svg
                      className='mr-2 h-5 w-5 animate-spin'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                        fill='none'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  <span className='flex items-center justify-center'>
                    <Zap size={20} className='mr-2' />
                    Masuk Sekarang
                  </span>
                )}
              </Button>
            </form>
            )}

            <p className='text-center text-sm text-gray-600 mt-6'>
              Belum punya akun?{' '}
              <a
                href='/auth/register'
                className='font-medium text-blue-600 hover:text-blue-500'
              >
                Daftar sekarang
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
