// src/components/teachers/teachers-list.tsx
'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import { motion, Variants } from 'framer-motion';
import { getAllTeachers } from '@/lib/api/teachers';
import { filterTeachers } from '@/lib/utils/filter-teachers';
import { useUrlFilters } from '@/hooks/use-url-filters';
import { TeacherPreview } from '@/lib/types/types';
import FilterPanel, { FiltersForm } from '@/components/ui/filter-panel';
import TeacherCard from '@/components/teachers/teacher-card';
import Loader from '@/components/ui/loader';
import Button from '@/components/ui/button';

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.3,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      duration: 1.2,
      bounce: 0.3,
    },
  },
};

const loadMoreVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

const noResultsVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
};

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

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <h1 className="sr-only">{t('teachers.listTitle')}</h1>
          {teachersLoading ? (
            <Loader />
          ) : visibleTeachers.length === 0 ? (
            <motion.div variants={noResultsVariants}>
              <p>{t('teachers.noTeachersFound')}</p>
            </motion.div>
          ) : (
            <>
              <motion.div className="grid gap-6" variants={containerVariants}>
                {visibleTeachers.map((teacher) => (
                  <motion.div
                    key={teacher.id}
                    variants={cardVariants}
                    viewport={{ once: true, margin: '1%' }}
                    whileInView="visible"
                    initial="hidden"
                  >
                    <TeacherCard level={filters.level} teacher={teacher} />
                  </motion.div>
                ))}
              </motion.div>

              {hasMore && (
                <motion.div
                  className="mt-8 text-center"
                  variants={loadMoreVariants}
                  viewport={{ once: true, margin: '1%' }}
                  whileInView="visible"
                  initial="hidden"
                >
                  <Button onClick={handleLoadMore}>
                    {t('teachers.loadMore')}
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
