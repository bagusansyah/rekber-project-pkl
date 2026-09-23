'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUser, FiLogOut, FiShield } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import LogoRekber from '@/app/components/atom/rekber';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; // pastikan sudah install js-cookie
import { useKycStatus } from '@/hooks/useKycStatus';

const KYC_STATUS_BADGE: Record<string, { label: string; className: string }> = {
  approved: { label: 'Terverifikasi', className: 'bg-green-50 text-green-700' },
  pending: { label: 'Diproses', className: 'bg-yellow-50 text-yellow-700' },
  rejected: { label: 'Ditolak', className: 'bg-red-50 text-red-700' },
  none: { label: 'Belum Verifikasi', className: 'bg-gray-100 text-gray-600' },
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { status: kycStatus } = useKycStatus();

  // Check authentication status from localStorage
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('email');
        const name = localStorage.getItem('name');
        
        if (token && email) {
          setIsAuthenticated(true);
          // Gunakan name langsung dari localStorage, fallback ke email jika tidak ada
          setUserName(name || email.split('@')[0]);
        } else {
          setIsAuthenticated(false);
          setUserName('');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // Listen for storage changes (for cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'email' || e.key === 'name') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
 

  // Logout function
  const handleLogout = () => {
    try {
      // Clear all auth-related data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('name');
      Cookies.remove('token');

      // Update state
      setIsAuthenticated(false);
      setUserName('');
      
      // Close mobile menu if open
      setOpen(false);
      
      // Redirect to home page
      router.push('/');
      
      // Optional: Show success message
      // toast.success('Logout berhasil');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <nav className='bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 sticky top-0 z-99999'>
        <div className='max-w-7xl mx-auto flex items-center justify-between'>
          <LogoRekber />
          <div className='text-gray-500'>
            <div className='w-20 h-8 bg-gray-200 animate-pulse rounded'></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className='bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 sticky top-0 z-99999'>
      <div className='max-w-7xl mx-auto flex items-center justify-between'>
        <div className="flex items-center justify-between w-full">
          {/* Logo kiri */}
          <div className="flex items-center">
            <LogoRekber />
          </div>

          {/* Menu kanan (hanya tampil di md ke atas) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/fee"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Fee
            </Link>
            <Link
              href="/payment-link"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Payment Link
            </Link>
            <Link
              href="/tentang-kami"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Tentang
            </Link>
            <Link
              href="/hubungi-kami"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Kontak
            </Link>
            <Link
              href="/blog"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Blog
            </Link>
          </div>
        </div>

        {/* Desktop Auth Buttons */}
        <div className='hidden md:flex items-center space-x-4 ml-[20px]'>
          {isAuthenticated ? (
            // User sudah login - tampilkan Dashboard dan Logout
            <div className='flex items-center space-x-4'>
             <Link href='/dashboard/profile'>
                <div className='flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer'>
                  <FiUser className='w-4 h-4' />
                  <span className='font-medium'>{userName}</span>
                </div>
              </Link>
              <Link href='/dashboard/transactions'>
                <Button className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl cursor-pointer transition-all'>
                  My Transaction
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant='outline'
                className='text-gray-700 hover:text-red-600 border-gray-300 hover:border-red-300 cursor-pointer font-medium flex items-center space-x-2'
              >
                <FiLogOut className='w-4 h-4' />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            // User belum login - tampilkan Register dan Login
            <>
              <Button
                asChild
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-6 py-2 rounded-full text-sm font-medium bg-transparent"
              >
                <Link href='/auth/register'>
                  Register
                </Link>
              </Button>
              <Link href='/auth/login'>
                <Button className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl cursor-pointer transition-all'>
                  Login
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className='flex md:hidden'>
          <button
            type='button'
            className='inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-200 focus:outline-none'
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <FiX className='w-7 h-7' />
            ) : (
              <FiMenu className='w-7 h-7' />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className='md:hidden absolute left-0 right-0 top-full z-50 bg-white rounded-xl shadow-lg px-6 py-4 space-y-2 pb-[22px] rounded-t-none'
          >
            <Link
              href='/'
              className='block py-2 text-gray-800 hover:text-blue-600 transition-colors'
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/fee"
              className='block py-2 text-gray-800 hover:text-blue-600 transition-colors'
              onClick={() => setOpen(false)}
            >
              Fee
            </Link>
            <Link
              href="/payment-link"
              className='block py-2 text-gray-800 hover:text-blue-600 transition-colors'
              onClick={() => setOpen(false)}
            >
              Payment Link
            </Link>
            <Link
              href='/tentang-kami'
              className='block py-2 text-gray-800 hover:text-blue-600 transition-colors'
              onClick={() => setOpen(false)}
            >
              Tentang
            </Link>
            <Link
              href='/hubungi-kami'
              className='block py-2 text-gray-800 hover:text-blue-600 transition-colors'
              onClick={() => setOpen(false)}
            >
              Kontak
            </Link>
            <Link
              href='/blog'
              className='block py-2 text-gray-800 hover:text-blue-600 transition-colors'
              onClick={() => setOpen(false)}
            >
              Blog
            </Link>
            {isAuthenticated ? (
              // Mobile menu untuk user yang sudah login
              <>
              <Link href='/dashboard/profile'>
                <div className='py-2 text-gray-600 text-sm border-t border-gray-200'>
                  <div className='flex items-center space-x-2'>
                    <FiUser className='w-4 h-4' />
                    <span>{userName}</span>
                  </div>
                </div></Link>
                <Link
                  href='/dashboard/verifikasi'
                  className='block py-2 text-gray-800 hover:text-blue-600 transition-colors'
                  onClick={() => setOpen(false)}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <FiShield className='w-4 h-4' />
                      <span>Verifikasi KYC</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${KYC_STATUS_BADGE[kycStatus].className}`}>
                      {KYC_STATUS_BADGE[kycStatus].label}
                    </span>
                  </div>
                </Link>
                <Link
                  href='/dashboard/transactions'
                  className='block py-2 text-gray-800 hover:text-blue-600 transition-colors font-medium'
                  onClick={() => setOpen(false)}
                >
                  My Transaction
                </Link>
                <button
                  onClick={handleLogout}
                  className='block w-full py-2 text-red-600 hover:text-red-700 transition-colors'
                >
                  <div className='flex items-center space-x-2'>
                    <FiLogOut className='w-4 h-4' />
                    <span>Logout</span>
                  </div>
                </button>
              </>
            ) : (
              <>
                <div className="flex w-full gap-4 mt-[18px]">
                  <Link href="/auth/login" className="w-1/2">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium shadow-lg hover:shadow-xl transition-all"
                      onClick={() => setOpen(false)}
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="w-1/2">
                    <Button
                      variant="outline"
                      className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-6 py-2 rounded-md text-sm font-medium"
                      onClick={() => setOpen(false)}
                    >
                      Register
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}