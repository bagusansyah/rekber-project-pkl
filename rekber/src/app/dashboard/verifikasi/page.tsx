'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, XCircle, IdCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import { API_URL, getToken } from '@/constants/api';
import { CameraCaptureField } from './camera-capture-field';

type KycStatus = 'none' | 'pending' | 'approved' | 'rejected';

interface KycData {
  status: KycStatus;
  rejection_reason: string | null;
}

type FileField = 'ktpPhoto' | 'selfieWithKtp' | 'selfieVideo';

const FIELD_TO_API_NAME: Record<FileField, string> = {
  ktpPhoto: 'ktp_photo',
  selfieWithKtp: 'selfie_with_ktp',
  selfieVideo: 'selfie_video',
};

export default function VerificationForm() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [nik, setNik] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [files, setFiles] = useState<Record<FileField, File | null>>({
    ktpPhoto: null,
    selfieWithKtp: null,
    selfieVideo: null,
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${API_URL}/api/kyc/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.status && data.data) {
          setKyc({ status: data.data.status, rejection_reason: data.data.rejection_reason });
        } else {
          setKyc({ status: 'none', rejection_reason: null });
        }
      } catch (error) {
        console.error('Gagal mengambil status KYC:', error);
        setKyc({ status: 'none', rejection_reason: null });
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleFileChange = (field: FileField, file: File | null) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{16}$/.test(nik)) {
      toast.error('NIK harus 16 digit angka');
      return;
    }
    if (!files.ktpPhoto || !files.selfieWithKtp || !files.selfieVideo) {
      toast.error('Semua file wajib diunggah');
      return;
    }
    if (!acceptTerms) {
      toast.error('Anda harus menyetujui syarat dan ketentuan verifikasi identitas');
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('nik', nik);
      formData.append(FIELD_TO_API_NAME.ktpPhoto, files.ktpPhoto);
      formData.append(FIELD_TO_API_NAME.selfieWithKtp, files.selfieWithKtp);
      formData.append(FIELD_TO_API_NAME.selfieVideo, files.selfieVideo);

      const res = await fetch(`${API_URL}/api/kyc`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (data.status) {
        toast.success('Pengajuan verifikasi berhasil dikirim');
        setKyc({ status: 'pending', rejection_reason: null });
      } else {
        toast.error(data.error || 'Gagal mengirim pengajuan verifikasi');
      }
    } catch (error) {
      console.error('Gagal submit KYC:', error);
      toast.error('Terjadi kesalahan saat mengirim pengajuan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-slate-500 text-sm'>Memuat status verifikasi...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white'>
      <Toaster richColors position="top-center" />
      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {kyc?.status === 'approved' && (
          <Card className='mb-6 border-green-200 bg-green-50'>
            <CardContent className='p-6 flex items-center gap-3'>
              <CheckCircle2 className='w-6 h-6 text-green-600 flex-shrink-0' />
              <p className='text-green-800 font-medium'>Identitas Anda sudah terverifikasi.</p>
            </CardContent>
          </Card>
        )}

        {kyc?.status === 'pending' && (
          <Card className='mb-6 border-yellow-200 bg-yellow-50'>
            <CardContent className='p-6 flex items-center gap-3'>
              <Clock className='w-6 h-6 text-yellow-600 flex-shrink-0' />
              <p className='text-yellow-800 font-medium'>Pengajuan verifikasi Anda sedang diproses oleh admin.</p>
            </CardContent>
          </Card>
        )}

        {kyc?.status === 'rejected' && (
          <Card className='mb-6 border-red-200 bg-red-50'>
            <CardContent className='p-6 flex items-start gap-3'>
              <XCircle className='w-6 h-6 text-red-600 flex-shrink-0 mt-0.5' />
              <div>
                <p className='text-red-800 font-medium'>Pengajuan verifikasi sebelumnya ditolak.</p>
                {kyc.rejection_reason && (
                  <p className='text-red-700 text-sm mt-1'>Alasan: {kyc.rejection_reason}</p>
                )}
                <p className='text-red-700 text-sm mt-1'>Silakan ajukan ulang di bawah ini.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {(kyc?.status === 'none' || kyc?.status === 'rejected') && (
          <Card className='shadow-xl border-0 bg-white/70 backdrop-blur-sm'>
            <CardHeader className='pb-8'>
              <div className='flex items-center space-x-3 mb-4'>
                <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                  <IdCard className='w-5 h-5 text-blue-600' />
                </div>
                <CardTitle className='text-2xl font-bold text-slate-800'>Formulir Verifikasi KYC</CardTitle>
              </div>
              <CardDescription className='text-slate-600 text-base leading-relaxed'>
                Pastikan semua informasi dan foto yang Anda unggah akurat dan sesuai dengan dokumen resmi Anda.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-8'>
                <div className='space-y-3'>
                  <Label htmlFor='nik' className='text-sm font-semibold text-slate-700'>
                    NIK KTP <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='nik'
                    type='text'
                    placeholder='16 digit NIK pada KTP'
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    className='h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/80 max-w-md'
                    maxLength={16}
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  <CameraCaptureField
                    label='Foto KTP'
                    mode='photo'
                    guide='card'
                    hint='Pastikan e-KTP kamu dalam kotak'
                    facingMode='environment'
                    file={files.ktpPhoto}
                    onCapture={(file) => handleFileChange('ktpPhoto', file)}
                    stepIndex={1}
                  />
                  <CameraCaptureField
                    label='Foto Diri Memegang KTP'
                    mode='photo'
                    guide='face-and-card'
                    hint='Pastikan foto dan ktp kamu dalam kotak'
                    facingMode='user'
                    file={files.selfieWithKtp}
                    onCapture={(file) => handleFileChange('selfieWithKtp', file)}
                    stepIndex={2}
                  />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  <CameraCaptureField
                    label='Video Selfie Wajah'
                    mode='video'
                    guide='face'
                    hint='Pastikan wajah kamu dalam bingkai'
                    facingMode='user'
                    file={files.selfieVideo}
                    onCapture={(file) => handleFileChange('selfieVideo', file)}
                    stepIndex={3}
                  />
                </div>

                <div className='flex items-start space-x-2'>
                  <Checkbox
                    id='kyc-terms'
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    className='mt-1'
                  />
                  <label htmlFor='kyc-terms' className='text-sm text-slate-600'>
                    Saya telah membaca dan menyetujui{' '}
                    <Link
                      href='/syarat-dan-ketentuan-kyc'
                      target='_blank'
                      className='text-blue-600 hover:text-blue-500 font-medium'
                    >
                      Syarat & Ketentuan Verifikasi Identitas (KYC)
                    </Link>{' '}
                    serta menyatakan bahwa data dan dokumen yang saya unggah adalah asli dan benar.
                  </label>
                </div>

                <div className='flex justify-end pt-6'>
                  <Button
                    type='submit'
                    disabled={submitting || !acceptTerms}
                    className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-200'
                  >
                    {submitting ? 'Mengirim...' : 'Kirim Verifikasi'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
