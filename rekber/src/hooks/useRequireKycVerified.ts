'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKycStatus } from './useKycStatus';

// Gate for dashboard pages that should only be usable by a KYC-verified
// seller (Payment Link, Link Produk) — redirects to the verification page
// otherwise, so an unverified user can't publish a link buyers might pay
// into before the seller's identity is confirmed.
export function useRequireKycVerified() {
  const { status, isLoading } = useKycStatus();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && status !== 'approved') {
      router.replace('/dashboard/verifikasi?required=payment-link');
    }
  }, [isLoading, status, router]);

  return { ready: !isLoading && status === 'approved' };
}
