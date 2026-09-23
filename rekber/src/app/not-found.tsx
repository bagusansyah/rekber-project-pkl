'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

const notFoundStatic = {
  title: 'Segera Hadir',
  description: [
    { type: 'highlight', text: 'Rekber.com' },
    ' masih dalam proses pengembangan, silakan kembali lagi nanti.',
  ],
  button: {
    label: 'Kembali ke Beranda',
    href: '/',
  },
};
export default function NotFound() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4'>
      <AlertTriangle className='text-yellow-500 mb-6' size={48} />
      <h1 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2 text-center'>
        {notFoundStatic.title}
      </h1>
      <p className='text-gray-500 mb-6 text-center text-sm sm:text-base max-w-md'>
        {notFoundStatic.description.map((item, idx) =>
          typeof item === 'string' ? (
            item
          ) : (
            <span key={idx} className='font-semibold text-blue-500'>
              {item.text}
            </span>
          )
        )}
      </p>
      <Link
        href={notFoundStatic.button.href}
        className='inline-block px-5 py-2 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-100 text-sm sm:text-base'
        style={{ backgroundColor: '#f0f6ff' }}
      >
        {notFoundStatic.button.label}
      </Link>
    </div>
  );
}
