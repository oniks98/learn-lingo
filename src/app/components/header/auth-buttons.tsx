'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/ui/button';
import clsx from 'clsx';
import Image from 'next/image';

export interface AuthButtonsProps {
  className?: string;
}

export default function AuthButtons({ className }: AuthButtonsProps) {
  const router = useRouter();
  return (
    <div className={clsx('grid-cols-[repeat(2,auto)] items-center', className)}>
      <Button
        className="grid h-13 grid-cols-[20px_1fr] items-center gap-2 bg-white px-4 py-[14px]"
        onClick={() => router.push('/login', { scroll: false })}
      >
        <Image
          width={20}
          height={20}
          src="/icons/log-in.svg"
          alt="Log In"
          priority
        />
        <span className="text-dark text-base leading-5 font-bold">Log in</span>
      </Button>

      <Button
        className="bg-dark hover:text-dark px-[39px] py-[14px] text-white"
        onClick={() => router.push('/signup', { scroll: false })}
      >
        <span className="text-base leading-5 font-bold">Registration</span>
      </Button>
    </div>
  );
}
