interface CurrencyItem {
  currencyCodeA: number;
  currencyCodeB: number;
  rateBuy: number;
  rateSell: number;
}

interface CurrencyRate {
  rateBuy: string;
  rateSell: string;
}

interface CurrencyData {
  timestamp: number;
  usdRate: CurrencyRate | null;
}

const CURRENCY_CACHE_KEY = 'currencyRates';
const BASE_URL = 'https://api.monobank.ua/bank/currency';
const CACHE_DURATION = 3600000; // 1 година

const fetchCurrencyData = async (): Promise<CurrencyItem[]> => {
  const response = await fetch(BASE_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // Кешуємо на 5 хвилин на рівні браузера
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch currency data: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
};

const getCachedCurrencyData = (): CurrencyData | null => {
  if (typeof window === 'undefined') return null;

  try {
    const cachedData = localStorage.getItem(CURRENCY_CACHE_KEY);
    if (!cachedData) return null;

    const parsed: CurrencyData = JSON.parse(cachedData);
    if (parsed && Date.now() - parsed.timestamp < CACHE_DURATION) {
      return parsed;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error reading cached currency data:', error);
    }
  }
  return null;
};

const cacheCurrencyData = (data: CurrencyItem[]): CurrencyData => {
  const now = Date.now();
  // Знаходимо USD курс (840 - USD, 980 - UAH)
  const usd = data.find(
    (item) => item.currencyCodeA === 840 && item.currencyCodeB === 980,
  );

  const currencyData: CurrencyData = {
    timestamp: now,
    usdRate: usd
      ? {
          rateBuy: usd.rateBuy.toFixed(2),
          rateSell: usd.rateSell.toFixed(2),
        }
      : null,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CURRENCY_CACHE_KEY, JSON.stringify(currencyData));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error caching currency data:', error);
      }
    }
  }

  return currencyData;
};

/**
 * Отримання курсів валют з кешуванням
 */
export const getCurrencyRates = async (): Promise<CurrencyData> => {
  // Перевіряємо кеш
  const cachedData = getCachedCurrencyData();
  if (cachedData?.usdRate) {
    return cachedData;
  }

  // Отримуємо свіжі дані
  const data = await fetchCurrencyData();
  const currencyData = cacheCurrencyData(data);

  if (!currencyData.usdRate) {
    // Fallback дані якщо USD курс не знайдено
    return {
      timestamp: Date.now(),
      usdRate: {
        rateBuy: '40.00',
        rateSell: '41.00',
      },
    };
  }

  return currencyData;
};
