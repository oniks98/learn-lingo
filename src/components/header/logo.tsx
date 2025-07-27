// src/components/header/logo.tsx
import React from 'react';
import clsx from 'clsx';
import LogoIcon from '@/lib/icons/logo.svg';

export interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <div
      className={clsx(
        'grid grid-cols-[28px_1fr] items-center gap-2',
        className,
      )}
    >
      <LogoIcon
        className="h-[28px] w-[28px]"
        role="img"
        aria-label="LearnLingo logo"
      />
      <span className="text-dark text-xl leading-[1.2] font-medium tracking-[-0.02em]">
        LearnLingo
      </span>
    </div>
  );
}
