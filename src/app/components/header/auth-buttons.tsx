'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/ui/button';
import clsx from 'clsx';
import LogInIcon from '@/lib/icons/log-in.svg';

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
        <LogInIcon className="h-5 w-5" role="img" aria-label="Log In" />
        <span className="text-base leading-5">Log in</span>
      </Button>

      <Button
        className="bg-dark hover:text-dark px-[2.8cqw] py-[14px] text-white"
        onClick={() => router.push('/signup', { scroll: false })}
      >
        <span className="text-base leading-5">Registration</span>
      </Button>
    </div>
  );
}
