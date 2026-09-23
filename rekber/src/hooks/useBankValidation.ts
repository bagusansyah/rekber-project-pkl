'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/constants/api';

export const useBankValidation = () => {
  const [isLoading, setIsLoading] = useState(true);
  // Default ke "belum lengkap" (fail-closed) sampai terbukti lengkap dari API.
  const [missingPhone, setMissingPhone] = useState(true);
  const [missingBank, setMissingBank] = useState(true);

  useEffect(() => {
    const checkProfileData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/profile-detail`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          const profile = data.profile;
          const detail = data.detail;

          setMissingPhone(!profile?.phone);
          setMissingBank(!(detail?.bank && detail?.no_rek && detail?.nama_rekening));
        }
      } catch (error) {
        console.error('Gagal memvalidasi profil', error);
        setMissingPhone(true);
        setMissingBank(true);
      } finally {
        // Bebaskan state loading HANYA setelah seluruh proses selesai
        setIsLoading(false);
      }
    };

    checkProfileData();
  }, []);

  return {
    isLoading,
    // Nama lama dipertahankan untuk kompatibilitas: kini berarti "profil lengkap" (No HP & Rekening).
    isBankValid: !missingPhone && !missingBank,
    missingPhone,
    missingBank,
  };
};
