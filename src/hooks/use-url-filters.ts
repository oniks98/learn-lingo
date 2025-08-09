'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FiltersForm } from '@/components/ui/filter-panel';

const FILTERS_STORAGE_KEY = 'teachersFilters';

interface UseUrlFiltersReturn {
  filters: FiltersForm;
  setFilters: (filters: FiltersForm) => void;
  applyFilters: (filters: FiltersForm) => void;
  isLoading: boolean;
}

/**
 * Хук для управління фільтрами з синхронізацією URL та localStorage
 */
export function useUrlFilters(): UseUrlFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFiltersState] = useState<FiltersForm>({
    language: '',
    level: '',
    price: '',
  });

  // Ініціалізація фільтрів з URL та localStorage
  useEffect(() => {
    const urlLanguage = searchParams.get('language') || '';
    const urlLevel = searchParams.get('level') || '';
    const urlPrice = searchParams.get('price') || '';

    // Якщо є параметри в URL, використовуємо їх
    if (urlLanguage || urlLevel || urlPrice) {
      const urlFilters: FiltersForm = {
        language: urlLanguage,
        level: urlLevel,
        price: urlPrice,
      };
      setFiltersState(urlFilters);

      // Зберігаємо в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(urlFilters));
      }
    } else {
      // Якщо немає параметрів в URL, завантажуємо з localStorage
      if (typeof window !== 'undefined') {
        try {
          const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
          if (savedFilters) {
            const parsedFilters: FiltersForm = JSON.parse(savedFilters);
            setFiltersState(parsedFilters);
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error loading filters from localStorage:', error);
          }
        }
      }
    }

    setIsLoading(false);
  }, [searchParams, pathname]);

  const updateUrl = (newFilters: FiltersForm) => {
    const params = new URLSearchParams();

    if (newFilters.language) params.set('language', newFilters.language);
    if (newFilters.level) params.set('level', newFilters.level);
    if (newFilters.price) params.set('price', newFilters.price);

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    // Використовуємо replace щоб не додавати записи в історію браузера
    router.replace(newUrl, { scroll: false });
  };

  // Оновлює фільтри та localStorage БЕЗ оновлення URL
  const setFilters = (newFilters: FiltersForm) => {
    setFiltersState(newFilters);

    // Зберігаємо в localStorage при кожній зміні
    if (typeof window !== 'undefined') {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(newFilters));
    }
  };

  // Застосовує фільтри з оновленням URL (для кнопки "Пошук")
  const applyFilters = (newFilters: FiltersForm) => {
    setFiltersState(newFilters);

    // Зберігаємо в localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(newFilters));
    }

    // Оновлюємо URL
    updateUrl(newFilters);
  };

  return {
    filters,
    setFilters,
    applyFilters,
    isLoading,
  };
}
