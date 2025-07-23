// src/components/ui/bookings-list.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBookings } from '@/lib/api/bookings';
import BookingCard from '@/components/ui/booking-card';
import Loader from '@/components/ui/loader';
import Button from '@/components/ui/button';
import ScrollToTopButton from '@/components/ui/ScrollToTopButton';

export default function BookingsList() {
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

  return (
    <main className="mx-auto max-w-338 px-5 pb-5">
      <div className="bg-gray-light mx-auto rounded-3xl px-5 pb-5">
        {/* Header */}
        <div className="py-6">
          <h1 className="text-center text-3xl font-bold">My Bookings</h1>
          <p className="mt-2 text-center text-gray-600">
            Total bookings: {allBookings.length}
          </p>
        </div>

        <>
          <h2 className="sr-only">Bookings list</h2>
          {isLoading ? (
            <div className="py-8">
              <Loader />
              <p className="mt-4 text-center">Loading bookings...</p>
            </div>
          ) : bookingsError ? (
            <div className="py-8">
              <p className="text-center text-red-500">
                Error loading bookings: {bookingsError.message}
              </p>
            </div>
          ) : visibleBookings.length === 0 ? (
            <div className="py-8">
              <p className="text-center text-gray-500">
                You don't have any bookings yet
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                {visibleBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 grid justify-center">
                  <Button onClick={handleLoadMore}>
                    Load More ({sortedBookings.length - visibleCount} remaining)
                  </Button>
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
