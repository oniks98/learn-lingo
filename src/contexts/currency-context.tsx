// src/contexts/currency-context.tsx
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from 'react';
import {
  CurrencyCode,
  DEFAULT_CURRENCY,
  CURRENCY_STORAGE_KEY,
} from '@/lib/constants/currency';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем сохраненную валюту при инициализации
  useEffect(() => {
    const savedCurrency = localStorage.getItem(
      CURRENCY_STORAGE_KEY,
    ) as CurrencyCode;
    if (savedCurrency && (savedCurrency === 'USD' || savedCurrency === 'UAH')) {
      setCurrencyState(savedCurrency);
    }
    setIsLoading(false);
  }, []);

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
  };

  const value = useMemo<CurrencyContextType>(
    () => ({
      currency,
      setCurrency,
      isLoading,
    }),
    [currency, isLoading],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
