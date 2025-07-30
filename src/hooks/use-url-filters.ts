// src/hooks/use-url-filters.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FiltersForm } from '@/components/ui/filter-panel';

const FILTERS_STORAGE_KEY = 'teachersFilters';

interface UseUrlFiltersReturn {
  filters: FiltersForm;
  setFilters: (filters: FiltersForm) => void;
  applyFilters: (filters: FiltersForm) => void; // Новый метод для применения фильтров с обновлением URL
  isLoading: boolean;
}

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

  // Инициализация фильтров из URL и localStorage
  useEffect(() => {
    const urlLanguage = searchParams.get('language') || '';
    const urlLevel = searchParams.get('level') || '';
    const urlPrice = searchParams.get('price') || '';

    // Если есть параметры в URL, используем их
    if (urlLanguage || urlLevel || urlPrice) {
      const urlFilters: FiltersForm = {
        language: urlLanguage,
        level: urlLevel,
        price: urlPrice,
      };
      setFiltersState(urlFilters);

      // Сохраняем в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(urlFilters));
      }
    } else {
      // Если нет параметров в URL, пробуем загрузить из localStorage
      if (typeof window !== 'undefined') {
        try {
          const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
          if (savedFilters) {
            const parsedFilters: FiltersForm = JSON.parse(savedFilters);
            setFiltersState(parsedFilters);
            // НЕ обновляем URL при загрузке из localStorage
          }
        } catch (error) {
          console.error('Error loading filters from localStorage:', error);
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

    // Используем replace чтобы не добавлять записи в историю браузера
    router.replace(newUrl, { scroll: false });
  };

  // Обновляет фильтры и localStorage БЕЗ обновления URL
  const setFilters = (newFilters: FiltersForm) => {
    setFiltersState(newFilters);

    // Сохраняем в localStorage при каждом изменении
    if (typeof window !== 'undefined') {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(newFilters));
    }
  };

  // Применяет фильтры с обновлением URL (для кнопки "Поиск")
  const applyFilters = (newFilters: FiltersForm) => {
    setFiltersState(newFilters);

    // Сохраняем в localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(newFilters));
    }

    // Обновляем URL
    updateUrl(newFilters);
  };

  return {
    filters,
    setFilters,
    applyFilters,
    isLoading,
  };
}
