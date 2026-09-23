// next.config.ts 
import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Required for Cloudflare deployment
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      // Tambahkan domain lain jika diperlukan
    ],
  },
};

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  disable: process.env.NODE_ENV === 'development',
});

export default withPWA(nextConfig);