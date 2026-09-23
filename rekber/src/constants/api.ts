// export const API_URL = 'https://api.rekber.com';
// Mengutamakan .env lokal, jika tidak ada, baru fallback ke server production
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rekber.com';
// Domain publik situs, dipakai untuk canonical URL, OG tags, dan share link.
// Fallback WAJIB ke domain production, jangan localhost, agar share link tidak salah di production.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rekber.com';
export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
}