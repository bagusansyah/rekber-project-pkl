'use client';

import type React from 'react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  UserPlus,
  RefreshCw,
  Mail,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import NavBar from '@/app/components/slicings/navbar';
import Footer from '@/app/components/slicings/footer';
import { API_URL } from '@/constants/api';
import Cookies from 'js-cookie';
import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from '@react-oauth/google';

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

const COUNTRY_CODES = [
  { code: '62', label: 'ID (+62)' },
  { code: '60', label: 'MY (+60)' },
  { code: '65', label: 'SG (+65)' },
  { code: '1', label: 'US (+1)' },
];

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('62');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [nameError, setNameError] = useState('');

  const NAME_MAX_LENGTH = 100;
  // Hanya izinkan huruf (termasuk huruf beraksen), spasi, apostrof, titik, dan tanda hubung
  const NAME_ALLOWED_PATTERN = /^[\p{L}\s'.-]*$/u;
  
  // Enhanced Captcha states
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaOperation, setCaptchaOperation] = useState('+');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [captchaRotation, setCaptchaRotation] = useState(0);
  const [captchaColors, setCaptchaColors] = useState(['#000', '#333', '#666']);
  const [captchaBackgroundPattern, setCaptchaBackgroundPattern] = useState('');
  
  // Hydration state to prevent SSR mismatch
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Generate enhanced captcha with visual distortion
  const generateCaptcha = () => {
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 15) + 1;
        num2 = Math.floor(Math.random() * 15) + 1;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 15) + 10;
        num2 = Math.floor(Math.random() * 8) + 1;
        break;
      case '×':
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * 9) + 1;
        break;
      default:
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
    }
    
    setCaptchaNum1(num1);
    setCaptchaNum2(num2);
    setCaptchaOperation(operation);
    setCaptchaAnswer('');
    setCaptchaError('');
    
    // Random visual effects
    setCaptchaRotation(Math.floor(Math.random() * 21) - 10); // -10 to 10 degrees
    
    // Random colors for text
    const colors = [
      ['rgb(178 183 191)']
    ];
    setCaptchaColors(colors[0]);
    
    // Random background pattern
