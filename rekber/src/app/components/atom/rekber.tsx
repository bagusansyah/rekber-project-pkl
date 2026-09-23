import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface RekberProps {
  className?: string;
}

const Rekber: React.FC<RekberProps> = ({ className }) => {
  return (
    <div className={`flex justify-center items-center space-x-2 ${className ?? ''}`}>
      <Link href='/'>
        <Image src='/images/logo.png' alt="Logo"  width={180}  height={0} style={{ height: 'auto' }} unoptimized/>
      </Link>
    </div>
  );
};

export default Rekber;
