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

  // Статичная отрисовка кнопок без ожидания контекста
  // Это предотвращает мерцание при загрузке страницы
  return (
    <div className={clsx('flex items-center gap-3', className)}>
      {Object.entries(CURRENCIES).map(([code, currencyInfo]) => (
        <button
          key={code}
          onClick={() => handleCurrencyChange(code as CurrencyCode)}
          disabled={isLoading}
          className={clsx(
            'rounded-xl px-5 py-[14px] transition-all duration-200',
            'hover:bg-yellow disabled:cursor-wait disabled:opacity-75',
            // Используем fallback если контекст еще не загружен
            !isLoading && currency === code ? 'bg-yellow' : 'bg-gray-muted',
            // При загрузке показываем USD как активный по умолчанию
            isLoading && code === 'USD'
              ? 'bg-yellow'
              : isLoading
                ? 'bg-gray-muted'
                : '',
          )}
          aria-label={`Switch to ${currencyInfo.name}`}
        >
          {currencyInfo.symbol} {code}
        </button>
      ))}
    </div>
  );
}
