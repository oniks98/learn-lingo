// src/app/components/ui/teachers-list.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllTeachers } from '@/lib/db/teachers';
import { filterTeachers } from '@/lib/utils/filter-teachers';
import { TeacherPreview } from '@/lib/types/types';
import FilterPanel, { FiltersForm } from '@/components/ui/filter-panel';
import TeacherCard from '@/components/ui/teacher-card';
import Loader from '@/components/ui/loader';
import Button from '@/components/ui/button';
import ScrollToTopButton from '@/components/ui/ScrollToTopButton';

export default function TeachersList() {
  const [filters, setFilters] = useState<FiltersForm>({
    language: '',
    level: '',
    price: '',
  });

  const [visibleCount, setVisibleCount] = useState(4);

  const { data: allTeachers = [], isLoading } = useQuery<TeacherPreview[]>({
    queryKey: ['teachers'],
    queryFn: getAllTeachers,
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

  const handleFilterChange = (newFilters: FiltersForm) => {
    setFilters(newFilters);
    setVisibleCount(4);
  };

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
    <main className="mx-auto max-w-338 px-5 pb-5">
      <div className="bg-gray-light mx-auto rounded-3xl px-5 pb-5">
        <FilterPanel onChange={handleFilterChange} />

        <>
          <h1 className="sr-only">List teachers</h1>
          {isLoading ? (
            <Loader />
          ) : visibleTeachers.length === 0 ? (
            <p>No teachers found.</p>
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
                <div className="mt-8 grid justify-center">
                  <Button onClick={handleLoadMore}>Load More</Button>
                </div>
              )}
            </>
          )}
        </>

        <ScrollToTopButton />
      </div>
    </main>
  );
}
