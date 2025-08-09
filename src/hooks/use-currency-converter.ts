import { useQuery } from '@tanstack/react-query';
import { getCurrencyRates } from '@/lib/api/currency-api';
import { useCurrency } from '@/contexts/currency-context';
import { CURRENCIES, CurrencyCode } from '@/lib/constants/currency';

/**
 * Хук для конвертації валют та форматування цін
 */
export function useCurrencyConverter() {
  const { currency } = useCurrency();

  const {
    data: currencyData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['currencyRates'],
    queryFn: getCurrencyRates,
    staleTime: 30 * 60 * 1000, // 30 хвилин
    gcTime: 60 * 60 * 1000, // 1 година
    retry: 3,
    retryDelay: 1000,
  });

  const convertPrice = (
    priceInUSD: number,
    targetCurrency: CurrencyCode = currency,
  ): { amount: number; symbol: string } => {
    // USD - повертаємо як є
    if (targetCurrency === 'USD') {
      return {
        amount: priceInUSD,
        symbol: CURRENCIES.USD.symbol,
      };
    }

    // UAH - конвертуємо за курсом
    if (targetCurrency === 'UAH') {
      if (!currencyData?.usdRate?.rateSell) {
        // Якщо курс не завантажено, показуємо в USD
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

    // Fallback до USD
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
