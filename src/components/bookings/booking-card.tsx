// src/app/components/ui/booking-card.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookingData, TeacherPreview } from '@/lib/types/types';
import { getAllTeachers } from '@/lib/api/teachers';
import { deleteBooking } from '@/lib/api/bookings';
import { useFavoriteStatus, useToggleFavorite } from '@/hooks/use-favorites';
import { useCurrencyConverter } from '@/hooks/use-currency-converter';
import Loader from '@/components/ui/loader';
import Image from 'next/image';
import OnlineIcon from '@/lib/icons/online.svg';
import HeartIcon from '@/lib/icons/heart';
import Button from '@/components/ui/button';
import ConfirmDeleteModal from '@/components/modal/confirm-delete-modal';
import clsx from 'clsx';

type Props = {
  booking: BookingData;
};

export default function BookingCard({ booking }: Props) {
  const queryClient = useQueryClient();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Currency converter hook
  const { formatPrice: formatCurrencyPrice } = useCurrencyConverter();

  const { data: teachers, isLoading: isLoadingTeachers } = useQuery<
    TeacherPreview[]
  >({
    queryKey: ['teachers'],
    queryFn: getAllTeachers,
  });

  const teacher = teachers?.find((t) => t.id === booking.teacherId) || null;
  const isLoadingTeacher = isLoadingTeachers;

  // Добавляем логику избранного
  const { data: isFavorite = false } = useFavoriteStatus(booking.teacherId);
  const { toggleFavorite, isLoading: isFavoriteLoading } = useToggleFavorite();

  const deleteBookingMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const handleDeleteClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteBookingMutation.mutate(booking.id);
    setIsConfirmOpen(false);
  };

  const handleFavoriteClick = () => {
    // На странице bookings пользователь уже залогинен и подтвержден
    toggleFavorite(booking.teacherId, isFavorite);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatBookingDateTime = (dateValue: Date | string) => {
    // Правильно обрабатываем и Date объекты, и строки
    const date =
      typeof dateValue === 'string' ? new Date(dateValue) : dateValue;

    // Проверяем, что дата валидна
    if (isNaN(date.getTime())) {
      return { date: 'Invalid Date', time: '' };
    }

    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // 24-часовой формат
    });

    return {
      date: formattedDate,
      time: formattedTime,
    };
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const bookingDateTime = formatBookingDateTime(booking.bookingDate);

  return (
    <>
      <section
        className={clsx(
          'rounded-xl bg-white p-6 shadow transition-all duration-300',
        )}
      >
        <div
          className={clsx(
            '@container grid gap-x-[3.92cqw]',
            'md:grid-cols-[120px_1fr] md:grid-rows-[auto_56px_repeat(4,auto)]',
            'xl:grid-rows-[32px_56px_repeat(4,auto)]',
          )}
        >
          {/* Teacher Avatar */}
          <div
            className={clsx(
              'border-yellow relative mb-[2.61cqw]',
              'grid h-30 w-30 place-items-center justify-self-center',
              'rounded-full border-3 sm:row-1 md:row-[1/3]',
            )}
          >
            {isLoadingTeacher ? (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
                <Loader />
              </div>
            ) : teacher ? (
              <>
                <Image
                  width={96}
                  height={96}
                  src={teacher.avatar_url}
                  alt={`${teacher.name} ${teacher.surname}`}
                  className="rounded-full"
                />
                <OnlineIcon
                  className="absolute top-[19px] right-[23px] h-3 w-3"
                  aria-hidden="true"
                />
              </>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
                <span className="text-sm text-gray-500">No Photo</span>
              </div>
            )}
          </div>

          {/* Booking Header Info */}
          <div
            className={clsx(
              'mb-2 flex flex-wrap items-center justify-between self-start',
              'md:col-2 md:row-1',
            )}
          >
            <span className="text-gray-muted font-medium">Booking</span>
            <button
              onClick={handleFavoriteClick}
              disabled={isFavoriteLoading}
              className={clsx(
                'text-right transition-all duration-200',
                'hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50',
                isFavoriteLoading && 'animate-pulse',
              )}
              aria-label={
                isFavorite ? 'Remove from favorites' : 'Add to favorites'
              }
            >
              <HeartIcon
                className={clsx(
                  'inline-block h-[26px] w-[26px] transition-colors duration-200',
                  isFavorite
                    ? 'fill-yellow stroke-yellow'
                    : 'hover:text-yellow fill-none text-black',
                )}
              />
            </button>
          </div>

          {/* Teacher Name */}
          <h2
            className={clsx(
              'row-2 mb-[2.61cqw] text-2xl font-medium',
              'sm:justify-self-center md:col-2 md:justify-self-start',
            )}
          >
            {teacher ? `${teacher.name} ${teacher.surname}` : 'Loading...'}
          </h2>

          {/* Main Booking Information */}
          <ul
            className={clsx(
              'mb-2 grid gap-2 font-medium',
              'md:col-[1/3] md:row-[3/4] xl:col-2 xl:row-3',
            )}
          >
            <li>
              <p>
                <span className="text-gray-muted">Reason:</span>{' '}
                {booking.reason}
              </p>
            </li>
            <li>
              <p>
                <span className="text-gray-muted">Lesson Date:</span>{' '}
                <span className="font-semibold text-blue-600">
                  {bookingDateTime.date}
                </span>
              </p>
            </li>
            <li>
              <p>
                <span className="text-gray-muted">Lesson Time:</span>{' '}
                <span className="font-semibold text-green-600">
                  {bookingDateTime.time}
                </span>
              </p>
            </li>
            {booking.comment && (
              <li>
                <p>
                  <span className="text-gray-muted">Comment:</span>{' '}
                  {booking.comment}
                </p>
              </li>
            )}
            <li>
              <p>
                <span className="text-gray-muted">Created:</span>{' '}
                {formatDate(booking.createdAt)}
              </p>
            </li>
            {teacher && (
              <>
                <li>
                  <p>
                    <span className="text-gray-muted">Price per hour:</span>{' '}
                    <span className="font-semibold text-green-600">
                      {formatCurrencyPrice(teacher.price_per_hour)}
                    </span>
                  </p>
                </li>
                <li>
                  <p>
                    <span className="text-gray-muted">Rating:</span>{' '}
                    <span className="font-semibold text-yellow-600">
                      ⭐ {formatRating(teacher.rating)}
                    </span>
                  </p>
                </li>
                <li>
                  <p>
                    <span className="text-gray-muted">Teacher Languages:</span>{' '}
                    <span className="underline">
                      {teacher.languages.join(', ')}
                    </span>
                  </p>
                </li>
              </>
            )}
          </ul>

          {/* Delete Button */}
          <Button
            className={clsx(
              'max-w-58 px-[3.55cqw]',
              'sm:justify-self-center',
              'md:col-[1/3] md:row-[7/8] md:justify-self-start',
              'xl:col-2 xl:row-7',
              deleteBookingMutation.isPending &&
                'cursor-not-allowed opacity-50',
            )}
            onClick={handleDeleteClick}
            disabled={deleteBookingMutation.isPending}
          >
            <span className="leading-[1.56]">
              {deleteBookingMutation.isPending
                ? 'Deleting...'
                : 'Delete booking'}
            </span>
          </Button>
        </div>
      </section>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isConfirmOpen}
        onCloseAction={() => setIsConfirmOpen(false)}
        onConfirmAction={handleConfirmDelete}
        isLoading={deleteBookingMutation.isPending}
      />
    </>
  );
}
