declare module 'next-pwa' {
    import type { NextConfig } from 'next';
  
    interface PWAOptions {
      dest: string;
      disable?: boolean;
      register?: boolean;
      skipWaiting?: boolean;
      buildExcludes?: string[];
      runtimeCaching?: any[];
      // tambahkan opsi lain sesuai kebutuhan
    }
  
    export default function withPWA(options: PWAOptions): (nextConfig: NextConfig) => NextConfig;
  }