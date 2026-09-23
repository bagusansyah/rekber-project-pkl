/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: 'https://api.rekber.com',
  },
  images: {
    // Cloudflare Pages tidak mendukung image optimizer bawaan Next.js
    unoptimized: true,
  },
};

module.exports = nextConfig;
