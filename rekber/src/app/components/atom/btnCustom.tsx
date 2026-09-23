import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type BtnCustomProps = {
  href?: string;
  children: React.ReactNode;
  buttonClassName?: string;
  [key: string]: unknown;
};

const BtnCustom: React.FC<BtnCustomProps> = ({
  href,
  children,
  buttonClassName = '',
  ...rest
}) => {
  const button = (
    <Button
      size='lg'
      className={`bg-blue-600 hover:bg-blue-700 text-white cursor-pointer px-6 py-6 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 ${buttonClassName}`}
      {...rest}
    >
      {children}
    </Button>
  );

  return href ? <Link href={href}>{button}</Link> : button;
};

export default BtnCustom;
