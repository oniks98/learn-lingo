// src/components/bookings/bookings-list.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { getBookings } from '@/lib/api/bookings';
import BookingCard from '@/components/bookings/booking-card';
import Loader from '@/components/ui/loader';
import Button from '@/components/ui/button';

export default function BookingsList() {
  const t = useTranslations();
  const [visibleCount, setVisibleCount] = useState(4);

  // Fetch bookings data
  const {
    data: bookingsData,
    isLoading,
    error: bookingsError,
  } = useQuery({
    queryKey: ['bookings'],
    queryFn: getBookings,
  });

  const allBookings = useMemo(() => {
    return bookingsData?.bookings || [];
  }, [bookingsData]);

  // Sort bookings by creation date (newest first)
  const sortedBookings = useMemo(() => {
    return [...allBookings].sort((a, b) => b.createdAt - a.createdAt);
  }, [allBookings]);

  const visibleBookings = useMemo(
    () => sortedBookings.slice(0, visibleCount),
    [sortedBookings, visibleCount],
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

  const hasMore = visibleCount < sortedBookings.length;

  if (isLoading) {
    return (
      <section className="mx-auto max-w-338 px-5 pb-5">
        <div className="bg-gray-light mx-auto rounded-3xl px-5 py-16">
          <Loader />
        </div>
      </section>
    );
  }

  if (bookingsError) {
    return (
      <section className="mx-auto max-w-338 px-5 pb-5">
        <div className="bg-gray-light mx-auto rounded-3xl px-5 py-16">
          <div className="text-center">
            <p className="mb-4 text-red-500">{t('bookings.errorLoading')}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-yellow hover:bg-yellow/80 rounded px-4 py-2 text-white"
            >
              {t('bookings.tryAgain')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-338 px-5 pb-5">
      <div className="bg-gray-light mx-auto rounded-3xl px-5 pt-8 pb-5">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            {t('bookings.title')}
          </h1>
          <p className="text-gray-600">
            {allBookings.length > 0
              ? t('bookings.countMessage', { count: allBookings.length })
              : t('bookings.noBookingsYet')}
          </p>
        </div>

        {allBookings.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-24 w-24 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-medium text-gray-800">
              {t('bookings.emptyState.title')}
            </h3>
            <p className="mb-6 text-gray-600">
              {t('bookings.emptyState.description')}
            </p>
            <a
              href="/teachers"
              className="bg-yellow hover:bg-yellow/80 inline-flex items-center rounded-lg px-6 py-3 font-medium text-black transition-colors"
            >
              {t('bookings.emptyState.browseTeachers')}
            </a>
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {visibleBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 text-center">
                <Button onClick={handleLoadMore}>
                  {t('bookings.loadMore')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
