import Link from 'next/link';
import { footerStatic } from '@/app/data/static';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className='bg-[#081e3f] text-white py-16 relative z-0 z-[999]'>

      <div className='max-w-7xl mx-auto px-6'>
        <div className='grid md:grid-cols-4 gap-8 mb-12'>
          <div className='space-y-4'>
            <div className='mb-6'>
              <Link href='/'>
                <Image
                  src='/images/logo.png'
                  alt='Logo'
                  width={180}
                  height={0}
                  style={{ height: 'auto' }}
                  unoptimized
                />
              </Link>{' '}
            </div>
            <p className='text-gray-400 leading-relaxed'>
              {footerStatic.description}
            </p>
          </div>
          {footerStatic.sections.map((section) => (
            <div key={section.title}>
              <h3 className='font-semibold mb-6 text-lg'>{section.title}</h3>
              <ul className='space-y-3 text-gray-400'>
                {section.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className='hover:text-white transition-colors'
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className='border-t border-gray-800 pt-8 text-center text-gray-400 space-y-2'>
          <p>
            © 2025{' '}
            <Link 
              href="https://www.rekber.com/" 
              className='font-bold hover:text-white transition-colors'
              target="_blank" 
              rel="noopener noreferrer"
            >
              REKBER.COM
            </Link>
            , ALL RIGHT RESERVED.
          </p>
          <p>
            PART OF{' '}
            <Link 
              href="https://rta.rekber.com/" 
              className='font-bold hover:text-white transition-colors'
              target="_blank" 
              rel="noopener noreferrer"
            >
              PT REKBER TRANSAKSI AMAN
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}