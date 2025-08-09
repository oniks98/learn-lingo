'use client';

import React from 'react';
import { clsx } from 'clsx';
import { useCurrency } from '@/contexts/currency-context';
import { CURRENCIES, CurrencyCode } from '@/lib/constants/currency';

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

  // Статична відрисовка кнопок без очікування контексту
  // Це запобігає мерехтінню при завантаженні сторінки
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      {Object.entries(CURRENCIES).map(([code, currencyInfo]) => (
        <button
          key={code}
          onClick={() => handleCurrencyChange(code as CurrencyCode)}
          disabled={isLoading}
          className={clsx(
            'rounded-xl px-4 py-[14px] transition-all duration-200',
            'hover:bg-yellow disabled:cursor-wait disabled:opacity-75',
            // Використовуємо fallback якщо контекст ще не завантажений
            !isLoading && currency === code ? 'bg-yellow' : 'bg-gray-muted',
            // При завантаженні показуємо USD як активний за замовчуванням
            isLoading && code === 'USD'
              ? 'bg-yellow'
              : isLoading
                ? 'bg-gray-muted'
                : '',
          )}
          aria-label={`Switch to ${currencyInfo.name}`}
        >
          {currencyInfo.symbol}
        </button>
      ))}
    </div>
  );
}
