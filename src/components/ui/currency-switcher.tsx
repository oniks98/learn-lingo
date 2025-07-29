// src/components/ui/currency-switcher.tsx
'use client';

import React from 'react';
import { useCurrency } from '@/contexts/currency-context';
import { CURRENCIES, CurrencyCode } from '@/lib/constants/currency';
import clsx from 'clsx';

interface CurrencySwitcherProps {
  className?: string;
}

export default function CurrencySwitcher({ className }: CurrencySwitcherProps) {
  const { currency, setCurrency, isLoading } = useCurrency();

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    if (newCurrency !== currency) {
      setCurrency(newCurrency);
    }
  };

  if (isLoading) {
    return (
      <div className={clsx('flex items-center gap-1', className)}>
        <div className="h-8 w-12 animate-pulse rounded bg-gray-200" />
        <div className="h-8 w-12 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  return (
    <div className={clsx('flex items-center gap-3', className)}>
      {Object.entries(CURRENCIES).map(([code, currencyInfo]) => (
        <button
          key={code}
          onClick={() => handleCurrencyChange(code as CurrencyCode)}
          className={clsx(
            'rounded-xl px-5 py-[14px] transition-all duration-200',
            'hover:bg-yellow',
            currency === code ? 'bg-yellow' : 'bg-gray-muted',
          )}
          aria-label={`Switch to ${currencyInfo.name}`}
        >
          {currencyInfo.symbol} {code}
        </button>
      ))}
    </div>
  );
}
