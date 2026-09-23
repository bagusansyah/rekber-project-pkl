import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface RekberdsProps {
  className?: string;
}

const Rekberds: React.FC<RekberdsProps> = ({ className }) => {
  return (
    <div className={`flex items-center space-x-2 ${className ?? ''}`}>
      <Link href='/'>
        <Image src='/images/icon.png' alt='Logo' width={180} height={0} unoptimized/>
      </Link>
    </div>
  );
};

export default Rekberds;
