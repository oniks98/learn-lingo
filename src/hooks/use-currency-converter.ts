// src/hooks/use-currency-converter.ts
import { useQuery } from '@tanstack/react-query';
import { getCurrencyRates } from '@/lib/api/currency-api';
import { useCurrency } from '@/contexts/currency-context';
import { CURRENCIES, CurrencyCode } from '@/lib/constants/currency';

export function useCurrencyConverter() {
  const { currency } = useCurrency();

  const {
    data: currencyData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['currencyRates'],
    queryFn: getCurrencyRates,
    staleTime: 30 * 60 * 1000, // 30 минут
    gcTime: 60 * 60 * 1000, // 1 час
    retry: 3,
    retryDelay: 1000,
  });

  const convertPrice = (
    priceInUSD: number,
    targetCurrency: CurrencyCode = currency,
  ): { amount: number; symbol: string } => {
    if (targetCurrency === 'USD') {
      return {
        amount: priceInUSD,
        symbol: CURRENCIES.USD.symbol,
      };
    }

    if (targetCurrency === 'UAH') {
      if (!currencyData?.usdRate?.rateSell) {
        // Если курс не загружен, показываем в USD
        return {
          amount: priceInUSD,
          symbol: CURRENCIES.USD.symbol,
        };
      }

      const rate = parseFloat(currencyData.usdRate.rateSell);
      const convertedAmount = Math.round(priceInUSD * rate);

      return {
        amount: convertedAmount,
        symbol: CURRENCIES.UAH.symbol,
      };
    }

    // Fallback to USD
    return {
      amount: priceInUSD,
      symbol: CURRENCIES.USD.symbol,
    };
  };

  const formatPrice = (
    priceInUSD: number,
    targetCurrency: CurrencyCode = currency,
  ): string => {
    const { amount, symbol } = convertPrice(priceInUSD, targetCurrency);

    if (targetCurrency === 'UAH') {
      return `${amount}${symbol}`;
    }

    return `${amount}${symbol}`;
  };

  const getCurrentRate = (): number | null => {
    if (!currencyData?.usdRate?.rateSell) {
      return null;
    }
    return parseFloat(currencyData.usdRate.rateSell);
  };

  return {
    convertPrice,
    formatPrice,
    getCurrentRate,
    isLoading,
    error,
    currency,
  };
}
