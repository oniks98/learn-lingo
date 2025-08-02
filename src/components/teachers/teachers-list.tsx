'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import { getAllTeachers } from '@/lib/api/teachers';
import { filterTeachers } from '@/lib/utils/filter-teachers';
import { useUrlFilters } from '@/hooks/use-url-filters';
import { TeacherPreview } from '@/lib/types/types';
import FilterPanel, { FiltersForm } from '@/components/ui/filter-panel';
import TeacherCard from '@/components/teachers/teacher-card';
import Loader from '@/components/ui/loader';
import Button from '@/components/ui/button';

export default function TeachersList() {
  const t = useTranslations();
  const locale = useLocale();
  const {
    filters,
    setFilters,
    applyFilters,
    isLoading: filtersLoading,
  } = useUrlFilters();

  const [visibleCount, setVisibleCount] = useState(4);

  const { data: allTeachers = [], isLoading: teachersLoading } = useQuery<
    TeacherPreview[]
  >({
    queryKey: ['teachers', locale],
    queryFn: () => getAllTeachers(locale),
  });

  const filteredTeachers = useMemo(() => {
    return filterTeachers(allTeachers, {
      language: filters.language || undefined,
      level: filters.level || undefined,
      price: filters.price
        ? parseFloat(filters.price.replace(' $', ''))
        : undefined,
    });
  }, [allTeachers, filters]);

  const visibleTeachers = useMemo(
    () => filteredTeachers.slice(0, visibleCount),
    [filteredTeachers, visibleCount],
  );

  // Обработчик изменения фильтров (сохраняет в localStorage, НЕ обновляет URL)
  const handleFilterChange = useCallback(
    (newFilters: FiltersForm) => {
      setFilters(newFilters);
      setVisibleCount(4);
    },
    [setFilters],
  );

  // Обработчик применения фильтров (сохраняет в localStorage И обновляет URL)
  const handleApplyFilters = useCallback(
    (newFilters: FiltersForm) => {
      applyFilters(newFilters);
      setVisibleCount(4);
    },
    [applyFilters],
  );

  const handleLoadMore = () => {
    setVisibleCount((prev) => {
      const newCount = prev + 4;

      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);

      return newCount;
    });
  };

  const hasMore = visibleCount < filteredTeachers.length;

  return (
    <section className="mx-auto max-w-338 px-5 pb-5">
      <div className="bg-gray-light mx-auto rounded-3xl px-5 pb-5">
        <FilterPanel
          initialFilters={filters}
          onChange={handleFilterChange}
          onApply={handleApplyFilters}
          isLoading={filtersLoading}
        />

        <>
          <h1 className="sr-only">{t('teachers.listTitle')}</h1>
          {teachersLoading ? (
            <Loader />
          ) : visibleTeachers.length === 0 ? (
            <p>{t('teachers.noTeachersFound')}</p>
          ) : (
            <>
              <div className="grid gap-6">
                {visibleTeachers.map((teacher) => (
                  <TeacherCard
                    key={teacher.id}
                    level={filters.level}
                    teacher={teacher}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 text-center">
                  <Button onClick={handleLoadMore}>
                    {t('teachers.loadMore')}
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      </div>
    </section>
  );
}
