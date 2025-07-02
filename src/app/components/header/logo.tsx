import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';

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
      <Image
        width={28}
        height={28}
        src="/icons/logo.svg"
        alt="LearnLingo logo"
        priority
      />
      <span className="text-dark text-xl leading-[1.2] font-medium tracking-[-0.02em]">
        LearnLingo
      </span>
    </div>
  );
}