const patterns = [
    'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(20,184,166,0.1) 2px, rgba(20,184,166,0.1) 4px)',
    'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(14,165,233,0.1) 3px, rgba(14,165,233,0.1) 6px)',
    'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(124,58,237,0.1) 2px, rgba(124,58,237,0.1) 4px)',
    'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(5,150,105,0.1) 1px, rgba(5,150,105,0.1) 3px)',
  ];
    setCaptchaBackgroundPattern(patterns[Math.floor(Math.random() * patterns.length)]);
  };

  // Initialize captcha only after component is mounted (client-side)
  useEffect(() => {
    if (isMounted) {
      generateCaptcha();
    }
  }, [isMounted]);

  // Validate captcha with operation support
  const validateCaptcha = () => {
    const userAnswer = parseInt(captchaAnswer);
    let correctAnswer;
    
    switch (captchaOperation) {
      case '+':
        correctAnswer = captchaNum1 + captchaNum2;
        break;
      case '-':
        correctAnswer = captchaNum1 - captchaNum2;
        break;
      case '×':
        correctAnswer = captchaNum1 * captchaNum2;
        break;
      default:
        correctAnswer = captchaNum1 + captchaNum2;
    }
    
    if (isNaN(userAnswer) || userAnswer !== correctAnswer) {
      setCaptchaError('Jawaban captcha salah');
      generateCaptcha();
      return false;
    }
    
    setCaptchaError('');
    return true;
  };

  // Phone validation function
  // Validasi kini mengecek gabungan kode negara dan nomor
  const validatePhone = (code: string, number: string) => {
    const fullNumber = code + number;
    if (fullNumber.length < 10) return { isValid: false, message: 'Nomor WhatsApp minimal 10 digit' };
    if (fullNumber.length > 15) return { isValid: false, message: 'Nomor WhatsApp maksimal 15 digit' };
    return { isValid: true, message: '' };
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Buang karakter selain huruf/spasi/apostrof/titik/tanda hubung agar tidak bisa dipakai untuk HTML/script injection
    const sanitized = rawValue.replace(/[^\p{L}\s'.-]/gu, '').slice(0, NAME_MAX_LENGTH);

    setName(sanitized);
    setNameError(
      !NAME_ALLOWED_PATTERN.test(rawValue) || rawValue.length > NAME_MAX_LENGTH
        ? `Nama hanya boleh berisi huruf, spasi, titik, tanda hubung, dan apostrof (maks. ${NAME_MAX_LENGTH} karakter)`
        : ''
    );
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Buang semua karakter non-angka

    // Otomatis hapus angka '0' di depan jika pengguna kebiasaan mengetik 0812...
    if (value.startsWith('0')) {
      value = value.substring(1);
    }

    setPhoneNumber(value);

    const validation = validatePhone(countryCode, value);
    if (!validation.isValid && value.length > 2) {
      setPhoneError(validation.message);
    } else {
      setPhoneError('');
    }
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setCountryCode(newCode);
    
    // Evaluasi ulang validasi saat kode negara berubah
    const validation = validatePhone(newCode, phoneNumber);
    if (!validation.isValid && phoneNumber.length > 2) {
      setPhoneError(validation.message);
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
 
    if (password !== confirmPassword) {
      setErrorMessage('Password tidak cocok');
      setIsLoading(false);
      return;
    }

    // Validate phone before submit
    const phoneValidation = validatePhone(countryCode, phoneNumber);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.message);
      setIsLoading(false);
      return;
    }

    // Ubah baris payload fetch ini:
    const fullPhoneNumber = '+' + countryCode + phoneNumber;

    // Validate captcha before submit
    if (!validateCaptcha()) {
      setIsLoading(false);
      return;
    }
    
    try {
       const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone: fullPhoneNumber }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gagal mendaftar');

      // Tampilkan pesan sukses
      setSuccessMessage('Registrasi berhasil! Silakan periksa email Anda untuk aktivasi akun.');
      
      // Optional: redirect setelah delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 6000);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Terjadi kesalahan saat mendaftar');
      }
      // Generate new captcha on error
      generateCaptcha();
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
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login Google gagal');

      persistSession(data);
      router.push('/dashboard/transactions');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan saat login Google');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything until component is mounted to prevent hydration issues
  if (!isMounted) {
    return (
      <>
        <NavBar />
        <div className='flex min-h-[80vh] items-center justify-center px-4 py-12'>
          <Card className='w-full max-w-md'>
            <CardHeader className='text-center'>
              <CardTitle className='text-2xl font-bold'>Registrasi</CardTitle>
              <CardDescription>Memuat formulir registrasi...</CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className='flex min-h-[80vh] items-center justify-center px-4 py-12'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <CardTitle className='text-2xl font-bold'>Registrasi</CardTitle>
            <CardDescription>
              Mulai transaksi aman Anda hari ini dan bergabung dengan ribuan
              pengguna lainnya
            </CardDescription>
          </CardHeader>
          <CardContent>
            {successMessage && (
              <div className="mb-4 rounded-md bg-green-100 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mb-4 rounded-md bg-red-100 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <>
                <div className='flex justify-center mb-6'>
                  <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setErrorMessage('Login Google gagal, silakan coba lagi')}
                      text='signup_with'
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
                  Daftar dengan Email
                </Button>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className='space-y-5'>
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
                  htmlFor='name'
                  className='text-sm font-medium text-gray-700'
                >
                  Nama
                </Label>
                <Input
                  id='name'
                  type='text'
                  placeholder='John Doe'
                  value={name}
                  onChange={handleNameChange}
                  required
                  maxLength={NAME_MAX_LENGTH}
                  autoComplete="name"
                  className={`mt-1 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                    nameError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {nameError && (
                  <p className="mt-1 text-sm text-red-600">{nameError}</p>
                )}
              </div>
              <div>
                <Label
                  htmlFor='email'
                  className='text-sm font-medium text-gray-700'
                >
                  Email Address
                </Label>
                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='john.doe@example.com'
                  required
                  autoComplete="email"
                  className='mt-1 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                />
              </div>
              <div>
                <Label
                  htmlFor='phone'
                  className='text-sm font-medium text-gray-700 block mb-1'
                >
                  Nomor WhatsApp
                  <span className="ml-1 text-xs text-gray-400">(Tanpa angka 0 di depan)</span>
                </Label>
                
                {/* KOREKSI: Menyamakan dengan komponen Input Shadcn (h-11, rounded-md, border standar) */}
                <div 
                  className={`mt-1 flex items-center w-full h-11 bg-white border border-gray-300 rounded-md overflow-hidden transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 ${
                    phoneError ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500' : ''
                  }`}
                >
                  {/* Dropdown menyatu dengan warna background putih tanpa border kaku */}
                  <select
                    value={countryCode}
                    onChange={handleCountryCodeChange}
                    className="h-full pl-3 pr-1 bg-transparent text-sm font-medium text-gray-700 border-none focus:ring-0 outline-none cursor-pointer"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>

                  {/* Garis pemisah tipis dan elegan */}
                  <div className="h-5 w-[1px] bg-gray-300 mx-1"></div>

                  {/* Input HTML murni yang menyatu sempurna */}
                  <input
                    id='phone'
                    type='tel'
                    inputMode='numeric'
                    placeholder='8123456789'
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    required
                    autoComplete="tel"
                    className="flex-1 h-full px-2 text-base text-gray-900 border-none bg-transparent focus:ring-0 outline-none w-full placeholder:text-gray-400"
                  />
                </div>

                {phoneError && (
                  <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Contoh jika memilih ID (+62): 8123456789
                </p>
              </div>
              <div>
                <Label
                  htmlFor='password'
                  className='text-sm font-medium text-gray-700'
                >
                  Password
                </Label>
                <div className='relative mt-1'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='••••••••'
                    required
                    autoComplete="new-password"
                    className='h-11 border-gray-300 pr-10 focus:border-blue-500 focus:ring-blue-500'
                  />
                  <button
                    type='button'
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <Label
                  htmlFor='confirmPassword'
                  className='text-sm font-medium text-gray-700'
                >
                  Konfirmasi Password
                </Label>
                <div className='relative mt-1'>
                  <Input
                    id='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='••••••••'
                    required
                    autoComplete="new-password"
                    className='h-11 border-gray-300 pr-10 focus:border-blue-500 focus:ring-blue-500'
                  />
                  <button
                    type='button'
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Enhanced Anti-Scraping Captcha Section */}
              <div>
                <Label
                  htmlFor='captcha'
                  className='text-sm font-medium text-gray-700 block mb-2'
                >
                  Verifikasi Keamanan (Captcha)
                </Label>
                <div className="flex items-center space-x-3">
                  {captchaNum1 && captchaNum2 ? (
                    <div 
                      className="relative flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 px-6 py-4 rounded-lg border-2 border-gray-300 shadow-inner overflow-hidden min-w-[140px] h-[60px]"
                      style={{
                        background: `${captchaBackgroundPattern}, linear-gradient(135deg, #f3f4f6, #e5e7eb)`,
                      }}
                    >
                      {/* Noise overlay */}
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='17' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='17' cy='37' r='1'/%3E%3Ccircle cx='37' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                      />
                      
                      {/* Distorted captcha text */}
                      <div 
                        className="relative z-10 font-mono font-bold text-xl select-none flex items-center space-x-1"
                        style={{
                          transform: `rotate(${captchaRotation}deg) skewX(${Math.random() * 6 - 3}deg)`,
                          filter: `contrast(${1.2 + Math.random() * 0.3})`,
                        }}
                      >
                        <span 
                          className="inline-block"
                          style={{ 
                            color: captchaColors[0],
                            textShadow: `1px 1px 2px rgba(0,0,0,0.3), -1px -1px 2px rgba(255,255,255,0.5)`,
                            transform: `rotate(${Math.random() * 10 - 5}deg) scale(${0.9 + Math.random() * 0.2})`,
                          }}
                        >
                          {captchaNum1}
                        </span>
                        <span 
                          className="inline-block mx-1"
                          style={{ 
                            color: captchaColors[0],
                            textShadow: `1px 1px 2px rgba(0,0,0,0.3)`,
                            transform: `rotate(${Math.random() * 10 - 5}deg) scale(${0.9 + Math.random() * 0.2})`,
                          }}
                        >
                          {captchaOperation}
                        </span>
                        <span 
                          className="inline-block"
                          style={{ 
                            color: captchaColors[0],
                            textShadow: `1px 1px 2px rgba(0,0,0,0.3), -1px -1px 2px rgba(255,255,255,0.5)`,
                            transform: `rotate(${Math.random() * 10 - 5}deg) scale(${0.9 + Math.random() * 0.2})`,
                          }}
                        >
                          {captchaNum2}
                        </span>
                        <span 
                          className="inline-block ml-2"
                          style={{ 
                            color: captchaColors[0],
                            textShadow: `1px 1px 2px rgba(0,0,0,0.3)`,
                          }}
                        >
                          = ?
                        </span>
                      </div>
                      
                      {/* Random lines for additional noise */}
                      <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full z[999]" style={{ opacity: 1 }}>
                          <line 
                            x1={Math.random() * 100 + '%'} 
                            y1="0%" 
                            x2={Math.random() * 100 + '%'} 
                            y2="100%" 
                            stroke="#666" 
                            strokeWidth="1"
                          />
                          <line 
                            x1="0%" 
                            y1={Math.random() * 100 + '%'} 
                            x2="100%" 
                            y2={Math.random() * 100 + '%'} 
                            stroke="#999" 
                            strokeWidth="1"
                          />
                          <line 
                            x1="0%" 
                            y1={Math.random() * 100 + '%'} 
                            x2="100%" 
                            y2={Math.random() * 100 + '%'} 
                            stroke="#999" 
                            strokeWidth="1"
                          />
                          <line 
                            x1="0%" 
                            y1={Math.random() * 100 + '%'} 
                            x2="100%" 
                            y2={Math.random() * 100 + '%'} 
                            stroke="#999" 
                            strokeWidth="1"
                          />
                          <line 
                            x1="0%" 
                            y1={Math.random() * 100 + '%'} 
                            x2="100%" 
                            y2={Math.random() * 100 + '%'} 
                            stroke="#999" 
                            strokeWidth="1"
                          /> 
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center bg-gray-100 px-6 py-4 rounded-lg border-2 border-gray-300 min-w-[140px] h-[60px]">
                      <span className="text-gray-500">Memuat...</span>
                    </div>
                  )}
                  
                  <Input
                    id='captcha'
                    type='number'
                    placeholder='Hasil'
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    required
                    autoComplete="off"
                    className={`w-20 h-11 text-center border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      captchaError ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateCaptcha}
                    className="h-11 px-3 hover:bg-gray-50"
                    title="Muat Ulang Captcha"
                  >
                    <RefreshCw size={16} />
                  </Button>
                </div>
                {captchaError && (
                  <p className="mt-1 text-sm text-red-600">{captchaError}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Masukkan hasil perhitungan matematika di atas
                </p>
              </div>

              <div className='flex items-start space-x-2'>
                <Checkbox
                  id='terms'
                  checked={acceptTerms}
                  onCheckedChange={(checked) =>
                    setAcceptTerms(checked as boolean)
                  }
                  className='mt-1'
                />
                <label htmlFor='terms' className='text-sm text-gray-600'>
                  Saya setuju dengan <Link href='/syarat-dan-ketentuan' className='text-blue-600 hover:text-blue-500'>
                      Syarat & Ketentuan 
                  </Link> 
                  {' '} dan{' '} 
                   <Link href='/kebijakan-privasi' className='text-blue-600 hover:text-blue-500'>
                    Kebijakan Privasi
                  </Link>{' '} 
                  pada Platform Rekber.com
                </label>
              </div>
 
              <Button
                type='submit'
                className='h-12 w-full bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
                disabled={isLoading || !acceptTerms || nameError !== '' || phoneError !== '' || captchaError !== ''}
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
                    Membuat Akun...
                  </span>
                ) : (
                  <span className='flex items-center justify-center'>
                    <UserPlus size={20} className='mr-2' />
                    Buat Akun Sekarang
                  </span>
                )}
              </Button>
            </form>
            )}

            <p className='text-center text-sm text-gray-600 mt-6'>
              Sudah punya akun?{' '}
              <a
                href='/auth/login'
                className='font-medium text-blue-600 hover:text-blue-500'
              >
                Masuk di sini
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}