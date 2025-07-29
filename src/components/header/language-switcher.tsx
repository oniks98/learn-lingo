'use client';

import React from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import clsx from 'clsx';

export interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const handleLanguageChange = (locale: string) => {
    router.push(pathname, { locale });
  };

  return (
    <div className={clsx('flex items-center gap-1 px-3', className)}>
      <button
        onClick={() => handleLanguageChange('en')}
        className={clsx(
          'rounded-md px-3 py-1 text-sm font-medium transition-colors',
          currentLocale === 'en'
            ? 'bg-yellow text-black'
            : 'text-dark hover:text-yellow',
        )}
      >
        EN
      </button>
      <span className="text-dark-70">|</span>
      <button
        onClick={() => handleLanguageChange('uk')}
        className={clsx(
          'rounded-md px-3 py-1 text-sm font-medium transition-colors',
          currentLocale === 'uk'
            ? 'bg-yellow text-black'
            : 'text-dark hover:text-yellow',
        )}
      >
        UK
      </button>
    </div>
  );
}
