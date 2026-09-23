'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/constants/api';

export type KycStatus = 'none' | 'pending' | 'approved' | 'rejected';

export function useKycStatus() {
  const [status, setStatus] = useState<KycStatus>('none');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/kyc/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setStatus(data.data?.status || 'none');
        }
      } catch (error) {
        console.error('Gagal mengambil status KYC:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  return { status, isLoading };
}
