'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Mail, CheckCircle } from 'lucide-react';
import Alert from '@mui/material/Alert';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export default function ResetPasswordModal({ isOpen, onClose, userEmail = '' }: ResetPasswordModalProps) {
  const [email, setEmail] = useState(userEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format email tidak valid');
      setIsLoading(false);
      return;
    }

    try {
      // Simulasi API call untuk reset password
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulasi success
      setIsSuccess(true);
      
      // Auto close setelah 3 detik
      setTimeout(() => {
        handleClose();
      }, 3000);
      
    } catch {
      setError('Gagal mengirim email reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setIsSuccess(false);
    setError('');
    setIsLoading(false);
    onClose();
  };

  React.useEffect(() => {
    setEmail(userEmail);
  }, [userEmail]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className='bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative'
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors'
              >
                <X className='w-5 h-5' />
              </button>

              {/* Content */}
              <div className='space-y-6'>
                <div className='text-center'>
                  <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <Mail className='w-8 h-8 text-blue-600' />
                  </div>
                  <h2 className='text-xl font-bold text-gray-900 mb-2'>
                    Reset Password
                  </h2>
                  <p className='text-gray-600 text-sm'>
                    Masukkan email Anda untuk menerima link reset password
                  </p>
                </div>

                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='text-center space-y-4'
                  >
                    <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
                      <CheckCircle className='w-8 h-8 text-green-600' />
                    </div>
                    <Alert severity="success" className='text-left'>
                      Email reset password telah dikirim ke <strong>{email}</strong>. 
                      Silakan cek inbox Anda.
                    </Alert>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className='space-y-4'>
                    {error && (
                      <Alert severity="error" className='mb-4'>
                        {error}
                      </Alert>
                    )}

                    <div className='space-y-2'>
                      <Label htmlFor='reset-email' className='text-sm font-medium text-gray-700'>
                        Email
                      </Label>
                      <Input
                        id='reset-email'
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Masukkan email Anda'
                        required
                        className='h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        disabled={isLoading}
                      />
                    </div>

                    <div className='flex space-x-3 pt-4'>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={handleClose}
                        className='flex-1 h-12'
                        disabled={isLoading}
                      >
                        Batal
                      </Button>
                      <Button
                        type='submit'
                        disabled={isLoading || !email.trim()}
                        className='flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white'
                      >
                        {isLoading ? (
                          <span className='flex items-center justify-center'>
                            <svg
                              className='mr-2 h-4 w-4 animate-spin'
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
                            Mengirim...
                          </span>
                        ) : (
                          'Kirim Link'
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}